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

    // 1) Fetch Entity Canonical Details
    const { data: entity, error: entityErr } = await sb
      .from('entities')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (entityErr || !entity) {
      return NextResponse.json(
        { error: { code: 'not_found', message: 'Entity not found.' } },
        { status: 404, headers: { 'X-API-Version': 'v1' } }
      );
    }

    // 2) Fetch Connected Reports
    const { data: reports } = await sb
      .from('report_entities')
      .select('report_id, confidence, reports(channel, status, created_at)')
      .eq('entity_id', id);

    // 3) Fetch Connected Campaigns
    const { data: campaigns } = await sb
      .from('campaign_entities')
      .select('campaign_id, campaigns(title, status, confidence)')
      .eq('entity_id', id);

    // 4) Fetch Entity Timeline events
    const { data: timeline } = await sb
      .from('timeline_events')
      .select('*')
      .eq('subject_type', 'entity')
      .eq('subject_id', id)
      .order('created_at', { ascending: true });

    return NextResponse.json(
      {
        data: {
          entity,
          reports: reports || [],
          campaigns: campaigns || [],
          timeline: timeline || [],
        },
      },
      { status: 200, headers: { 'X-API-Version': 'v1' } }
    );
  } catch (err) {
    return NextResponse.json(
      { error: { code: 'server_error', message: 'An unexpected error occurred.' } },
      { status: 500, headers: { 'X-API-Version': 'v1' } }
    );
  }
}
