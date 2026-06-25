import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { enforceRateLimit, RateLimitError } from '@/lib/reports/rateLimit';

const url = process.env['SUPABASE_URL'] ?? process.env['NEXT_PUBLIC_SUPABASE_URL'];
const serviceKey = process.env['SUPABASE_SERVICE_ROLE_KEY'];
const liveDb = Boolean(url && serviceKey);

describe.skipIf(!liveDb)('rate limiting against local Supabase', () => {
  let sb: SupabaseClient;
  const bucket = `itest-rl-${Date.now()}`;

  beforeAll(() => {
    sb = createClient(url as string, serviceKey as string, { auth: { persistSession: false } });
  });

  afterAll(async () => {
    await sb.from('rate_limit_hits').delete().eq('bucket', bucket);
  });

  it('allows up to the max, then denies', async () => {
    const cfg = { max: 3, windowSeconds: 60 };
    const outcomes: boolean[] = [];
    for (let i = 0; i < cfg.max + 1; i++) {
      try {
        await enforceRateLimit(sb, bucket, cfg);
        outcomes.push(true);
      } catch (e) {
        outcomes.push(!(e instanceof RateLimitError));
      }
    }
    // First `max` allowed, the next denied.
    expect(outcomes.slice(0, cfg.max).every((o) => o === true)).toBe(true);
    expect(outcomes[cfg.max]).toBe(false);
  });

  it('keeps separate buckets independent', async () => {
    const cfg = { max: 1, windowSeconds: 60 };
    const otherBucket = `${bucket}-other`;
    await enforceRateLimit(sb, otherBucket, cfg); // first call on a fresh bucket: allowed
    await expect(enforceRateLimit(sb, otherBucket, cfg)).rejects.toBeInstanceOf(RateLimitError);
    await sb.from('rate_limit_hits').delete().eq('bucket', otherBucket);
  });
});
