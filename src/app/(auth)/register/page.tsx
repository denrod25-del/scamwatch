import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Create an account' };

export default function RegisterPage(): React.JSX.Element {
  return (
    <div className="mx-auto max-w-sm px-4 py-12">
      <h1 className="text-2xl font-semibold">Create an account</h1>
      <p className="mt-2 text-text-muted">
        You can browse and report anonymously — an account just lets you track contributions.
      </p>
      <form className="mt-6 space-y-3" aria-label="Create account">
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
          Create account
        </button>
      </form>
      <p className="mt-4 text-sm text-text-subtle">
        Already have one?{' '}
        <Link href="/login" className="text-brand underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
