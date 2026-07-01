import { SupabaseClient } from '@supabase/supabase-js';

export interface IKnowledgeGraph {
  calculateEntityGraphScore(
    entityType: string,
    reports: Array<{ score: number; ageInDays: number }>
  ): number;
}
