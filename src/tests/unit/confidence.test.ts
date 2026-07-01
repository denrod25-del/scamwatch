import { describe, it, expect } from 'vitest';

import { confidenceToBand } from '@/types';
import { formatConfidence } from '@/shared/utils';

describe('confidenceToBand', () => {
  it('maps the calibrated bands at their boundaries', () => {
    expect(confidenceToBand(0)).toBe('low');
    expect(confidenceToBand(0.39)).toBe('low');
    expect(confidenceToBand(0.4)).toBe('moderate');
    expect(confidenceToBand(0.74)).toBe('moderate');
    expect(confidenceToBand(0.75)).toBe('high');
    expect(confidenceToBand(1)).toBe('high');
  });

  it('treats any non-finite input as low — never invents confidence', () => {
    expect(confidenceToBand(Number.NaN)).toBe('low');
    expect(confidenceToBand(Number.POSITIVE_INFINITY)).toBe('low');
    expect(confidenceToBand(Number.NEGATIVE_INFINITY)).toBe('low');
  });

  it('formatConfidence delegates to the same bands', () => {
    expect(formatConfidence(0.9)).toBe('high');
    expect(formatConfidence(0.1)).toBe('low');
  });
});
