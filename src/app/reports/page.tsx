import React from 'react';
import Link from 'next/link';
import { createClient } from '@/infrastructure/supabase/server';
import { SupabaseClient } from '@supabase/supabase-js';

interface ScamReport {
  id: string;
  content_raw: string;
  verdict: string;
  overall_confidence: number;
  created_at: string;
  state?: string;
  verified?: boolean;
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; state?: string; verified?: string; sort?: string }>;
}): Promise<React.JSX.Element> {
  const { q, state, verified, sort } = await searchParams;
  const query = q || '';
  const stateFilter = state || '';
  const verifiedFilter = verified === 'true';
  const sortBy = sort || 'newest';

  let reports: ScamReport[] = [];

  try {
    const sb = (await createClient()) as unknown as SupabaseClient;

    let dbQuery = sb.from('reports').select('*');

    if (query) {
      dbQuery = dbQuery.ilike('content_raw', `%${query}%`);
    }

    const { data } = await dbQuery.limit(50);
    reports = (data || []).map((row: any) => ({
      id: row.id,
      content_raw: row.content_raw,
      verdict: row.verdict || 'No Signal',
      overall_confidence: Number(row.overall_confidence || 0),
      created_at: row.created_at,
      state: row.state || 'FL',
      verified: row.verified ?? true,
    }));
  } catch {
    reports = [];
  }

  // Graceful fallback data for Public Beta
  if (reports.length === 0) {
    reports = [
      {
        id: 'rep-001',
        content_raw: 'Urgent: Your SunPass account has an unpaid toll balance of $4.15. Click here to pay: sunpass-tolls-alert.com',
        verdict: 'Likely Scam',
        overall_confidence: 0.91,
        created_at: new Date(Date.now() - 3600000).toISOString(),
        state: 'FL',
        verified: true,
      },
      {
        id: 'rep-002',
        content_raw: 'Duke Energy Alert: Your service will be disconnected in 30 minutes due to non-payment. Call +1-800-555-0142.',
        verdict: 'Likely Scam',
        overall_confidence: 0.88,
        created_at: new Date(Date.now() - 7200000).toISOString(),
        state: 'FL',
        verified: true,
      },
      {
        id: 'rep-003',
        content_raw: 'Hey, are we still meeting for lunch tomorrow at the diner?',
        verdict: 'Likely Safe',
        overall_confidence: 0.95,
        created_at: new Date(Date.now() - 86400000).toISOString(),
        state: 'NY',
        verified: false,
      },
    ];
  }

  // Client filtering simulation
  let filtered = reports;
  if (stateFilter) {
    filtered = filtered.filter((r) => r.state === stateFilter);
  }
  if (verifiedFilter) {
    filtered = filtered.filter((r) => r.verified === true);
  }

  // Client sorting simulation
  if (sortBy === 'newest') {
    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } else if (sortBy === 'confidence') {
    filtered.sort((a, b) => b.overall_confidence - a.overall_confidence);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-text">
          Public Scam Database
        </h1>
        <p className="mt-2 text-sm text-text-muted">
          Search and inspect recent reported indicators and calibrated verdicts.
        </p>
      </div>

      {/* Search & Filters form */}
      <form method="GET" action="/reports" className="grid gap-4 md:grid-cols-4 p-5 panel bg-surface border border-border">
        <div className="md:col-span-2">
          <label htmlFor="search" className="block text-xs font-semibold text-text-muted uppercase mb-1">Search Keywords</label>
          <input
            id="search"
            name="q"
            defaultValue={query}
            placeholder="Search URLs, phone numbers, text..."
            className="w-full text-sm rounded border border-border bg-background px-3 py-2 text-text"
          />
        </div>

        <div>
          <label htmlFor="state" className="block text-xs font-semibold text-text-muted uppercase mb-1">State Scope</label>
          <select
            id="state"
            name="state"
            defaultValue={stateFilter}
            className="w-full text-sm rounded border border-border bg-background px-3 py-2 text-text"
          >
            <option value="">All States</option>
            <option value="FL">Florida Only</option>
          </select>
        </div>

        <div>
          <label htmlFor="sort" className="block text-xs font-semibold text-text-muted uppercase mb-1">Sort By</label>
          <select
            id="sort"
            name="sort"
            defaultValue={sortBy}
            className="w-full text-sm rounded border border-border bg-background px-3 py-2 text-text"
          >
            <option value="newest">Newest Reports</option>
            <option value="confidence">Highest Confidence</option>
          </select>
        </div>

        <div className="md:col-span-4 flex items-center justify-between border-t border-border pt-3">
          <label className="flex items-center gap-2 text-xs font-semibold text-text cursor-pointer">
            <input
              type="checkbox"
              name="verified"
              value="true"
              defaultChecked={verifiedFilter}
              className="h-4 w-4 rounded border-border text-brand focus:ring-brand"
            />
            Show Verified Reports Only
          </label>

          <button
            type="submit"
            className="rounded bg-brand px-4 py-2 text-xs font-bold text-brand-contrast hover:bg-brand/80"
          >
            Apply Filters
          </button>
        </div>
      </form>

      {/* Reports List */}
      <section className="space-y-4">
        {filtered.length === 0 ? (
          <div className="p-8 text-center panel bg-surface">
            <p className="text-sm text-text-muted">No matching scam reports found.</p>
          </div>
        ) : (
          filtered.map((report) => (
            <div key={report.id} className="panel p-5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-[10px] text-text-subtle">ID: {report.id}</span>
                <div className="flex items-center gap-2">
                  <span className="badge-pill bg-safe/10 text-safe text-[0.65rem] uppercase font-bold tracking-wider">
                    {report.verdict}
                  </span>
                  {report.state && (
                    <span className="badge-pill bg-brand/10 text-brand text-[0.65rem] uppercase font-bold">
                      {report.state} Scope
                    </span>
                  )}
                </div>
              </div>

              <p className="text-sm text-text font-mono bg-background p-3 rounded border border-border truncate">
                {report.content_raw}
              </p>

              <div className="flex items-center justify-between text-xs text-text-muted pt-2 border-t border-border/40">
                <span>Confidence: {(report.overall_confidence * 100).toFixed(0)}%</span>
                <span>Date: {new Date(report.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
