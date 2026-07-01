import type { SupabaseClient } from '@supabase/supabase-js';

export interface CampaignDetectResult {
  linkedCampaignId: string;
  score: number;
  isNewCampaign: boolean;
}

/**
 * Computes the composite link score between two reports (PRD-301.6).
 * S_link = 0.50 * S_entity + 0.30 * S_template + 0.15 * S_temporal + 0.05 * S_geo
 */
export function calculateLinkScore(params: {
  sharedEntities: Array<{ type: string; value: string }>;
  templateSimilarity: number;
  daysDifference: number;
  sameGeo: boolean;
}): number {
  // 1. Entity Overlap Score (S_entity) using type-based rarity weights
  let entityScore = 0;
  for (const e of params.sharedEntities) {
    let rarity = 0.05; // default low entropy (gmail.com, brand name)
    if (e.type === 'wallet' || e.type === 'url') {
      rarity = 1.0; // high entropy
    } else if (e.type === 'phone' || e.type === 'email') {
      rarity = 0.5; // medium entropy
    }
    entityScore += rarity;
  }
  const sEntity = Math.min(1.0, entityScore);

  // 2. Template Similarity (S_template)
  const sTemplate = Math.max(0, Math.min(1.0, params.templateSimilarity));

  // 3. Temporal Proximity (S_temporal = exp(-0.05 * delta_days))
  const sTemporal = Math.exp(-0.05 * Math.abs(params.daysDifference));

  // 4. Geographic closeness (S_geo)
  const sGeo = params.sameGeo ? 1.0 : 0.2;

  // Composite Link Score
  return 0.5 * sEntity + 0.3 * sTemplate + 0.15 * sTemporal + 0.05 * sGeo;
}

/**
 * Processes recent reports and matches them into coordinated campaigns.
 */
