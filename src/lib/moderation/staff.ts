import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Whether a user is staff (moderator | analyst | admin), via the SECURITY DEFINER
 * is_staff() function. Takes a client so it works with both the request-session
 * client and the service-role client (tests).
 */
export async function isStaff(sb: SupabaseClient, userId: string): Promise<boolean> {
  const { data, error } = await sb.rpc('is_staff', { uid: userId });
  if (error) return false;
  return data === true;
}
