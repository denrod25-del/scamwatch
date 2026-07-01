import { SupabaseClient } from '@supabase/supabase-js';
import { EvidenceNode } from './EvidenceNode';

export class EvidenceRepository {
  /**
   * Persists an evidence node to the database.
   */
  public async saveNode(sb: SupabaseClient, node: EvidenceNode): Promise<void> {
    const { error } = await sb.from('evidence_nodes').insert({
      id: node.id,
      report_id: node.reportId || null,
      entity_id: node.entityId || null,
      type: node.type,
      confidence: node.confidence,
      metadata: node.metadata,
      created_at: node.createdAt.toISOString(),
    });

    if (error) {
      console.error('Failed to save evidence node to database:', error.message);
    }
  }

  /**
   * Fetches all evidence nodes associated with a report.
   */
  public async fetchNodesForReport(
    sb: SupabaseClient,
    reportId: string
  ): Promise<EvidenceNode[]> {
    const { data, error } = await sb
      .from('evidence_nodes')
      .select('*')
      .eq('report_id', reportId);

    if (error || !data) {
      console.error('Failed to fetch evidence nodes:', error?.message);
      return [];
    }

    return data.map(
      (row: any) =>
        new EvidenceNode(
          row.type,
          row.confidence,
          row.metadata,
          row.report_id,
          row.entity_id,
          row.id,
          new Date(row.created_at)
        )
    );
  }
}
