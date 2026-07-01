import type { EntityType, Verdict } from '@/types';

export interface UnderstandItem {
  threat_id: string;
  title: string;
  confidence: number;
}

export interface VerifyItem {
  org: string;
  action: string;
  url: string;
}

export interface ProtectItem {
  step: string;
  urgency: 'low' | 'medium' | 'high';
}

export interface RecommendationPayload {
  understand: UnderstandItem[];
  verify: VerifyItem[];
  protect: ProtectItem[];
  disclaimer: string;
}

export function generateRecommendations(
  verdict: Verdict,
  entityType: EntityType | 'text',
  context: { did_lose_money: boolean; did_share_pii: boolean }
): RecommendationPayload {
  const understand: UnderstandItem[] = [];
  const verify: VerifyItem[] = [];
  const protect: ProtectItem[] = [];
  const disclaimer =
    'Consumer protection information, not legal advice. Always verify with the official organizations listed.';

  // 1. Understand
  if (verdict !== 'No Signal') {
    understand.push({
      threat_id: getThreatSlug(verdict, entityType),
      title: getThreatTitle(verdict, entityType),
      confidence: verdict === 'Confirmed Reported Scam' || verdict === 'Likely Scam' ? 0.91 : 0.65,
    });
  }

  // 2. Verify
  if (
    verdict === 'Confirmed Reported Scam' ||
    verdict === 'Likely Scam' ||
    verdict === 'Use Caution'
  ) {
    verify.push({
      org: 'FTC',
      action: 'Report fraud to the FTC',
      url: 'https://reportfraud.ftc.gov',
    });
    // Priority state launch: Florida
    verify.push({
      org: 'Florida Attorney General',
      action: 'File a complaint with the FL AG office',
      url: 'http://myfloridalegal.com',
    });
  } else {
    verify.push({
      org: 'FTC',
      action: 'Verify and learn about common scams',
      url: 'https://consumer.ftc.gov',
    });
  }

  // 3. Protect
  if (context.did_lose_money) {
    protect.push({
      step: 'Call the official fraud department number printed on the back of your bank card immediately.',
      urgency: 'high',
    });
    protect.push({
      step: "File a formal cybercrime report with the FBI's Internet Crime Complaint Center (IC3).",
      urgency: 'high',
    });
  }

  if (context.did_share_pii) {
    protect.push({
      step: 'Place a free, temporary fraud alert on your credit files by contacting one of the major bureaus (Equifax, Experian, or TransUnion).',
      urgency: 'high',
    });
    protect.push({
      step: 'Change passwords and enable Multi-Factor Authentication (MFA) on any compromised accounts.',
      urgency: 'medium',
    });
  }

  if (protect.length === 0) {
    protect.push({
      step: 'Do not click on links or respond to messages from unverified senders.',
      urgency: 'medium',
    });
    protect.push({
      step: "Block the sender's phone number or email address on your device.",
      urgency: 'low',
    });
  }

  return { understand, verify, protect, disclaimer };
}

function getThreatSlug(verdict: Verdict, _entityType: EntityType | 'text'): string {
  return 'phish_smish';
}

function getThreatTitle(verdict: Verdict, entityType: EntityType | 'text'): string {
  if (entityType === 'phone') return 'SMS Phishing (Smishing) / Vishing';
  if (entityType === 'url') return 'Phishing URL Redirect';
  return 'Unidentified Threat Pattern';
}
