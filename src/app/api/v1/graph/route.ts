import { NextResponse } from 'next/server';
import { createClient } from '@/infrastructure/supabase/server';
import { SupabaseClient } from '@supabase/supabase-js';

export async function GET(): Promise<NextResponse> {
  try {
    const sb = (await createClient()) as unknown as SupabaseClient;

    // 1) Fetch graph edges
    const { data: edges, error: edgesErr } = await sb
      .from('graph_edges')
      .select('*')
      .limit(500);

    if (edgesErr) {
      return NextResponse.json(
        { error: { code: 'query_failed', message: edgesErr.message } },
        { status: 500, headers: { 'X-API-Version': 'v1' } }
      );
    }

    // 2) Fetch entities to serve as base nodes
    const { data: entities } = await sb
      .from('entities')
      .select('id, type, value_canonical')
      .limit(100);

    const nodes = (entities || []).map((ent) => ({
      id: ent.id,
      label: ent.value_canonical,
      type: ent.type,
    }));

    return NextResponse.json(
      {
        data: {
          nodes,
          edges: (edges || []).map((e) => ({
            source: e.source_id,
            target: e.target_id,
            type: e.edge_type,
            weight: e.weight,
          })),
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