export async function detectCampaignsForReport(
  sb: SupabaseClient,
  reportId: string
): Promise<CampaignDetectResult | null> {
  try {
    // 1) Fetch the target report details
    const { data: targetReport } = await sb
      .from('reports')
      .select('id, created_at, report_entities(entities(type, value_canonical))')
      .eq('id', reportId)
      .single();

    if (!targetReport) return null;

    const targetEntities = (targetReport.report_entities ?? []).map(
      (re: any) => re.entities
    ).filter(Boolean);

    // Get embedding for target report
    const { data: targetEmbedding } = await sb
      .from('embeddings')
      .select('embedding')
      .eq('owner_type', 'report')
      .eq('owner_id', reportId)
      .maybeSingle();

    const targetVector = targetEmbedding?.embedding;

    // 2) Fetch active campaigns to compare
    const { data: activeCampaigns } = await sb
      .from('campaigns')
      .select('id, status, campaign_reports(report_id)')
      .in('status', ['candidate', 'active']);

    for (const campaign of activeCampaigns ?? []) {
      const reportIds = (campaign.campaign_reports ?? []).map((cr: any) => cr.report_id);
      if (reportIds.length === 0) continue;

      // Fetch the reports in this campaign to calculate average link score
      const { data: campaignReports } = await sb
        .from('reports')
        .select('id, created_at, report_entities(entities(type, value_canonical))')
        .in('id', reportIds)
        .order('created_at', { ascending: false })
        .limit(5);

      if (!campaignReports || campaignReports.length === 0) continue;

      let totalScore = 0;
      let count = 0;

      for (const cr of campaignReports) {
        const crEntities = (cr.report_entities ?? []).map((e: any) => e.entities).filter(Boolean);
        const shared = targetEntities.filter((te: any) =>
          crEntities.some((ce: any) => ce.type === te.type && ce.value_canonical === te.value_canonical)
        );

        // Fetch template similarity if vectors exist
        let similarity = 0;
        if (targetVector) {
          const { data: crEmbedding } = await sb
            .from('embeddings')
            .select('embedding')
            .eq('owner_type', 'report')
            .eq('owner_id', cr.id)
            .maybeSingle();

          if (crEmbedding?.embedding && Array.isArray(targetVector) && Array.isArray(crEmbedding.embedding)) {
            // calculate cosine similarity
            const dot = targetVector.reduce((sum, val, idx) => sum + val * crEmbedding.embedding[idx], 0);
            const magA = Math.sqrt(targetVector.reduce((sum, val) => sum + val * val, 0));
            const magB = Math.sqrt(crEmbedding.embedding.reduce((sum, val) => sum + val * val, 0));
            similarity = dot / (magA * magB);
          }
        }

        const daysDiff =
          Math.abs(new Date(targetReport.created_at).getTime() - new Date(cr.created_at).getTime()) /
          (1000 * 60 * 60 * 24);

        const score = calculateLinkScore({
          sharedEntities: shared,
          templateSimilarity: similarity,
          daysDifference: daysDiff,
          sameGeo: false,
        });

        totalScore += score;
        count++;
      }

      const averageScore = totalScore / count;

      // Link Threshold (0.70)
      if (averageScore >= 0.7) {
        // Link to existing campaign
        await sb.from('campaign_reports').insert({
          campaign_id: campaign.id,
          report_id: reportId,
        });

        // Upsert campaign entities
        for (const te of targetEntities) {
          await sb.from('campaign_entities').upsert(
            { campaign_id: campaign.id, entity_id: te.id },
            { onConflict: 'campaign_id,entity_id' }
          );
        }

        // Auto-promote if score >= 0.85
        if (averageScore >= 0.85 && campaign.status === 'candidate') {
          await sb.from('campaigns').update({ status: 'active' }).eq('id', campaign.id);
        }

        return {
          linkedCampaignId: campaign.id,
          score: averageScore,
          isNewCampaign: false,
        };
      }
    }

    // 3) Compare against other unlinked reports in the last 30 days
    const { data: recentReports } = await sb
      .from('reports')
      .select('id, created_at, report_entities(entities(id, type, value_canonical))')
      .neq('id', reportId)
      .order('created_at', { ascending: false })
      .limit(50);

    for (const rr of recentReports ?? []) {
      const rrEntities = (rr.report_entities ?? []).map((e: any) => e.entities).filter(Boolean);
      const shared = targetEntities.filter((te: any) =>
        rrEntities.some((ce: any) => ce.type === te.type && ce.value_canonical === te.value_canonical)
      );

      let similarity = 0;
      if (targetVector) {
        const { data: rrEmbedding } = await sb
          .from('embeddings')
          .select('embedding')
          .eq('owner_type', 'report')
          .eq('owner_id', rr.id)
          .maybeSingle();

        if (rrEmbedding?.embedding && Array.isArray(targetVector) && Array.isArray(rrEmbedding.embedding)) {
          const dot = targetVector.reduce((sum, val, idx) => sum + val * rrEmbedding.embedding[idx], 0);
          const magA = Math.sqrt(targetVector.reduce((sum, val) => sum + val * val, 0));
          const magB = Math.sqrt(rrEmbedding.embedding.reduce((sum, val) => sum + val * val, 0));
          similarity = dot / (magA * magB);
        }
      }

      const daysDiff =
        Math.abs(new Date(targetReport.created_at).getTime() - new Date(rr.created_at).getTime()) /
        (1000 * 60 * 60 * 24);

      const score = calculateLinkScore({
        sharedEntities: shared,
        templateSimilarity: similarity,
        daysDifference: daysDiff,
        sameGeo: false,
      });

      if (score >= 0.7) {
        // Create new Campaign
        const { data: newCampaign } = await sb
          .from('campaigns')
          .insert({
            title: `Coordinated Campaign - Shared indicator`,
            status: score >= 0.85 ? 'active' : 'candidate',
            confidence: score,
          })
          .select('id')
          .single();

        if (newCampaign) {
          // Link both reports
          await sb.from('campaign_reports').insert([
            { campaign_id: newCampaign.id, report_id: reportId },
            { campaign_id: newCampaign.id, report_id: rr.id },
          ]);

          // Link entities
          const allEntities = [...targetEntities, ...rrEntities];
          const uniqueEntityIds = Array.from(new Set(allEntities.map((e) => e.id)));
          for (const eid of uniqueEntityIds) {
            if (!eid) continue;
            await sb.from('campaign_entities').insert({
              campaign_id: newCampaign.id,
              entity_id: eid,
            });
          }

          return {
            linkedCampaignId: newCampaign.id,
            score,
            isNewCampaign: true,
          };
        }
      }
    }
  } catch (err) {
    console.error("CAMPAIGN ERROR:", err);
  }

  return null;
}
