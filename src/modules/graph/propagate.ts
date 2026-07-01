import type { EntityType } from '@/types';

export interface LinkedReport {
  confidence: number;
  ageInDays: number;
  linkType?: 'direct' | 'indirect';
}

/**
 * Calculates the aggregated fraud score of an Entity node (P_fraud)
 * using a damped noisy-OR combination and time decay.
 *
 * Formula:
 * P_fraud = 1 - product_{i=1..N} (1 - w_edge * C_i * d_i(t))
 *
 * Where:
 * - N is the number of reports linking to the Entity.
 * - w_edge is the connection weight (0.90 for direct links, 0.60 for indirect campaign links).
 * - C_i is the calibrated confidence score of Report i.
 * - d_i(t) is the temporal decay factor: exp(-lambda * t)
 * - lambda is the decay constant: ln(2) / T_{1/2}
 *
 * Half-Life T_{1/2} parameters:
 * - URLs / Domains: 30 days
 * - Phone Numbers: 90 days
 * - Crypto Wallets: 180 days
 * - Emails: 90 days
 * - Handles: 90 days
 * - Brands: 180 days
 */
export function calculateEntityGraphScore(
  entityType: EntityType,
  reports: LinkedReport[]
): number {
  if (!reports || reports.length === 0) {
    return 0;
  }

  // Determine half-life T_{1/2} in days
  let halfLife = 90; // Default fallback
  switch (entityType) {
    case 'url':
    case 'domain':
      halfLife = 30;
      break;
    case 'phone':
      halfLife = 90;
      break;
    case 'wallet':
      halfLife = 180;
      break;
    case 'email':
      halfLife = 90;
      break;
    case 'handle':
      halfLife = 90;
      break;
    case 'brand':
      halfLife = 180;
      break;
  }

  const lambda = Math.LN2 / halfLife;
  let product = 1;

  for (const report of reports) {
    const C = report.confidence;
    const t = Math.max(0, report.ageInDays);
    const d = Math.exp(-lambda * t);

    // w_edge connection weight (default: 0.90 for direct, 0.60 for indirect)
    const w = report.linkType === 'indirect' ? 0.60 : 0.90;

    product *= 1 - w * C * d;
  }

  const pFraud = 1 - product;

  // Clamp the score to [0, 1] to ensure mathematical validity
  return Math.min(1, Math.max(0, pFraud));
}
