import { describe, it, expect } from 'vitest';

import { deriveVerdict } from '@/shared/search/deriveVerdict';
import type { Verdict } from '@/types';

const base = {
  classifierVerdict: 'No Signal' as Verdict,
  classifierConfidence: 0,
  classifierAbstained: true,
};

describe('deriveVerdict', () => {
  it('reports + high threat confidence => Confirmed Reported Scam', () => {
    const r = deriveVerdict({ ...base, reportCount: 5, maxThreatConfidence: 0.9 });
    expect(r.verdict).toBe('Confirmed Reported Scam');
    expect(r.confidence).toBeGreaterThanOrEqual(0.85);
  });

  it('several reports => Likely Scam', () => {
    expect(deriveVerdict({ ...base, reportCount: 3, maxThreatConfidence: 0 }).verdict).toBe(
      'Likely Scam',
    );
  });

  it('a single report => Use Caution', () => {
    expect(deriveVerdict({ ...base, reportCount: 1, maxThreatConfidence: 0 }).verdict).toBe(
      'Use Caution',
    );
  });

  it('no signal + abstaining model => No Signal', () => {
    expect(deriveVerdict({ ...base, reportCount: 0, maxThreatConfidence: 0 }).verdict).toBe(
      'No Signal',
    );
  });

  it('a model-only scam read is downgraded to Use Caution and capped ≤ 0.7', () => {
    const r = deriveVerdict({
      reportCount: 0,
      maxThreatConfidence: 0,
      classifierVerdict: 'Likely Scam',
      classifierConfidence: 0.99,
      classifierAbstained: false,
    });
    expect(r.verdict).toBe('Use Caution');
    expect(r.confidence).toBeLessThanOrEqual(0.7);
  });
});
