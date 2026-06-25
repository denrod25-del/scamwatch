'use client';

import { useActionState } from 'react';

import { sendMagicLink } from '@/lib/auth/actions';
import type { LoginState } from '@/lib/auth/types';

const INITIAL: LoginState = { ok: false };

export default function LoginForm({ forbidden }: { forbidden?: boolean }): React.JSX.Element {
  const [state, formAction, pending] = useActionState(sendMagicLink, INITIAL);

  if (state.sent) {
    return (
      <div className="rounded-lg border border-safe-border bg-safe-bg p-5 text-safe-fg">
        <p className="font-medium">Check your email.</p>
        <p className="mt-1 text-sm text-text">
          We sent you a one-time sign-in link. Open it on this device to continue.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      {forbidden ? (
        <p role="alert" className="text-sm text-danger-fg">
          That account isn’t a moderator. Sign in with an authorized account.
        </p>
      ) : null}
      <label htmlFor="email" className="block text-sm font-medium">
        Email
      </label>
      <input
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        required
        className="w-full rounded-md border border-border-strong bg-surface px-3 py-2"
      />
      {state.error ? (
        <p role="alert" className="text-sm text-danger-fg">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-brand px-4 py-2 text-brand-contrast disabled:opacity-50"
      >
        {pending ? 'Sending…' : 'Send sign-in link'}
      </button>
    </form>
  );
}
