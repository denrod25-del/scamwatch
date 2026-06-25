import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

import type { Database } from '@/types/database.types';

/**
 * Server Supabase client (RSC / route handlers / server actions).
 * Reads/writes the auth cookie via next/headers (Next 15: `await cookies()`).
 * Use the anon key here; RLS governs access. A separate service-role client (not
 * exported to client code) is used only by trusted background jobs (Vol 13).
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env['NEXT_PUBLIC_SUPABASE_URL'] ?? '',
    process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] ?? '',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set({ name, value, ...options });
            }
          } catch {
            // Called from a Server Component where cookies are read-only — safe to ignore;
            // session refresh is handled by middleware (src/middleware.ts).
          }
        },
      },
    },
  );
}
