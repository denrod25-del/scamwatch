import type { SupabaseClient } from '@supabase/supabase-js';

export interface QueueEntity {
  type: string;
  value: string;
}

export interface QueueItem {
  id: string;
  channel: string;
  rawText: string | null;
  createdAt: string;
  processedAt: string | null;
  entities: QueueEntity[];
  verdict: string | null;
  confidence: number | null;
  mediaCount: number;
}

type EntityEmbed = { type: string; value_canonical: string };

/**
 * Load the moderation queue: reports awaiting review with their worker-extracted
 * entities, latest classification, and media count. Service-role only (caller must
 * have verified staff). Small N → per-report joins are fine.
 */
export async function getModerationQueue(admin: SupabaseClient, limit = 50): Promise<QueueItem[]> {
  const { data: reports } = await admin
    .from('reports')
    .select('id, channel, raw_text, created_at, processed_at')
    .eq('status', 'pending_review')
    .is('deleted_at', null)
    .order('created_at', { ascending: true })
    .limit(limit);

  const items: QueueItem[] = [];
  for (const r of (reports ?? []) as Array<{
    id: string;
    channel: string;
    raw_text: string | null;
    created_at: string;
    processed_at: string | null;
  }>) {
    const { data: links } = await admin
      .from('report_entities')
      .select('entities(type, value_canonical)')
      .eq('report_id', r.id);

    const entities: QueueEntity[] = (
      (links ?? []) as Array<{
        entities: EntityEmbed | EntityEmbed[] | null;
      }>
    )
      .map((l) => (Array.isArray(l.entities) ? l.entities[0] : l.entities))
      .filter((e): e is EntityEmbed => Boolean(e?.value_canonical))
      .map((e) => ({ type: e.type, value: e.value_canonical }));

    const { data: score } = await admin
      .from('scores')
      .select('verdict, confidence')
      .eq('subject_id', r.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const { count: mediaCount } = await admin
      .from('report_media')
      .select('*', { count: 'exact', head: true })
      .eq('report_id', r.id);

    items.push({
      id: r.id,
      channel: r.channel,
      rawText: r.raw_text,
      createdAt: r.created_at,
      processedAt: r.processed_at,
      entities,
      verdict: (score?.verdict as string | undefined) ?? null,
      confidence: score?.confidence != null ? Number(score.confidence) : null,
      mediaCount: mediaCount ?? 0,
    });
  }
  return items;
}
