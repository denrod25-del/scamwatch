import 'server-only';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Service-role Supabase client for trusted SERVER-SIDE writes (report submission,
 * background jobs). It BYPASSES Row-Level Security, so it must never reach the
 * browser — the `server-only` import makes a client-side import a build error.
 */
export function createAdminClient(): SupabaseClient {
  const url = process.env['SUPABASE_URL'] ?? process.env['NEXT_PUBLIC_SUPABASE_URL'] ?? '';
  const key = process.env['SUPABASE_SERVICE_ROLE_KEY'] ?? '';
  if (!url || !key) {
    throw new Error('Admin client requires SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY');
  }
  return createClient(url, key, { auth: { persistSession: false } });
}
