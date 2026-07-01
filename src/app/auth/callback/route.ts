import { NextResponse } from 'next/server';

import { createClient } from '@/infrastructure/supabase/server';

/**
 * Magic-link callback. Exchanges the code for a session, then (optionally)
 * bootstraps the configured operator emails to `admin` on first login so there is
 * a way to seed the very first moderator without direct DB access.
 */
export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const allow = (process.env['BOOTSTRAP_ADMIN_EMAILS'] ?? '')
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
      if (user?.email && allow.includes(user.email.toLowerCase())) {
        try {
          const { createAdminClient } = await import('@/infrastructure/supabase/admin');
          await createAdminClient()
            .from('user_roles')
            .upsert({ user_id: user.id, role: 'admin' }, { onConflict: 'user_id,role' });
        } catch {
          // Non-fatal: login still succeeds; role can be granted manually.
        }
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }
  return NextResponse.redirect(`${origin}/login?error=auth`);
}
