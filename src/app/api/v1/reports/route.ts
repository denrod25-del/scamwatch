import { NextResponse } from 'next/server';

/**
 * POST /api/v1/reports — Vol 11 (API Spec). Submission is idempotent via the
 * `Idempotency-Key` header → reports.idempotency_key (Vol 10/11). Stub returns the
 * canonical error envelope with 501. Real handler enqueues an async job (pgmq, Vol 13)
 * rather than calling the AI engine inline.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const idempotencyKey = request.headers.get('Idempotency-Key');
  return NextResponse.json(
    {
      error: {
        code: 'not_implemented',
        message: 'Report submission is not implemented yet. See PRD Volume 11 (API).',
        idempotencyKeyReceived: Boolean(idempotencyKey),
      },
    },
    { status: 501, headers: { 'X-API-Version': 'v1' } },
  );
}
