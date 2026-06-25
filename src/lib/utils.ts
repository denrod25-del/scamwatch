import { confidenceToBand, type ConfidenceBand } from '@/types';

/**
 * Minimal className combiner (clsx-style) with no external dependency.
 * Accepts strings, falsy values, and arrays; dedupes whitespace.
 */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
}

/** Human-readable confidence band word for display (Vol 6/7 — no false precision). */
export function formatConfidence(value: number): ConfidenceBand {
  return confidenceToBand(value);
}
