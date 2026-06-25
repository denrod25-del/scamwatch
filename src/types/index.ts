/**
 * ScamWatch shared domain types.
 * Canonical objects (PRD Vol 0 §9): Report, Entity, Threat, Campaign, Verification,
 * Explanation, Confidence. Verdict vocabulary is fixed by Vol 5/6.
 */

/** Calibrated verdict shown to users. Never present as fact; always paired with confidence. */
export type Verdict =
  | 'Likely Safe'
  | 'No Signal'
  | 'Use Caution'
  | 'Likely Scam'
  | 'Confirmed Reported Scam';

/** Confidence is a calibrated probability in [0, 1] (Vol 8). */
export type Confidence = number;

/** Human-facing confidence band — avoids false precision in the UI (Vol 6/7). */
export type ConfidenceBand = 'low' | 'moderate' | 'high';

/** Atom of fraud infrastructure extracted from a report (Vol 8/9). */
export type EntityType = 'phone' | 'url' | 'domain' | 'email' | 'wallet' | 'handle' | 'brand';

/** Supabase Auth roles (shared context). Highest grant wins. */
export type Role = 'anonymous' | 'member' | 'contributor' | 'moderator' | 'analyst' | 'admin';

export type ReportStatus = 'received' | 'processing' | 'published' | 'rejected' | 'withdrawn';

export type CampaignStatus = 'candidate' | 'active' | 'dormant' | 'archived';

export interface Entity {
  id: string;
  type: EntityType;
  /** Canonicalized value (e.g. E.164 phone, normalized URL). Render in mono. */
  value: string;
  confidence?: Confidence;
}

export interface Threat {
  id: string;
  slug: string;
  category: string;
  title: string;
  summary: string;
}

export interface Campaign {
  id: string;
  status: CampaignStatus;
  title: string;
  confidence: Confidence;
}

export interface Verification {
  /** Official organization a user is routed to (FTC, IC3, CFPB, state AG, …). */
  orgName: string;
  href: string;
  jurisdiction?: string;
}

export interface Explanation {
  summary: string;
  reasons: string[];
  sources: { label: string; href: string }[];
  modelVersion?: string;
  confidence: Confidence;
}

export interface Report {
  id: string;
  status: ReportStatus;
  channel: string;
  createdAt: string;
}

/** Map a calibrated confidence to a coarse band for display (Vol 6/7). */
export function confidenceToBand(c: number): ConfidenceBand {
  if (!Number.isFinite(c) || c < 0.4) return 'low';
  if (c < 0.75) return 'moderate';
  return 'high';
}
