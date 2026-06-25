import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Sign in' };

export default function LoginPage(): React.JSX.Element {
  return (
    <div className="mx-auto max-w-sm px-4 py-12">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <p className="mt-2 text-text-muted">
        Sign in to track your reports and reputation. Powered by Supabase Auth (email OTP + OAuth).
      </p>
      {/* Placeholder form — wired to Supabase Auth in implementation. */}
      <form className="mt-6 space-y-3" aria-label="Sign in">
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          className="w-full rounded-md border border-border-strong bg-surface px-3 py-2"
        />
        <button type="submit" className="w-full rounded-md bg-brand px-4 py-2 text-brand-contrast">
          Send sign-in link
        </button>
      </form>
      <p className="mt-4 text-sm text-text-subtle">
        New here?{' '}
        <Link href="/register" className="text-brand underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
