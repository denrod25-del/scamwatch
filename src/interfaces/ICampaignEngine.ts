import { SupabaseClient } from '@supabase/supabase-js';

export interface ICampaignEngine {
  detectCampaignsForReport(sb: SupabaseClient, reportId: string): Promise<string | null>;
}
