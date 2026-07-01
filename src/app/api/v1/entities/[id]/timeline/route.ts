import { NextResponse } from 'next/server';
import { createClient } from '@/infrastructure/supabase/server';
import { SupabaseClient } from '@supabase/supabase-js';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: { code: 'validation_failed', message: 'Entity ID is required.' } },
        { status: 422, headers: { 'X-API-Version': 'v1' } }
      );
    }

    const sb = (await createClient()) as unknown as SupabaseClient;

    const { data: timeline, error } = await sb
      .from('timeline_events')
      .select('*')
      .eq('subject_type', 'entity')
      .eq('subject_id', id)
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: { code: 'query_failed', message: error.message } },
        { status: 500, headers: { 'X-API-Version': 'v1' } }
      );
    }

    return NextResponse.json(
      { data: timeline },
      { status: 200, headers: { 'X-API-Version': 'v1' } }
    );
  } catch (err) {
    return NextResponse.json(
      { error: { code: 'server_error', message: 'An unexpected error occurred.' } },
      { status: 500, headers: { 'X-API-Version': 'v1' } }
    );
  }
}
