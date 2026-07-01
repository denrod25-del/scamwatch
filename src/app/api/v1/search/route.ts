import { NextResponse } from 'next/server';
import { lookup } from '@/shared/search/lookup';

/**
 * GET /api/v1/search?q= — Vol 11 (API Spec).
 * Performs lookup on the query and returns the derived verdict.
 */
export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q || !q.trim()) {
    return NextResponse.json(
      {
        error: {
          code: 'validation_failed',
          message: 'Query parameter "q" is required.',
        },
      },
      { status: 422, headers: { 'X-API-Version': 'v1' } }
    );
  }

  try {
    const result = await lookup(q);
    return NextResponse.json(
      { data: result },
      { status: 200, headers: { 'X-API-Version': 'v1' } }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: 'search_failed',
          message: 'An error occurred while performing search check.',
        },
      },
      { status: 500, headers: { 'X-API-Version': 'v1' } }
    );
  }
}
