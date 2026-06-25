import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { must } from './helpers';

const url = process.env['SUPABASE_URL'] ?? process.env['NEXT_PUBLIC_SUPABASE_URL'];
const serviceKey = process.env['SUPABASE_SERVICE_ROLE_KEY'];
const anonKey = process.env['SUPABASE_ANON_KEY'] ?? process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];
const live = Boolean(url && serviceKey && anonKey);

/**
 * Verifies the RLS policies from 0002 directly: an unauthenticated (anon) caller
 * may read PUBLISHED reports only, and cannot write intelligence tables. This is
 * the security contract that lets anonymous report submission run server-side
 * (service role) while keeping direct client writes locked.
 */
describe.skipIf(!live)('RLS policies (anon vs service role)', () => {
  let admin: SupabaseClient;
  let anon: SupabaseClient;
  const ids: { published?: string; unpublished?: string } = {};

  beforeAll(async () => {
    admin = createClient(url as string, serviceKey as string, { auth: { persistSession: false } });
    anon = createClient(url as string, anonKey as string, { auth: { persistSession: false } });

    const published = must<{ id: string }>(
      await admin
        .from('reports')
        .insert({ channel: 'web', status: 'published', raw_text: 'published fixture' })
        .select('id')
        .single(),
    );
    ids.published = published.id;

    const unpublished = must<{ id: string }>(
      await admin
        .from('reports')
        .insert({ channel: 'web', status: 'received', raw_text: 'unpublished fixture' })
        .select('id')
        .single(),
    );
    ids.unpublished = unpublished.id;
  });

  afterAll(async () => {
    if (ids.published) await admin.from('reports').delete().eq('id', ids.published);
    if (ids.unpublished) await admin.from('reports').delete().eq('id', ids.unpublished);
  });

  it('anon CAN read a published report', async () => {
    const { data } = await anon.from('reports').select('id').eq('id', ids.published).maybeSingle();
    expect(data?.id).toBe(ids.published);
  });

  it('anon CANNOT read an unpublished report', async () => {
    const { data } = await anon
      .from('reports')
      .select('id')
      .eq('id', ids.unpublished)
      .maybeSingle();
    expect(data).toBeNull();
  });

  it('anon CANNOT insert a report directly (writes must go through the server)', async () => {
    const { error } = await anon
      .from('reports')
      .insert({ channel: 'web', status: 'received', raw_text: 'anon attempt' });
    expect(error).not.toBeNull();
  });

  it('anon CANNOT insert a threat', async () => {
    const { error } = await anon.from('threats').insert({
      slug: `rls-attempt-${Date.now()}`,
      category: 'x',
      title: 't',
      summary: 's',
    });
    expect(error).not.toBeNull();
  });
});
