import { NextResponse } from 'next/server';

import { submitReport } from '@/lib/reports/submit';

function envelope(code: string, message: string, status: number): NextResponse {
  return NextResponse.json(
    { error: { code, message } },
    { status, headers: { 'X-API-Version': 'v1' } },
  );
}

/**
 * POST /api/v1/reports — Vol 11. Submits a scam report. Anonymous; the write runs
 * server-side via the service role (see lib/reports/submit). Idempotent via the
 * `Idempotency-Key` header → reports.idempotency_key.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const idempotencyKey = request.headers.get('Idempotency-Key') ?? undefined;

  let body: { channel?: unknown; narrative?: unknown; indicators?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return envelope('invalid_json', 'Request body must be valid JSON.', 400);
  }

  const channel = typeof body.channel === 'string' ? body.channel : '';
  const narrative = typeof body.narrative === 'string' ? body.narrative : '';
  const indicators = Array.isArray(body.indicators)
    ? body.indicators.filter((x): x is string => typeof x === 'string')
    : [];

  if (!channel || !narrative.trim()) {
    return envelope('missing_fields', 'Both "channel" and "narrative" are required.', 422);
  }

  try {
    const report = await submitReport({
      channel,
      narrative,
      indicators,
      reporterId: null,
      idempotencyKey,
    });
    return NextResponse.json(
      { data: { id: report.id, status: report.status, redactions: report.redactions } },
      { status: 201, headers: { 'X-API-Version': 'v1' } },
    );
  } catch {
    // TODO(Vol 14): rate-limit + abuse controls on this public write path.
    return envelope('submission_failed', 'Could not submit the report.', 500);
  }
}
