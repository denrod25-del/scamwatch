import { SupabaseClient } from '@supabase/supabase-js';

export interface TimelineEventPayload {
  subjectType: 'report' | 'entity' | 'campaign' | 'investigation';
  subjectId: string;
  eventType:
    | 'Report Submitted'
    | 'Entity Created'
    | 'Campaign Linked'
    | 'Evidence Added'
    | 'Confidence Updated'
    | 'Archived';
  description?: string;
  metadata?: Record<string, any>;
}

/**
 * Inserts an immutable timeline event log into the database.
 */
export async function logTimelineEvent(
  sb: SupabaseClient,
  payload: TimelineEventPayload
): Promise<void> {
  const { error } = await sb.from('timeline_events').insert({
    subject_type: payload.subjectType,
    subject_id: payload.subjectId,
    event_type: payload.eventType,
    description: payload.description || null,
    metadata: payload.metadata || {},
  });

  if (error) {
    console.error(`Failed to log timeline event [${payload.eventType}]:`, error.message);
  }
}
