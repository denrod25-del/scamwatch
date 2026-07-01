import type { SupabaseClient } from '@supabase/supabase-js';

import { extractEntitiesHybrid } from '@/shared/entities/extractEntitiesHybrid';
import { classifyReport, classifyThreats } from '@/infrastructure/ai/classify';
import { detectCampaignsForReport } from '@/modules/campaigns/detect';
import { isJpeg, stripJpegExif } from './exif';
import { IntelligenceObject } from '@/modules/intelligence/IntelligenceObject';
import { IntelligenceEngine } from '@/modules/intelligence/IntelligenceEngine';
import { PipelineContext, PipelineStage } from '@/modules/intelligence/Pipeline';
import { confidenceService, reasoningService } from '@/modules/intelligence/services';
import type { Verdict } from '@/types';

const BUCKET = 'report-media';

const VERDICT_ENUM: Record<Verdict, string> = {
  'Likely Safe': 'likely_safe',
  'No Signal': 'no_signal',
  'Use Caution': 'use_caution',
  'Likely Scam': 'likely_scam',
  'Confirmed Reported Scam': 'confirmed_reported_scam',
};

export interface ProcessResult {
  reportId: string;
  status: string;
  entitiesAdded: number;
  mediaProcessed: number;
  verdict: Verdict;
  abstained: boolean;
}

/**
 * Process one report (SIE pipeline). Claims it atomically (received → processing),
 * strips EXIF from JPEG evidence, extracts + links entities, runs RAG classification,
 * compiles reasoning nodes, logs multi-dimensional confidence metrics, and hands off to review.
 */
