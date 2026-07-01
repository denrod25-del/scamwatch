import type { EntityType, Verdict } from '@/types';

export interface Citation {
  entity_id: string;
  raw_value: string;
  resolved_label: string;
}

export interface ExplanationPayload {
  text: string;
  citations: Citation[];
}

export function generateExplanation(
  verdict: Verdict,
  query: string,
  entityType: EntityType | 'text',
  abstained: boolean
): ExplanationPayload {
  if (abstained || verdict === 'No Signal') {
    return {
      text: 'Our analysis did not find clear matches to known scam patterns (No Signal). However, this does not guarantee safety. We recommend verifying the sender independently using official contacts.',
      citations: [],
    };
  }

  const confidenceBand = getConfidenceBand(verdict);
  let text = `This message is classified as a ${verdict} (${confidenceBand} Confidence).`;
  const citations: Citation[] = [];

  if (entityType !== 'text') {
    const label = getEntityLabel(entityType);
    text += ` It contains a flagged ${entityType} (${query}) which matches known fraud patterns.`;
    citations.push({
      entity_id: `${entityType}_1`,
      raw_value: query,
      resolved_label: label,
    });
  }

  return { text, citations };
}

function getConfidenceBand(verdict: Verdict): 'Low' | 'Moderate' | 'High' {
  if (verdict === 'Likely Safe' || verdict === 'No Signal') return 'Low';
  if (verdict === 'Use Caution') return 'Moderate';
  return 'High';
}

function getEntityLabel(type: EntityType): string {
  switch (type) {
    case 'url':
      return 'Lookalike Domain';
    case 'phone':
      return 'Flagged Phone Number';
    case 'email':
      return 'Flagged Email Address';
    case 'crypto':
      return 'Crypto Wallet';
    default:
      return 'Extracted Indicator';
  }
}
