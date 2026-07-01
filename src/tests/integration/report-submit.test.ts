import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { submitReport } from '@/shared/reports/submit';
import { canonicalizeEntity } from '@/shared/entities/canonicalize';

const url = process.env['SUPABASE_URL'] ?? process.env['NEXT_PUBLIC_SUPABASE_URL'];
const serviceKey = process.env['SUPABASE_SERVICE_ROLE_KEY'];
const liveDb = Boolean(url && serviceKey);

describe.skipIf(!liveDb)('report submission against local Supabase', () => {
  let sb: SupabaseClient;
  const createdReports: string[] = [];
  const suffix = String(Date.now());
  const phone = `+1555${suffix.slice(-7)}`;
  const domain = `itest-${suffix}.example`;
  const canonValues = [phone, domain]
    .map((v) => canonicalizeEntity(v)?.value)
    .filter((v): v is string => Boolean(v));

  beforeAll(() => {
    sb = createClient(url as string, serviceKey as string, { auth: { persistSession: false } });
  });

  afterAll(async () => {
    for (const id of createdReports) await sb.from('reports').delete().eq('id', id);
    for (const value of canonValues)
      await sb.from('entities').delete().eq('value_canonical', value);
  });

  it('stores a de-identified report with linked entities', async () => {
    const result = await submitReport(
      {
        channel: 'sms',
        narrative: `They asked for my SSN 123-45-6789 over text. Reply STOP.`,
        indicators: [phone, domain],
        reporterId: null,
      },
      { getClient: async () => sb },
    );
    createdReports.push(result.id);

    expect(result.entityCount).toBe(2);
    expect(result.redactions).toBe(1);

    const { data: row } = await sb
      .from('reports')
      .select('raw_text, status, reporter_id')
      .eq('id', result.id)
      .single();
    expect(row?.status).toBe('received');
    expect(row?.reporter_id).toBeNull();
    expect(row?.raw_text).not.toContain('123-45-6789');
    expect(row?.raw_text).toContain('[redacted-ssn]');

    const { count } = await sb
      .from('report_entities')
      .select('*', { count: 'exact', head: true })
      .eq('report_id', result.id);
    expect(count).toBe(2);
  });

  it('is idempotent on the idempotency key', async () => {
    const key = `itest-key-${suffix}`;
    const first = await submitReport(
      { channel: 'email', narrative: 'first body', idempotencyKey: key },
      { getClient: async () => sb },
    );
    const second = await submitReport(
      { channel: 'email', narrative: 'different body', idempotencyKey: key },
      { getClient: async () => sb },
    );
    createdReports.push(first.id);
    expect(second.id).toBe(first.id);
  });
});
