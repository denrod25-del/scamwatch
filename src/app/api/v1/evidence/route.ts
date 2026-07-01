import { NextResponse } from 'next/server';
import { createClient } from '@/infrastructure/supabase/server';
import { SupabaseClient } from '@supabase/supabase-js';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { type, confidence, metadata, report_id, entity_id } = body || {};

    if (!type || typeof type !== 'string' || typeof confidence !== 'number') {
      return NextResponse.json(
        {
          error: {
            code: 'validation_failed',
            message: 'Both "type" (string) and "confidence" (number) parameters are required.',
          },
        },
        { status: 422, headers: { 'X-API-Version': 'v1' } }
      );
    }

    const sb = (await createClient()) as unknown as SupabaseClient;

    const { data: node, error } = await sb
      .from('evidence_nodes')
      .insert({
        report_id: report_id || null,
        entity_id: entity_id || null,
        type,
        confidence,
        metadata: metadata || {},
      })
      .select('*')
      .single();

    if (error || !node) {
      return NextResponse.json(
        { error: { code: 'insert_failed', message: error?.message || 'unknown error' } },
        { status: 500, headers: { 'X-API-Version': 'v1' } }
      );
    }

    return NextResponse.json(
      { data: node },
      { status: 201, headers: { 'X-API-Version': 'v1' } }
    );
  } catch (err) {
    return NextResponse.json(
      { error: { code: 'server_error', message: 'An unexpected error occurred.' } },
      { status: 500, headers: { 'X-API-Version': 'v1' } }
    );
  }
}
