import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { fetchEntitySignal, lookup } from '@/lib/search/lookup';
import { canonicalizeEntity } from '@/lib/entities/canonicalize';
import type { ClassifyResult } from '@/lib/ai/classify';

/**
 * Integration test for the search DB path against a LOCAL Supabase instance.
 *
 * Run: `supabase start` (applies migrations + seed), then
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npm run test:integration
 * (the .env.local loader in setup.ts can supply these). Auto-skips without them.
 *
 * Uses the service-role key to seed fixtures (bypasses RLS) and cleans up after.
 */
const url = process.env['SUPABASE_URL'] ?? process.env['NEXT_PUBLIC_SUPABASE_URL'];
const serviceKey = process.env['SUPABASE_SERVICE_ROLE_KEY'];
const liveDb = Boolean(url && serviceKey);

const abstain = async (): Promise<ClassifyResult> => ({
  verdict: 'No Signal',
  confidence: 0,
  abstained: true,
});

function must<T>(res: { data: T | null; error: unknown }): T {
  if (res.error) throw res.error;
  if (res.data === null) throw new Error('expected data, received null');
  return res.data;
}

describe.skipIf(!liveDb)('search DB path against local Supabase', () => {
  let sb: SupabaseClient;
  const suffix = String(Date.now());
  const rawPhone = `+1555${suffix.slice(-7)}`;
  const phone = canonicalizeEntity(rawPhone)?.value ?? rawPhone;
  const threatSlug = `itest-scam-${suffix}`;
  const ids: { entity?: string; report?: string; threat?: string } = {};

  beforeAll(async () => {
    sb = createClient(url as string, serviceKey as string, {
      auth: { persistSession: false },
    });

    const threat = must<{ id: string }>(
      await sb
        .from('threats')
        .insert({
          slug: threatSlug,
          category: 'test',
          title: 'Integration test scam',
          summary: 'fixture',
        })
        .select('id')
        .single(),
    );
    ids.threat = threat.id;

    const entity = must<{ id: string }>(
      await sb
        .from('entities')
        .insert({ type: 'phone', value_canonical: phone })
        .select('id')
        .single(),
    );
    ids.entity = entity.id;

    const report = must<{ id: string }>(
      await sb
        .from('reports')
        .insert({ channel: 'sms', status: 'published', raw_text: 'fixture' })
        .select('id')
        .single(),
    );
    ids.report = report.id;

    must(
      await sb
        .from('report_entities')
        .insert({ report_id: report.id, entity_id: entity.id, confidence: 0.9 })
        .select(),
    );
    must(
      await sb
        .from('report_threats')
        .insert({ report_id: report.id, threat_id: threat.id, confidence: 0.92 })
        .select(),
    );
  });

  afterAll(async () => {
    // FK cascades from reports clean up the join rows.
    if (ids.report) await sb.from('reports').delete().eq('id', ids.report);
    if (ids.entity) await sb.from('entities').delete().eq('id', ids.entity);
    if (ids.threat) await sb.from('threats').delete().eq('id', ids.threat);
  });

  it('fetchEntitySignal returns the published report and its related threat', async () => {
    const signal = await fetchEntitySignal(sb, 'phone', phone);
    expect(signal.reportCount).toBe(1);
    expect(signal.maxThreatConfidence).toBeGreaterThanOrEqual(0.9);
    expect(signal.relatedThreats.map((t) => t.title)).toContain('Integration test scam');
  });

  it('lookup() derives Confirmed Reported Scam from real DB signal (classifier stubbed)', async () => {
    const result = await lookup(rawPhone, { getClient: async () => sb, classify: abstain });
    expect(result.entityType).toBe('phone');
    expect(result.reportCount).toBe(1);
    expect(result.verdict).toBe('Confirmed Reported Scam');
  });

  it('lookup() returns No Signal for an entity with no reports', async () => {
    const result = await lookup('+19990000000', { getClient: async () => sb, classify: abstain });
    expect(result.reportCount).toBe(0);
    expect(result.verdict).toBe('No Signal');
  });
});
