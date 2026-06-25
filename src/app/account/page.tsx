import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Your account' };

export default function AccountPage(): React.JSX.Element {
  return (
    <div className="mx-auto max-w-prose px-4 py-10">
      <h1 className="text-2xl font-semibold">Your account</h1>
      <p className="mt-3 text-text-muted">
        Auth-gated (Supabase Auth). Profile, saved checks, contributor reputation, and notification
        preferences live here (Vol 5 FR-5.9). A server-side session check redirects anonymous
        visitors to sign in.
      </p>
    </div>
  );
}
