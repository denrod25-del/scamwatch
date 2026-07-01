import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Moderation decisions (Vol 16). Run server-side with the service role AFTER a
 * staff check. Each decision is recorded in the append-only audit_log (via the
 * append_audit chain) and the moderation_actions table.
 *
 * Publishing a report is what makes its worker-extracted entities live search
 * signal: the 0006 RLS policy exposes report_entities/report_threats to anon only
 * for `published` reports.
 */

async function recordDecision(
  admin: SupabaseClient,
  actorId: string,
  action: 'report.published' | 'report.rejected',
  reportId: string,
  payload: Record<string, unknown>,
): Promise<void> {
  await admin.rpc('append_audit', {
    p_actor: actorId,
    p_action: action,
    p_target_type: 'report',
    p_target_id: reportId,
    p_payload: payload,
  });
  await admin.from('moderation_actions').insert({
    actor_id: actorId,
    action: action === 'report.published' ? 'approve' : 'reject',
    target_type: 'report',
    target_id: reportId,
    reason: (payload['reason'] as string | undefined) ?? null,
  });
}

/** pending_review → published. Returns false if the report wasn't awaiting review. */
export async function publishReport(
  admin: SupabaseClient,
  reportId: string,
  actorId: string,
): Promise<boolean> {
  const { data } = await admin
    .from('reports')
    .update({ status: 'published' })
    .eq('id', reportId)
    .eq('status', 'pending_review')
    .select('id')
    .maybeSingle();
  if (!data) return false;
  await recordDecision(admin, actorId, 'report.published', reportId, {});
  return true;
}

/** Any non-terminal state → rejected. */
export async function rejectReport(
  admin: SupabaseClient,
  reportId: string,
  actorId: string,
  reason: string,
): Promise<boolean> {
  const { data } = await admin
    .from('reports')
    .update({ status: 'rejected' })
    .eq('id', reportId)
    .in('status', ['pending_review', 'received', 'processing'])
    .select('id')
    .maybeSingle();
  if (!data) return false;
  await recordDecision(admin, actorId, 'report.rejected', reportId, { reason });
  return true;
}
