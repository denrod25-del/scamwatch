import { NextResponse } from 'next/server';
import { createClient } from '@/infrastructure/supabase/server';
import { createInvestigation } from '@/modules/investigations';
import { SupabaseClient } from '@supabase/supabase-js';

export async function GET(): Promise<NextResponse> {
  try {
    const sb = (await createClient()) as unknown as SupabaseClient;

    const { data, error } = await sb
      .from('investigations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: { code: 'query_failed', message: error.message } },
        { status: 500, headers: { 'X-API-Version': 'v1' } }
      );
    }

    return NextResponse.json(
      { data },
      { status: 200, headers: { 'X-API-Version': 'v1' } }
    );
  } catch (err) {
    return NextResponse.json(
      { error: { code: 'server_error', message: 'An unexpected error occurred.' } },
      { status: 500, headers: { 'X-API-Version': 'v1' } }
    );
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { title, report_ids, entity_ids } = body || {};

    if (!title || typeof title !== 'string') {
      return NextResponse.json(
        { error: { code: 'validation_failed', message: 'Title is a required string parameter.' } },
        { status: 422, headers: { 'X-API-Version': 'v1' } }
      );
    }

    const sb = (await createClient()) as unknown as SupabaseClient;
    const investigationId = await createInvestigation(
      sb,
      title,
      report_ids || [],
      entity_ids || []
    );

    return NextResponse.json(
      { data: { id: investigationId, title, status: 'active' } },
      { status: 201, headers: { 'X-API-Version': 'v1' } }
    );
  } catch (err) {
    return NextResponse.json(
      { error: { code: 'server_error', message: 'An unexpected error occurred.' } },
      { status: 500, headers: { 'X-API-Version': 'v1' } }
    );
  }
}
