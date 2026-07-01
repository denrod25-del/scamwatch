import { SupabaseClient } from '@supabase/supabase-js';
import { IEvidenceEngine } from '@/interfaces/IEvidenceEngine';
import { EvidenceNode } from './EvidenceNode';
import { EvidenceBuilder } from './EvidenceBuilder';
import { EvidenceRepository } from './EvidenceRepository';

export class EvidenceEngine implements IEvidenceEngine {
  private readonly builder = new EvidenceBuilder();
  private readonly repository = new EvidenceRepository();

  /**
   * Logs an evidence node into the database.
   */
  public async logEvidence(
    sb: SupabaseClient,
    reportId: string,
    entityId: string,
    type: string,
    confidence: number,
    metadata: Record<string, any> = {}
  ): Promise<void> {
    const node = this.builder.buildFromExtraction(
      reportId,
      entityId,
      type,
      confidence,
      metadata.verbatim_span || ''
    );
    await this.repository.saveNode(sb, node);
  }

  /**
   * Fetches evidence nodes associated with a report.
   */
  public async getEvidenceForReport(
    sb: SupabaseClient,
    reportId: string
  ): Promise<EvidenceNode[]> {
    return this.repository.fetchNodesForReport(sb, reportId);
  }
}
