import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { publishReport, rejectReport } from '@/lib/moderation/moderate';
import { isStaff } from '@/lib/moderation/staff';
import { must } from './helpers';

const url = process.env['SUPABASE_URL'] ?? process.env['NEXT_PUBLIC_SUPABASE_URL'];
const serviceKey = process.env['SUPABASE_SERVICE_ROLE_KEY'];
const anonKey = process.env['SUPABASE_ANON_KEY'] ?? process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];
const live = Boolean(url && serviceKey && anonKey);

function userId(res: { data: { user: { id: string } | null }; error: unknown }): string {
  if (res.error) throw res.error;
  if (!res.data.user) throw new Error('createUser returned no user');
  return res.data.user.id;
}

describe.skipIf(!live)('moderation against local Supabase', () => {
  let admin: SupabaseClient;
  let anon: SupabaseClient;
  const suffix = String(Date.now());
  const ids: {
    mod?: string;
    outsider?: string;
    report?: string;
    rejectReport?: string;
    entity?: string;
  } = {};
  const phone = `+1555${suffix.slice(-7)}`;

  beforeAll(async () => {
    admin = createClient(url as string, serviceKey as string, { auth: { persistSession: false } });
    anon = createClient(url as string, anonKey as string, { auth: { persistSession: false } });

    ids.mod = userId(
      await admin.auth.admin.createUser({ email: `mod-${suffix}@itest.dev`, email_confirm: true }),
    );
    await admin
      .from('user_roles')
      .upsert({ user_id: ids.mod, role: 'moderator' }, { onConflict: 'user_id,role' });

    ids.outsider = userId(
      await admin.auth.admin.createUser({ email: `out-${suffix}@itest.dev`, email_confirm: true }),
    );

    const entity = must<{ id: string }>(
      await admin
        .from('entities')
        .insert({ type: 'phone', value_canonical: phone })
        .select('id')
        .single(),
    );
    ids.entity = entity.id;

    const report = must<{ id: string }>(
      await admin
        .from('reports')
        .insert({ channel: 'sms', status: 'pending_review', raw_text: 'pending fixture' })
        .select('id')
        .single(),
    );
    ids.report = report.id;
    await admin
      .from('report_entities')
      .insert({ report_id: ids.report, entity_id: ids.entity, confidence: 0.5 });

    const toReject = must<{ id: string }>(
      await admin
        .from('reports')
        .insert({ channel: 'sms', status: 'pending_review', raw_text: 'spam fixture' })
        .select('id')
        .single(),
    );
    ids.rejectReport = toReject.id;
  });

  afterAll(async () => {
    for (const id of [ids.report, ids.rejectReport])
      if (id) await admin.from('reports').delete().eq('id', id);
    if (ids.entity) await admin.from('entities').delete().eq('id', ids.entity);
    for (const uid of [ids.mod, ids.outsider]) if (uid) await admin.auth.admin.deleteUser(uid);
  });

  it('is_staff() reflects the user_roles grant', async () => {
    expect(await isStaff(admin, ids.mod as string)).toBe(true);
    expect(await isStaff(admin, ids.outsider as string)).toBe(false);
  });

  it('publishing a report makes its entity links visible to anon (live search signal)', async () => {
    // Before: anon cannot see the pending report's entity link.
    const before = await anon
      .from('report_entities')
      .select('report_id')
      .eq('report_id', ids.report);
    expect(before.data?.length ?? 0).toBe(0);

    const ok = await publishReport(admin, ids.report as string, ids.mod as string);
    expect(ok).toBe(true);

    // After: published → anon sees the link, and the report is publicly readable.
    const after = await anon
      .from('report_entities')
      .select('report_id')
      .eq('report_id', ids.report);
    expect(after.data?.length).toBe(1);
    const { data: pub } = await anon
      .from('reports')
      .select('status')
      .eq('id', ids.report)
      .maybeSingle();
    expect(pub?.status).toBe('published');
  });

  it('records an audit row + moderation action on publish', async () => {
    const { count: audits } = await admin
      .from('audit_log')
      .select('*', { count: 'exact', head: true })
      .eq('target_id', ids.report)
      .eq('action', 'report.published');
    expect(audits ?? 0).toBeGreaterThanOrEqual(1);

    const { count: actions } = await admin
      .from('moderation_actions')
      .select('*', { count: 'exact', head: true })
      .eq('target_id', ids.report);
    expect(actions ?? 0).toBeGreaterThanOrEqual(1);
  });

  it('rejecting a report sets status rejected (hidden from anon)', async () => {
    const ok = await rejectReport(admin, ids.rejectReport as string, ids.mod as string, 'spam');
    expect(ok).toBe(true);
    const { data } = await anon
      .from('reports')
      .select('status')
      .eq('id', ids.rejectReport)
      .maybeSingle();
    expect(data).toBeNull();
  });
});
