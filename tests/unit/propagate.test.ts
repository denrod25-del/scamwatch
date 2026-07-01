import { describe, it, expect } from 'vitest';
import { calculateEntityGraphScore, LinkedReport } from '@/modules/graph/propagate';

describe('Knowledge Graph Propagation & Decay', () => {
  // AC-301.5.b
  it('calculates aggregate score for multiple reports with no decay (AC-301.5.b)', () => {
    const reports: LinkedReport[] = [
      { confidence: 0.80, ageInDays: 0, linkType: 'direct' },
      { confidence: 0.70, ageInDays: 0, linkType: 'direct' },
      { confidence: 0.90, ageInDays: 0, linkType: 'direct' },
    ];
    // w_edge * C_i * d_i(t):
    // 0.90 * 0.80 * 1 = 0.72
    // 0.90 * 0.70 * 1 = 0.63
    // 0.90 * 0.90 * 1 = 0.81
    // P_fraud = 1 - (1 - 0.72) * (1 - 0.63) * (1 - 0.81) = 1 - 0.28 * 0.37 * 0.19 = 0.980316
    const score = calculateEntityGraphScore('phone', reports);
    expect(score).toBeCloseTo(0.980316, 6);
  });

  // AC-301.5.c
  it('applies correct temporal decay half-lives (AC-301.5.c)', () => {
    // For URL / Domain, T_1/2 = 30 days.
    // At t = 30 days, decay factor d_i(30) must be exactly 0.5.
    const urlReport: LinkedReport[] = [
      { confidence: 1.0, ageInDays: 30, linkType: 'direct' },
    ];
    // w = 0.90, C = 1.0, d = 0.50 -> w * C * d = 0.45
    // P_fraud = 1 - (1 - 0.45) = 0.45
    const urlScore = calculateEntityGraphScore('url', urlReport);
    expect(urlScore).toBeCloseTo(0.45, 6);

    const domainReport: LinkedReport[] = [
      { confidence: 1.0, ageInDays: 30, linkType: 'direct' },
    ];
    const domainScore = calculateEntityGraphScore('domain', domainReport);
    expect(domainScore).toBeCloseTo(0.45, 6);

    // For Phone Numbers, T_1/2 = 90 days.
    // At t = 90 days, decay factor d_i(90) = 0.5.
    const phoneReport: LinkedReport[] = [
      { confidence: 1.0, ageInDays: 90, linkType: 'direct' },
    ];
    // w * C * d = 0.90 * 1.0 * 0.5 = 0.45
    const phoneScore = calculateEntityGraphScore('phone', phoneReport);
    expect(phoneScore).toBeCloseTo(0.45, 6);

    // For Crypto Wallets, T_1/2 = 180 days.
    // At t = 180 days, decay factor d_i(180) = 0.5.
    const walletReport: LinkedReport[] = [
      { confidence: 1.0, ageInDays: 180, linkType: 'direct' },
    ];
    const walletScore = calculateEntityGraphScore('wallet', walletReport);
    expect(walletScore).toBeCloseTo(0.45, 6);
  });

  it('handles linkType weights correctly (direct vs indirect)', () => {
    // Direct linkType (w = 0.90)
    const directReport: LinkedReport[] = [
      { confidence: 1.0, ageInDays: 0, linkType: 'direct' },
    ];
    expect(calculateEntityGraphScore('phone', directReport)).toBeCloseTo(0.90, 6);

    // Indirect linkType (w = 0.60)
    const indirectReport: LinkedReport[] = [
      { confidence: 1.0, ageInDays: 0, linkType: 'indirect' },
    ];
    expect(calculateEntityGraphScore('phone', indirectReport)).toBeCloseTo(0.60, 6);

    // Default connection weight when linkType is omitted (should default to direct, w = 0.90)
    const defaultReport: LinkedReport[] = [
      { confidence: 1.0, ageInDays: 0 },
    ];
    expect(calculateEntityGraphScore('phone', defaultReport)).toBeCloseTo(0.90, 6);
  });

  it('handles boundary and edge cases gracefully', () => {
    // Empty reports list
    expect(calculateEntityGraphScore('phone', [])).toBe(0);

    // Negative ageInDays (should be treated as 0)
    const negativeAgeReport: LinkedReport[] = [
      { confidence: 1.0, ageInDays: -10, linkType: 'direct' },
    ];
    expect(calculateEntityGraphScore('phone', negativeAgeReport)).toBeCloseTo(0.90, 6);

    // Multiple reports decay accumulation
    // url, T_1/2 = 30 days. lambda = ln(2)/30.
    // Report 1: C = 0.8, t = 15 -> d_1 = exp(-ln(2)*15/30) = exp(-ln(2)*0.5) = 1/sqrt(2) approx 0.70710678
    // Report 2: C = 0.5, t = 60 -> d_2 = exp(-ln(2)*60/30) = exp(-2*ln(2)) = 0.25
    // P_fraud = 1 - (1 - 0.9 * 0.8 * 0.70710678) * (1 - 0.9 * 0.5 * 0.25)
    //         = 1 - (1 - 0.72 * 0.70710678) * (1 - 0.45 * 0.25)
    //         = 1 - (1 - 0.50911688) * (1 - 0.1125)
    //         = 1 - (0.49088312) * (0.8875)
    //         = 1 - 0.43565877 = 0.56434123
    const reports: LinkedReport[] = [
      { confidence: 0.8, ageInDays: 15, linkType: 'direct' },
      { confidence: 0.5, ageInDays: 60, linkType: 'direct' },
    ];
    expect(calculateEntityGraphScore('url', reports)).toBeCloseTo(0.56434123, 6);
  });

  it('clamps results within [0, 1]', () => {
    // Extremely large reports or abnormal weights/confidences should not blow up or go below 0
    const normalClamping: LinkedReport[] = [
      { confidence: 1.5, ageInDays: 0, linkType: 'direct' },
    ];
    // w * C = 0.9 * 1.5 = 1.35. P_fraud = 1 - (1 - 1.35) = 1.35 -> clamped to 1.0
    expect(calculateEntityGraphScore('phone', normalClamping)).toBe(1.0);
  });
});
