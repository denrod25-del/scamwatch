import { canonicalizeEntity, type CanonicalEntity } from './canonicalize';

/**
 * Extract fraud-infrastructure entities from free narrative text (Vol 8). This is
 * what turns a free-text report ("they texted me from +1 555… with bit.ly/x") into
 * searchable signal. Pure + unit-tested. Heuristic (regex + canonicalization), not
 * an LLM — deeper extraction is a future model step.
 *
 * Patterns are consumed in order (email → url → domain → wallet → handle → phone),
 * blanking matched spans so later patterns don't re-match fragments (e.g. the
 * "@domain" inside an email must not become a handle).
 */
const EMAIL = /[^\s@]+@[^\s@]+\.[^\s@]{2,}/g;
const URL_SCHEME = /\bhttps?:\/\/[^\s)]+/gi;
const DOMAIN = /\b[a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,}(?:\/[^\s)]*)?/gi;
const EVM = /0x[a-fA-F0-9]{40}/g;
const BTC = /\b(?:bc1[a-z0-9]{11,71}|[13][a-km-zA-HJ-NP-Z1-9]{25,34})\b/g;
const HANDLE = /@[a-z0-9_]{2,30}/gi;
const PHONE = /\+?\d[\d ().-]{6,}\d/g;

const ORDER: RegExp[] = [EMAIL, URL_SCHEME, DOMAIN, EVM, BTC, HANDLE, PHONE];

export function extractEntities(text: string): CanonicalEntity[] {
  if (!text) return [];
  let work = text;
  const found = new Map<string, CanonicalEntity>();

  for (const re of ORDER) {
    const matches = work.match(re) ?? [];
    for (const m of matches) {
      // Trim surrounding sentence punctuation the greedy patterns may have caught.
      const cleaned = m.trim().replace(/[.,;:!?)\]'"]+$/, '');
      const canon = canonicalizeEntity(cleaned);
      if (canon) found.set(`${canon.type}:${canon.value}`, canon);
    }
    work = work.replace(re, ' '); // remove matched spans before the next pattern
  }

  return [...found.values()];
}
