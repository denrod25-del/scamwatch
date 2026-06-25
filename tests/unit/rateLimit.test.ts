import { describe, it, expect } from 'vitest';

import { clientIp, RateLimitError } from '@/lib/reports/rateLimit';

describe('clientIp', () => {
  it('takes the first hop of x-forwarded-for', () => {
    expect(clientIp('203.0.113.7, 70.41.3.18, 150.172.238.178', '10.0.0.1')).toBe('203.0.113.7');
  });

  it('falls back to x-real-ip when forwarded-for is absent', () => {
    expect(clientIp(null, '198.51.100.9')).toBe('198.51.100.9');
  });

  it('returns "unknown" when no headers are present', () => {
    expect(clientIp(null, null)).toBe('unknown');
    expect(clientIp('', '')).toBe('unknown');
  });
});

describe('RateLimitError', () => {
  it('carries the retry-after window', () => {
    const err = new RateLimitError(600);
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe('RateLimitError');
    expect(err.retryAfterSeconds).toBe(600);
  });
});
