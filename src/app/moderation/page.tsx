import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Moderation queue', robots: { index: false } };

export default function ModerationPage(): React.JSX.Element {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Moderation queue</h1>
      <p className="mt-3 text-text-muted">
        Role-gated: <code>moderator</code>, <code>analyst</code>, and <code>admin</code> only,
        enforced server-side and by RLS (Vol 10/14). Queued reports, triage, and the
        ModerationActionBar render here (Vol 16). Every action is written to the append-only audit
        log.
      </p>
    </div>
  );
}
