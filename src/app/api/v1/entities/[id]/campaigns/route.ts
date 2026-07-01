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

    const { data: campaigns, error } = await sb
      .from('campaign_entities')
      .select('campaign_id, campaigns(title, status, confidence)')
      .eq('entity_id', id);

    if (error) {
      return NextResponse.json(
        { error: { code: 'query_failed', message: error.message } },
        { status: 500, headers: { 'X-API-Version': 'v1' } }
      );
    }

    return NextResponse.json(
      { data: campaigns || [] },
      { status: 200, headers: { 'X-API-Version': 'v1' } }
    );
  } catch (err) {
    return NextResponse.json(
      { error: { code: 'server_error', message: 'An unexpected error occurred.' } },
      { status: 500, headers: { 'X-API-Version': 'v1' } }
    );
  }
}
