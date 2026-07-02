import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Your account' };

export default function AccountPage(): React.JSX.Element {
  return (
    <div className="mx-auto max-w-prose px-4 py-10">
      <h1 className="text-2xl font-semibold">Your account</h1>
      <p className="mt-3 text-text-muted">
        Your contributor profile, saved checks, reputation scores, and notification preferences live here. Sign in to view and customize your settings.
      </p>
    </div>
  );
}
