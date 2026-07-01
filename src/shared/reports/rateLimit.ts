import type { SupabaseClient } from '@supabase/supabase-js';

export interface RateLimitConfig {
  max: number;
  windowSeconds: number;
}

/**
 * Default limit for the report write path. Tuned to allow legitimate bursts (a
 * victim may file a few related reports) while throttling spam/poisoning. NOTE:
 * IP-keyed, so users behind shared NAT share a budget — production should add
 * per-account limits + a challenge (Vol 14). Kept generous for that reason.
 */
export const REPORT_RATE_LIMIT: RateLimitConfig = { max: 8, windowSeconds: 600 };

export class RateLimitError extends Error {
  readonly retryAfterSeconds: number;
  constructor(retryAfterSeconds: number) {
    super('rate_limited');
    this.name = 'RateLimitError';
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

/** Extract a client IP from proxy headers (first hop of x-forwarded-for). */
export function clientIp(forwardedFor: string | null, realIp?: string | null): string {
  const first = forwardedFor?.split(',')[0]?.trim();
  if (first) return first;
  const real = realIp?.trim();
  if (real) return real;
  return 'unknown';
}

/**
 * Throws RateLimitError if `bucket` is over its limit. Fails OPEN on infra error
 * (a broken limiter must not block legitimate reporting) — the failure is swallowed
 * rather than denying the user.
 */
export async function enforceRateLimit(
  sb: SupabaseClient,
  bucket: string,
  cfg: RateLimitConfig = REPORT_RATE_LIMIT,
): Promise<void> {
  const { data, error } = await sb.rpc('check_rate_limit', {
    p_bucket: bucket,
    p_max: cfg.max,
    p_window_seconds: cfg.windowSeconds,
  });
  if (error) return; // fail open
  if (data === false) throw new RateLimitError(cfg.windowSeconds);
}
