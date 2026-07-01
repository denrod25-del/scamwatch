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

    // Fetch edges connected to this entity (either source or target)
    const { data: edges, error: edgesErr } = await sb
      .from('graph_edges')
      .select('*')
      .or(`source_id.eq.${id},target_id.eq.${id}`);

    if (edgesErr) {
      return NextResponse.json(
        { error: { code: 'query_failed', message: edgesErr.message } },
        { status: 500, headers: { 'X-API-Version': 'v1' } }
      );
    }

    // Build unique nodes set
    const nodeIds = new Set<string>([id]);
    (edges || []).forEach((e) => {
      nodeIds.add(e.source_id);
      nodeIds.add(e.target_id);
    });

    const { data: entities } = await sb
      .from('entities')
      .select('id, type, value_canonical')
      .in('id', Array.from(nodeIds));

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
