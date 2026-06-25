import type { SupabaseClient } from '@supabase/supabase-js';

import { extractEntities } from '@/lib/entities/extractEntities';
import { classifyReport } from '@/lib/ai/classify';
import type { Verdict } from '@/types';
import { isJpeg, stripJpegExif } from './exif';

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
 * Process one report (Vol 8 pipeline). Claims it atomically (received → processing),
 * strips EXIF from JPEG evidence, extracts + links entities from the narrative,
 * records a calibrated classification, then moves it to `pending_review` for
 * moderation. It NEVER auto-publishes — publishing is a human/trust decision (Vol 16).
 * Returns null if the report was already claimed/processed by someone else.
 */
export async function processReport(
  sb: SupabaseClient,
  reportId: string,
): Promise<ProcessResult | null> {
  const { data: claimed } = await sb
    .from('reports')
    .update({ status: 'processing' })
    .eq('id', reportId)
    .eq('status', 'received')
    .select('id, raw_text')
    .maybeSingle();
  if (!claimed) return null;

  const text = (claimed.raw_text as string | null) ?? '';

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
      // Leave the media row unmarked on error; a later run can retry.
    }
  }

  // 2) Entity extraction from the (de-identified) narrative.
  let entitiesAdded = 0;
  for (const e of extractEntities(text)) {
    const { data: ent } = await sb
      .from('entities')
      .upsert({ type: e.type, value_canonical: e.value }, { onConflict: 'type,value_canonical' })
      .select('id')
      .single();
    if (ent) {
      await sb
        .from('report_entities')
        .upsert(
          { report_id: reportId, entity_id: ent.id, confidence: 0.4 },
          { onConflict: 'report_id,entity_id' },
        );
      entitiesAdded++;
    }
  }

  // 3) Calibrated classification (abstains without an OpenAI key).
  const cls = await classifyReport({ text });
  await sb.from('scores').insert({
    subject_type: 'report',
    subject_id: reportId,
    verdict: VERDICT_ENUM[cls.verdict],
    confidence: cls.confidence,
    model_version: 'classifier-v0',
  });

  // 4) Hand off to moderation.
  await sb
    .from('reports')
    .update({ status: 'pending_review', processed_at: new Date().toISOString() })
    .eq('id', reportId);

  return {
    reportId,
    status: 'pending_review',
    entitiesAdded,
    mediaProcessed,
    verdict: cls.verdict,
    abstained: cls.abstained,
  };
}

/** Drain a batch of unprocessed reports (oldest first). */
export async function processPendingReports(
  sb: SupabaseClient,
  limit = 20,
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
