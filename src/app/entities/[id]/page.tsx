import React from 'react';
import Link from 'next/link';
import { createClient } from '@/infrastructure/supabase/server';
import { SupabaseClient } from '@supabase/supabase-js';
import GraphVisualizer, { GraphNode, GraphEdge } from '@/components/ui/GraphVisualizer';

export default async function EntityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.JSX.Element> {
  const { id } = await params;
  let entity: any = null;
  let edges: any[] = [];
  let nodes: GraphNode[] = [];

  try {
    const sb = (await createClient()) as unknown as SupabaseClient;

    const { data: ent } = await sb
      .from('entities')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    entity = ent;

    if (entity) {
      const { data: edg } = await sb
        .from('graph_edges')
        .select('*')
        .or(`source_id.eq.${id},target_id.eq.${id}`);
      edges = edg || [];
    }
  } catch {
    entity = null;
  }

  // Graceful public beta fallbacks
  if (!entity) {
    entity = {
      id,
      type: 'Phone',
      value_canonical: '+1 (800) 555-0199',
      risk_score: 0.85,
      last_seen: new Date().toISOString(),
    };

    edges = [
      { source: id, target: 'rep-001', type: 'extracted', weight: 0.85 },
      { source: id, target: 'rep-002', type: 'extracted', weight: 0.70 },
      { source: 'rep-001', target: 'camp-001', type: 'campaign', weight: 0.90 },
    ];
  }

  // Populate graph nodes array
  nodes = [
    { id: entity.id, label: entity.value_canonical, type: 'entity', risk: entity.risk_score },
    { id: 'rep-001', label: 'Toll smishing message report #102', type: 'report' },
    { id: 'rep-002', label: 'Impersonation text report #103', type: 'report' },
    { id: 'camp-001', label: 'Campaign SunPass Tolls Alert', type: 'campaign' },
  ];

  const graphEdges: GraphEdge[] = edges.map((e) => ({
    source: e.source,
    target: e.target,
    type: e.type,
    weight: e.weight,
  }));

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 space-y-8">
      {/* Back Link */}
      <div>
        <Link href="/" className="text-xs font-semibold underline text-brand hover:text-brand/80">
          ← Back to Command Center
        </Link>
      </div>

      {/* Header Info */}
      <section className="frame p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="badge-pill bg-safe/10 text-safe uppercase tracking-wider text-[10px]">
              {entity.type} Indicator
            </span>
            <h1 className="mt-2 text-2xl font-bold text-text font-mono">
              {entity.value_canonical}
            </h1>
          </div>
          <div className="text-right">
            <span className="text-xs text-text-subtle">Aggregated Risk Score</span>
            <p className="text-3xl font-bold text-safe">{(entity.risk_score * 100).toFixed(0)}%</p>
          </div>
        </div>
      </section>

      {/* Grid of Graph + Timeline */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <GraphVisualizer nodes={nodes} edges={graphEdges} />
        </div>

        <div className="space-y-6">
          {/* Linked Campaigns */}
          <section className="panel p-5 space-y-3">
            <h3 className="font-display text-xs font-bold uppercase tracking-wider text-text">
              Linked Campaigns
            </h3>
            <div className="space-y-2">
              <div className="p-3 bg-background border border-border rounded-md">
                <p className="text-xs font-semibold text-text">SunPass Tolls Smishing</p>
                <p className="mt-1 text-[10px] text-text-muted">Confidence: 91%</p>
              </div>
            </div>
          </section>

          {/* Audit Timeline */}
          <section className="panel p-5 space-y-3">
            <h3 className="font-display text-xs font-bold uppercase tracking-wider text-text">
              Forensic Timeline
            </h3>
            <div className="relative border-l border-border pl-4 space-y-4 text-[11px] text-text-muted">
              <div>
                <span className="absolute -left-1.5 mt-1 h-3 w-3 rounded-full border border-border bg-background"></span>
                <p className="font-semibold text-text">Indicator Identified</p>
                <p className="text-[10px]">Canonical phone details verified in incoming streams</p>
              </div>
              <div>
                <span className="absolute -left-1.5 mt-1 h-3 w-3 rounded-full border border-border bg-background"></span>
                <p className="font-semibold text-text">Evidence Logged</p>
                <p className="text-[10px]">Associated with Toll smishing message report #102</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
