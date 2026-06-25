import type { SupabaseClient } from '@supabase/supabase-js';

import { canonicalizeEntity } from '@/lib/entities/canonicalize';
import { redactPII } from './deidentify';
import type { ReportInput, SubmittedReport } from './types';

export interface SubmitDeps {
  /** Inject a client for tests; defaults to the service-role admin client. */
  getClient?: () => Promise<SupabaseClient>;
}

async function defaultClient(): Promise<SupabaseClient> {
  // Dynamic import keeps the server-only admin module out of test/client graphs
  // unless the default (production) path is actually taken.
  const { createAdminClient } = await import('@/lib/supabase/admin');
  return createAdminClient();
}

/**
 * Persist a scam report (Vol 5 FR-5.2). Runs server-side with elevated privileges:
 * de-identifies the narrative, inserts the report (status `received` for the AI
 * pipeline to process), canonicalizes + links flagged entities, and records any
 * uploaded media. Idempotent on `idempotencyKey`.
 */
export async function submitReport(
  input: ReportInput,
  deps: SubmitDeps = {},
): Promise<SubmittedReport> {
  const getClient = deps.getClient ?? defaultClient;
  const sb = await getClient();

  if (input.idempotencyKey) {
    const { data: existing } = await sb
      .from('reports')
      .select('id, status')
      .eq('idempotency_key', input.idempotencyKey)
      .maybeSingle();
    if (existing) {
      return {
        id: existing.id as string,
        status: existing.status as string,
        redactions: 0,
        entityCount: 0,
      };
    }
  }

  const { text: narrative, redactions } = redactPII(input.narrative);

  const row: Record<string, unknown> = {
    channel: input.channel,
    raw_text: narrative,
    status: 'received',
    reporter_id: input.reporterId ?? null,
  };
  if (input.idempotencyKey) row['idempotency_key'] = input.idempotencyKey;

  const { data: report, error } = await sb
    .from('reports')
    .insert(row)
    .select('id, status')
    .single();
  if (error) throw error;
  const reportId = report.id as string;

  let entityCount = 0;
  for (const indicator of input.indicators ?? []) {
    const canon = canonicalizeEntity(indicator);
    if (!canon) continue;
    const { data: entity, error: entityErr } = await sb
      .from('entities')
      .upsert(
        { type: canon.type, value_canonical: canon.value },
        { onConflict: 'type,value_canonical' },
      )
      .select('id')
      .single();
    if (entityErr) throw entityErr;
    await sb
      .from('report_entities')
      .upsert(
        { report_id: reportId, entity_id: entity.id, confidence: 0.5 },
        { onConflict: 'report_id,entity_id' },
      );
    entityCount++;
  }

  for (const path of input.mediaPaths ?? []) {
    await sb
      .from('report_media')
      .insert({ report_id: reportId, storage_path: path, scanned: false, exif_stripped: false });
  }

  return { id: reportId, status: report.status as string, redactions, entityCount };
}
