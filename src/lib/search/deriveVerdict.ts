import type { Verdict } from '@/types';

export interface VerdictInputs {
  /** Count of community reports referencing this entity. */
  reportCount: number;
  /** Highest threat-classification confidence across those reports (0..1). */
  maxThreatConfidence: number;
  classifierVerdict: Verdict;
  classifierConfidence: number;
  classifierAbstained: boolean;
}

export interface DerivedVerdict {
  verdict: Verdict;
  confidence: number;
}

const clamp = (n: number): number => Math.min(1, Math.max(0, Number.isFinite(n) ? n : 0));

/**
 * Combine community signal with the model read into one calibrated verdict.
 *
 * Principle (Vol 8 / "never exaggerate", "respect victims"): real community
 * reports dominate, because they are evidence. A model-only read NEVER asserts a
 * confirmed/likely scam as fact — it is downgraded to "Use Caution" and capped
 * below 1.0. "Confirmed Reported Scam" requires actual reports, never the model.
 */
export function deriveVerdict(i: VerdictInputs): DerivedVerdict {
  const reports = Math.max(0, Math.floor(i.reportCount));

  if (reports > 0 && i.maxThreatConfidence >= 0.75) {
    return {
      verdict: 'Confirmed Reported Scam',
      confidence: clamp(Math.max(0.85, i.maxThreatConfidence)),
    };
  }
  if (reports >= 3) return { verdict: 'Likely Scam', confidence: 0.7 };
  if (reports >= 1) return { verdict: 'Use Caution', confidence: 0.55 };

  // No community signal — defer to the (possibly abstaining) classifier.
  if (i.classifierAbstained) return { verdict: 'No Signal', confidence: 0 };

  const capped = Math.min(clamp(i.classifierConfidence), 0.7);
  if (i.classifierVerdict === 'Likely Scam' || i.classifierVerdict === 'Confirmed Reported Scam') {
    // Model alone may not assert a scam as fact — soften to caution.
    return { verdict: 'Use Caution', confidence: capped };
  }
  return { verdict: i.classifierVerdict, confidence: capped };
}
