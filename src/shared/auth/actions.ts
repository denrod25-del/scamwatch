'use server';

import { redirect } from 'next/navigation';

import { createClient } from '@/infrastructure/supabase/server';
import type { LoginState } from './types';

/** Send a Supabase magic-link (OTP) to the email. Creates the user if new. */
export async function sendMagicLink(prev: LoginState, formData: FormData): Promise<LoginState> {
  void prev;
  const email = String(formData.get('email') ?? '').trim();
  if (!email) return { ok: false, error: 'Enter your email address.' };

  const supabase = await createClient();
  const site = process.env['NEXT_PUBLIC_SITE_URL'] ?? '';
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${site}/auth/callback?next=/moderation` },
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true, sent: true };
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}
