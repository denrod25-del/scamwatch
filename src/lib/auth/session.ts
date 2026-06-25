import { redirect } from 'next/navigation';
import type { SupabaseClient, User } from '@supabase/supabase-js';

import { createClient } from '@/lib/supabase/server';
import { isStaff as isStaffWith } from '@/lib/moderation/staff';

/** The signed-in user, or null. */
export async function getSessionUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** Staff = moderator | analyst | admin (uses the request-session client). */
export async function isStaff(userId: string): Promise<boolean> {
  const supabase = await createClient();
  return isStaffWith(supabase as unknown as SupabaseClient, userId);
}

/** Gate a server component/action to staff. Redirects otherwise. Returns the user. */
export async function requireStaff(): Promise<User> {
  const user = await getSessionUser();
  if (!user) redirect('/login?next=/moderation');
  if (!(await isStaff(user.id))) redirect('/login?error=forbidden');
  return user;
}