export async function processReport(
  sb: SupabaseClient,
  reportId: string
): Promise<ProcessResult | null> {
  const { data: claimed } = await sb
    .from('reports')
    .update({ status: 'processing' })
    .eq('id', reportId)
    .eq('status', 'received')
    .select('id, raw_text, channel')
    .maybeSingle();
  if (!claimed) return null;

  const text = (claimed.raw_text as string | null) ?? '';
  const channelType = (claimed.channel as string | null) ?? 'web';

  // 1) Media: strip EXIF from JPEGs in place, mark scanned + exif_stripped.
  const { data: media } = await sb
    .from('report_media')
    .select('id, storage_path')
    .eq('report_id', reportId);
  let mediaProcessed = 0;
  for (const m of (media ?? []) as Array<{ id: string; storage_path: string }>) {
    try {
      const { data: blob } = await sb.storage.from(BUCKET).download(m.storage_path);
      if (blob) {
        const bytes = new Uint8Array(await blob.arrayBuffer());
        const cleaned = isJpeg(bytes) ? stripJpegExif(bytes) : bytes;
        await sb.storage.from(BUCKET).upload(m.storage_path, cleaned, {
          upsert: true,
          contentType: blob.type || 'application/octet-stream',
        });
      }
      await sb.from('report_media').update({ scanned: true, exif_stripped: true }).eq('id', m.id);
      mediaProcessed++;
    } catch {
      // Ignore media processing errors
    }
  }

  // 2) Initialize SIE Universal Intelligence Engine and Orchestrator
  const IngestStage: PipelineStage = {
    name: 'Ingestion',
    async execute(ctx: PipelineContext) {
      // Log timeline event for ingestion
      await sb.from('timeline_events').insert({
        subject_type: 'report',
        subject_id: reportId,
        event_type: 'Report Submitted',
        description: `Ingested new report from channel ${channelType}`,
      });
    },
  };

  const ExtractStage: PipelineStage = {
    name: 'Extraction',
    async execute(ctx: PipelineContext) {
      const hybridEntities = await extractEntitiesHybrid(text);
      let added = 0;
      for (const e of hybridEntities) {
        if (e.type === 'date' || e.type === 'case_number') continue;
        const { data: ent } = await sb
          .from('entities')
          .upsert({ type: e.type, value_canonical: e.canonical_value }, { onConflict: 'type,value_canonical' })
          .select('id')
          .single();
        if (ent) {
          await sb
            .from('report_entities')
            .upsert(
              { report_id: reportId, entity_id: ent.id, confidence: e.confidence },
              { onConflict: 'report_id,entity_id' }
            );

          // Write evidence node record
          await sb.from('evidence_nodes').insert({
            report_id: reportId,
            entity_id: ent.id,
            type: e.source,
            confidence: e.confidence,
            metadata: { verbatim_span: e.raw_value },
          });

          // Register in context
          ctx.entities.push({
            type: e.type,
            value: e.canonical_value,
            confidence: e.confidence,
            source: e.source,
          });

          ctx.evidenceNodes.push({
            type: e.source,
            confidence: e.confidence,
            metadata: { verbatim_span: e.raw_value },
            entityId: ent.id,
          });

          added++;
        }
      }
      ctx.metadata.entitiesAdded = added;
    },
  };

  const ClassifyStage: PipelineStage = {
    name: 'Classification',
    async execute(ctx: PipelineContext) {
      const cls = await classifyReport({ text });
      ctx.verdict = cls.verdict;

      // Write basic report score
      await sb.from('scores').insert({
        subject_type: 'report',
        subject_id: reportId,
        verdict: VERDICT_ENUM[cls.verdict],
        confidence: cls.confidence,
        model_version: 'sie-classifier-v1',
      });

      // Write multi-label threat mappings
      const threatsMatched = await classifyThreats(text);
      for (const tm of threatsMatched) {
        const { data: th } = await sb
          .from('threats')
          .select('id')
          .eq('slug', tm.threatSlug)
          .single();
        if (th) {
          await sb.from('report_threats').upsert(
            {
              report_id: reportId,
              threat_id: th.id,
              confidence: tm.confidence,
              abstained: false,
            },
            { onConflict: 'report_id,threat_id' }
          );

          ctx.threats.push({
            category: tm.threatSlug,
            confidence: tm.confidence,
            abstained: false,
          });

          ctx.evidenceNodes.push({
            type: 'similarity',
            confidence: tm.confidence,
            metadata: { threatSlug: tm.threatSlug },
          });
        }
      }

      ctx.metadata.rawConfidence = cls.confidence;
      ctx.metadata.abstained = cls.abstained;
    },
  };

  const GraphStage: PipelineStage = {
    name: 'Graph&Confidence',
    async execute(ctx: PipelineContext) {
      // Execute campaign linking
      await detectCampaignsForReport(sb, reportId);

      // Compute multi-dimensional confidence vectors
      const rawConf = ctx.metadata.rawConfidence || 0.0;
      const entitiesCount = ctx.entities.length;
      const hasVerification = false; // Resolved in graph verifications if applicable

      const vector = confidenceService.calculateConfidence(
        rawConf,
        entitiesCount,
        1, // This is the first report match density
        hasVerification
      );

      ctx.confidence = vector;

      // Persist confidence drift snapshot
      await confidenceService.logConfidenceHistory(sb, 'report', reportId, vector);

      // Compile reasoning tree nodes
      const tree = reasoningService.buildReasoningTree(ctx.verdict, vector.overall, ctx.evidenceNodes);
      
      // Store reasoning nodes in database
      const { data: rootNode } = await sb
        .from('reasoning_nodes')
        .insert({
          subject_type: 'report',
          subject_id: reportId,
          node_type: tree.nodeType,
          summary: tree.summary,
          weight: tree.weight,
          confidence: tree.confidence,
        })
        .select('id')
        .single();

      if (rootNode) {
        for (const child of tree.children) {
          await sb.from('reasoning_nodes').insert({
            subject_type: 'report',
            subject_id: reportId,
            node_type: child.nodeType,
            summary: child.summary,
            weight: child.weight,
            confidence: child.confidence,
            parent_id: rootNode.id,
          });
        }
      }

      // Log Campaign Linked / Ingested Event
      await sb.from('timeline_events').insert({
        subject_type: 'report',
        subject_id: reportId,
        event_type: 'Classification Updated',
        description: `Calibrated overall score evaluated at ${(vector.overall * 100).toFixed(0)}%`,
      });
    },
  };

  const type = IntelligenceObject.detectType(text);
  const intelObject = IntelligenceObject.create(text, type);
  const orchestrator = new IntelligenceEngine([IngestStage, ExtractStage, ClassifyStage, GraphStage]);

  const ctx = await orchestrator.analyze(intelObject);

  // 4) Hand off to moderation.
  await sb
    .from('reports')
    .update({ status: 'pending_review', processed_at: new Date().toISOString() })
    .eq('id', reportId);

  return {
    reportId,
    status: 'pending_review',
    entitiesAdded: ctx.metadata.entitiesAdded || 0,
    mediaProcessed,
    verdict: ctx.verdict,
    abstained: ctx.metadata.abstained || false,
  };
}

/** Drain a batch of unprocessed reports (oldest first). */
export async function processPendingReports(
  sb: SupabaseClient,
  limit = 20
): Promise<ProcessResult[]> {
  const { data: pending } = await sb
    .from('reports')
    .select('id')
    .eq('status', 'received')
    .is('deleted_at', null)
    .order('created_at', { ascending: true })
    .limit(limit);

  const results: ProcessResult[] = [];
  for (const r of (pending ?? []) as Array<{ id: string }>) {
    const res = await processReport(sb, r.id);
    if (res) results.push(res);
  }
  return results;
}
