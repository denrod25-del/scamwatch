import type { Verdict } from '@/types';

export interface ClassifyInput {
  /** De-identified report text (PII removed upstream — Vol 8/14). */
  text: string;
  channel?: string;
}

export interface ClassifyResult {
  verdict: Verdict;
  /** Calibrated confidence in [0,1]. */
  confidence: number;
  /** True when the model declines to classify (low evidence) — a first-class outcome. */
  abstained: boolean;
}

/**
 * STUB — threat classification (Vol 8, AI-8).
 *
 * The real implementation does retrieval-augmented, few-shot multi-label
 * classification against the threat taxonomy, returns a CALIBRATED confidence,
 * and ABSTAINS when evidence is weak rather than guessing. Output is never
 * presented as fact and is always paired with "verify with official sources."
 *
 * TODO(Vol 8): embeddings (pgvector) retrieval → prompt assembly → classify →
 * calibrate → moderation/safety gate → persist with model_version.
 */
export async function classifyReport(input: ClassifyInput): Promise<ClassifyResult> {
  // Stub: always abstain until the Vol 8 pipeline lands, regardless of input.
  void input;
  return { verdict: 'No Signal', confidence: 0, abstained: true };
}
