import { SupabaseClient } from '@supabase/supabase-js';

export interface ConfidenceVector {
  evidence: number;
  model: number;
  community: number;
  historical: number;
  verification: number;
  overall: number;
}

export interface IConfidenceEngine {
  calculateConfidence(
    modelConfidence: number,
    entityCount: number,
    reportCount: number,
    hasVerification: boolean,
    historicalReputation?: number
  ): ConfidenceVector;

  logConfidenceHistory(
    sb: SupabaseClient,
    subjectType: 'report' | 'entity' | 'campaign',
    subjectId: string,
    vector: ConfidenceVector,
    reason?: string
  ): Promise<void>;
}
