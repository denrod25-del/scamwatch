import type { Metadata } from 'next';

import SearchBar from '@/components/ui/SearchBar';

export const metadata: Metadata = {
  title: 'Know Before You Click',
  description:
    'Check a link, phone number, email, or message against community reports and calibrated signals — then verify with official organizations.',
};

export default function HomePage(): React.JSX.Element {
  return (
    <div className="mx-auto max-w-prose px-4 py-12">
      <section className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Know before you click.</h1>
        <p className="mt-3 text-text-muted">
          Paste a link, phone number, email address, or message. ScamWatch shows what the community
          has reported and a calibrated read on the risk.
        </p>

        <div className="mt-6">
          <SearchBar action="/search" />
        </div>

        <p className="mt-3 text-sm text-text-subtle">
          Verify with official organizations. This is consumer protection, not legal advice.
        </p>
      </section>

      <section className="mt-12 grid gap-4 sm:grid-cols-3">
        <article className="rounded-lg border border-border bg-surface p-4">
          <h2 className="text-sm font-semibold text-brand">Search a signal</h2>
          <p className="mt-1 text-sm text-text-muted">
            Look up a URL, number, or handle to see reports and a calibrated verdict.
          </p>
        </article>
        <article className="rounded-lg border border-border bg-surface p-4">
          <h2 className="text-sm font-semibold text-brand">Report a scam</h2>
          <p className="mt-1 text-sm text-text-muted">
            Share what happened. Our wizard is trauma-aware and de-identifies screenshots.
          </p>
        </article>
        <article className="rounded-lg border border-border bg-surface p-4">
          <h2 className="text-sm font-semibold text-brand">Learn the patterns</h2>
          <p className="mt-1 text-sm text-text-muted">
            The Academy explains how common scams work so they are easier to spot.
          </p>
        </article>
      </section>
    </div>
  );
}
