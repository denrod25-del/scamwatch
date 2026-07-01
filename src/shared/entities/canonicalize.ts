import type { EntityType } from '@/types';

/**
 * Detect + canonicalize a search query into a fraud-infrastructure entity (Vol 8/9).
 * Pure functions — no I/O — so they are unit-tested and reused by search, ingestion,
 * and the report wizard. Free text (no recognizable entity) returns null.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const SCHEME_RE = /^[a-z][a-z0-9+.-]*:\/\//i;
const HANDLE_RE = /^@[a-z0-9_]{2,30}$/i;
const EVM_RE = /^0x[a-fA-F0-9]{40}$/;
const BTC_RE = /^(bc1[a-z0-9]{11,71}|[13][a-km-zA-HJ-NP-Z1-9]{25,34})$/;
const PHONE_RE = /^[+(]?[\d\s().+-]{7,20}$/;
const HOSTISH_RE = /^[a-z0-9-]+(\.[a-z0-9-]+)+/i;

export interface CanonicalEntity {
  type: EntityType;
  value: string;
}

export function detectEntityType(input: string): EntityType | null {
  const s = input.trim();
  if (!s) return null;

  if (EMAIL_RE.test(s)) return 'email';
  if (EVM_RE.test(s) || BTC_RE.test(s)) return 'wallet';
  if (HANDLE_RE.test(s)) return 'handle';

  // Phone before host detection so dotted numbers (1.800.555.1234) aren't read as domains.
  const digits = s.replace(/\D/g, '');
  if (PHONE_RE.test(s) && digits.length >= 7 && digits.length <= 15) return 'phone';

  const hasScheme = SCHEME_RE.test(s);
  const body = s.replace(SCHEME_RE, '');
  const looksHost = HOSTISH_RE.test(body);
  if (hasScheme || (looksHost && /[/?#]/.test(body))) return 'url';
  if (looksHost) return 'domain';

  return null; // free text → classified by the AI engine, not canonicalized
}

export function canonicalizeEntity(input: string): CanonicalEntity | null {
  const type = detectEntityType(input);
  if (!type) return null;
  const s = input.trim();

  switch (type) {
    case 'email':
      return { type, value: s.toLowerCase() };
    case 'phone':
      return { type, value: normalizePhone(s) };
    case 'handle':
      return { type, value: s.toLowerCase() };
    case 'wallet':
      // EVM addresses are case-insensitive (lowercase); BTC is case-sensitive (keep as-is).
      return { type, value: /^0x/i.test(s) ? s.toLowerCase() : s };
    case 'url':
    case 'domain':
      return { type, value: normalizeHost(type, s) };
    default:
      return { type, value: s };
  }
}

function normalizePhone(s: string): string {
  const digits = s.replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`; // assume NANP for bare 10-digit
  if (s.trim().startsWith('+')) return `+${digits}`;
  return digits;
}

function normalizeHost(type: EntityType, s: string): string {
  try {
    const url = new URL(SCHEME_RE.test(s) ? s : `https://${s}`);
    const host = url.hostname.toLowerCase().replace(/^www\./, '');
    if (type === 'domain') return host;
    const path = url.pathname.replace(/\/$/, '');
    return `${host}${path}${url.search}`.toLowerCase();
  } catch {
    return s.toLowerCase();
  }
}
