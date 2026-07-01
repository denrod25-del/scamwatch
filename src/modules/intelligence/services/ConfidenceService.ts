import { SupabaseClient } from '@supabase/supabase-js';
import { IConfidenceEngine, ConfidenceVector } from '@/interfaces/IConfidenceEngine';

export class ConfidenceService implements IConfidenceEngine {
  /**
   * Computes the multi-dimensional confidence dimensions and their weighted overall average.
   */
  public calculateConfidence(
    modelConfidence: number,
    entityCount: number,
    reportCount: number,
    hasVerification: boolean,
    historicalReputation = 0.5
  ): ConfidenceVector {
    // 1) Evidence Density
    let evidence = 0.0;
    if (entityCount === 1) evidence = 0.4;
    else if (entityCount >= 2 && entityCount < 4) evidence = 0.8;
    else if (entityCount >= 4) evidence = 0.95;

    // 2) Community Volume
    let community = 0.0;
    if (reportCount === 1) community = 0.5;
    else if (reportCount >= 2) community = 0.9;

    // 3) Verification Status
    const verification = hasVerification ? 1.0 : 0.0;

    // 4) Model Base Confidence
    const model = Math.max(0.0, Math.min(1.0, modelConfidence));

    // 5) Historical Reputation
    const historical = Math.max(0.0, Math.min(1.0, historicalReputation));

    // 6) Weighted Overall Aggregate
    const overall =
      0.30 * model +
      0.30 * evidence +
      0.20 * community +
      0.10 * historical +
      0.10 * verification;

    return {
      evidence,
      model,
      community,
      historical,
      verification,
      overall,
    };
  }

  /**
   * Logs a snapshot of the confidence vector to the database for drift tracking.
   */
  public async logConfidenceHistory(
    sb: SupabaseClient,
    subjectType: 'report' | 'entity' | 'campaign',
    subjectId: string,
    vector: ConfidenceVector,
    reason?: string
  ): Promise<void> {
    const { error } = await sb.from('confidence_history').insert({
      subject_type: subjectType,
      subject_id: subjectId,
      evidence_conf: vector.evidence,
      model_conf: vector.model,
      community_conf: vector.community,
      historical_conf: vector.historical,
      verification_conf: vector.verification,
      overall_conf: vector.overall,
      reason: reason || 'Pipeline execution update',
    });

    if (error) {
      console.error('Failed to log confidence history:', error.message);
    }
  }
}
