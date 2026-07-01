import { NextResponse } from 'next/server';
import { createClient } from '@/infrastructure/supabase/server';
import { SupabaseClient } from '@supabase/supabase-js';

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const subjectType = searchParams.get('subject_type');
    const subjectId = searchParams.get('subject_id');

    if (!subjectType || !subjectId) {
      return NextResponse.json(
        {
          error: {
            code: 'validation_failed',
            message: 'Both "subject_type" and "subject_id" parameters are required.',
          },
        },
        { status: 422, headers: { 'X-API-Version': 'v1' } }
      );
    }

    const sb = (await createClient()) as unknown as SupabaseClient;

    const { data, error } = await sb
      .from('timeline_events')
      .select('*')
      .eq('subject_type', subjectType)
      .eq('subject_id', subjectId)
      .order('created_at', { ascending: true });

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
