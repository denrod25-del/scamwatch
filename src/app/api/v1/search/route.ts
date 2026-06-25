import { NextResponse } from 'next/server';

/**
 * GET /api/v1/search?q= — Vol 11 (API Spec). Stub: returns the canonical error
 * envelope with 501 until the search + AI pipeline is wired (Vol 8).
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    {
      error: {
        code: 'not_implemented',
        message: 'Search is not implemented yet. See PRD Volume 11 (API) and Volume 8 (AI).',
      },
    },
    { status: 501, headers: { 'X-API-Version': 'v1' } },
  );
}
