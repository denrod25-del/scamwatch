/**
 * De-identification (Vol 8 / Vol 14). Removes high-risk reporter PII from a
 * narrative before it is stored or sent to any AI provider. Scope is deliberately
 * precise: SSNs and valid payment-card numbers — values that are victim PII and
 * never useful as scam signal. Scam indicators (phones, URLs, emails) are NOT
 * redacted here; they are captured as entities. Broader NER de-id (names,
 * addresses) is future work (Vol 8). Pure + unit-tested.
 */

const SSN_RE = /\b\d{3}-\d{2}-\d{4}\b/g;
// Candidate card-number runs: 13–19 digits, optionally separated by spaces/dashes.
const CARD_RE = /\b(?:\d[ -]?){13,19}\b/g;

function luhn(digits: string): boolean {
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = digits.charCodeAt(i) - 48;
    if (d < 0 || d > 9) return false;
    if (alt) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    alt = !alt;
  }
  return sum % 10 === 0;
}

export interface RedactionResult {
  text: string;
  redactions: number;
}

export function redactPII(input: string): RedactionResult {
  let redactions = 0;

  let text = input.replace(SSN_RE, () => {
    redactions++;
    return '[redacted-ssn]';
  });

  text = text.replace(CARD_RE, (match) => {
    const digits = match.replace(/\D/g, '');
    if (digits.length >= 13 && digits.length <= 19 && luhn(digits)) {
      redactions++;
      return '[redacted-card]';
    }
    return match; // not a valid card — leave it (could be an order/ref number)
  });

  return { text, redactions };
}
