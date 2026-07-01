import { SupabaseClient } from '@supabase/supabase-js';
import { EvidenceNode } from '@/modules/evidence/EvidenceNode';

export interface IEvidenceEngine {
  logEvidence(
    sb: SupabaseClient,
    reportId: string,
    entityId: string,
    type: string,
    confidence: number,
    metadata?: Record<string, any>
  ): Promise<void>;
  
  getEvidenceForReport(sb: SupabaseClient, reportId: string): Promise<EvidenceNode[]>;
}
