import type { Metadata } from 'next';

import LoginForm from './LoginForm';

export const metadata: Metadata = { title: 'Sign in' };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}): Promise<React.JSX.Element> {
  const { error } = await searchParams;

  return (
    <div className="mx-auto max-w-sm px-4 py-12">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <p className="mt-2 text-text-muted">
        We’ll email you a one-time link — no password. Moderators sign in here to review reports.
      </p>
      <div className="mt-6">
        <LoginForm forbidden={error === 'forbidden'} />
      </div>
    </div>
  );
}
