import { createBrowserClient } from '@supabase/ssr';

import type { Database } from '@/types/database.types';

/**
 * Browser Supabase client. Uses the PUBLIC anon key only — all privileged access
 * is enforced by Row-Level Security (Vol 10) and server-side code. The service-role
 * key MUST NEVER reach the browser.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env['NEXT_PUBLIC_SUPABASE_URL'] ?? '',
    process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] ?? '',
  );
}
