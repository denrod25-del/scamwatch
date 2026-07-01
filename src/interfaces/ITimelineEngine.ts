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

export interface ITimelineEngine {
  logTimelineEvent(sb: SupabaseClient, payload: TimelineEventPayload): Promise<void>;
}
