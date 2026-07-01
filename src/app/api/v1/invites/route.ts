import { NextResponse } from 'next/server';

const VALID_CODES = ['FL-BETA-2026', 'MIAMI-SAFE'];

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { code } = body || {};

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: { code: 'validation_failed', message: 'code is a required string parameter.' } },
        { status: 422 }
      );
    }

    const isValid = VALID_CODES.includes(code.toUpperCase().trim());

    return NextResponse.json(
      { data: { valid: isValid } },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: 'server_error', message: err.message || 'An unexpected error occurred.' } },
      { status: 500 }
    );
  }
}
