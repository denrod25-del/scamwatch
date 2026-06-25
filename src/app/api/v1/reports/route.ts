import { NextResponse } from 'next/server';

import { createAdminClient } from '@/lib/supabase/admin';
import { submitReport } from '@/lib/reports/submit';
import { clientIp, enforceRateLimit, RateLimitError } from '@/lib/reports/rateLimit';

function envelope(code: string, message: string, status: number): NextResponse {
  return NextResponse.json(
    { error: { code, message } },
    { status, headers: { 'X-API-Version': 'v1' } },
  );
}

/**
 * POST /api/v1/reports — Vol 11. Submits a scam report. Anonymous; the write runs
 * server-side via the service role. Idempotent via `Idempotency-Key`. Rate-limited
 * per client IP (Vol 14) BEFORE validation, so malformed spam is throttled too.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const idempotencyKey = request.headers.get('Idempotency-Key') ?? undefined;
  const ip = clientIp(request.headers.get('x-forwarded-for'), request.headers.get('x-real-ip'));

  let body: { channel?: unknown; narrative?: unknown; indicators?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return envelope('invalid_json', 'Request body must be valid JSON.', 400);
  }

  try {
    const admin = createAdminClient();
    await enforceRateLimit(admin, `report:${ip}`);

    const channel = typeof body.channel === 'string' ? body.channel : '';
    const narrative = typeof body.narrative === 'string' ? body.narrative : '';
    const indicators = Array.isArray(body.indicators)
      ? body.indicators.filter((x): x is string => typeof x === 'string')
      : [];
    if (!channel || !narrative.trim()) {
      return envelope('missing_fields', 'Both "channel" and "narrative" are required.', 422);
    }

    const report = await submitReport(
      { channel, narrative, indicators, reporterId: null, idempotencyKey },
      { getClient: async () => admin },
    );
    return NextResponse.json(
      { data: { id: report.id, status: report.status, redactions: report.redactions } },
      { status: 201, headers: { 'X-API-Version': 'v1' } },
    );
  } catch (e) {
    if (e instanceof RateLimitError) {
      return NextResponse.json(
        {
          error: {
            code: 'rate_limited',
            message: 'Too many submissions. Please wait and try again.',
          },
        },
        {
          status: 429,
          headers: { 'X-API-Version': 'v1', 'Retry-After': String(e.retryAfterSeconds) },
        },
      );
    }
    return envelope('submission_failed', 'Could not submit the report.', 500);
  }
}
