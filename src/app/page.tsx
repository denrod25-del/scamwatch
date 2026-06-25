import type { Metadata } from 'next';

import SearchBar from '@/components/ui/SearchBar';

export const metadata: Metadata = {
  title: 'Know Before You Click',
  description:
    'Check a link, phone number, email, or message against community reports and calibrated signals — then verify with official organizations.',
};

const FEATURES = [
  {
    title: 'Search a signal',
    body: 'Look up a URL, number, or handle to see community reports and a calibrated verdict.',
    icon: <path d="M11 4a7 7 0 105.2 11.7L20 19.5 M11 4a7 7 0 010 14" />,
  },
  {
    title: 'Report a scam',
    body: 'Share what happened. The wizard is trauma-aware and de-identifies your screenshots.',
    icon: <path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4zM12 9v4M12 16h.01" />,
  },
  {
    title: 'Learn the patterns',
    body: 'The Academy explains how common scams work, so they are easier to spot next time.',
    icon: <path d="M3 7l9-4 9 4-9 4-9-4zM21 7v6M7 9.5V14c0 1.5 2.2 3 5 3s5-1.5 5-3V9.5" />,
  },
] as const;

export default function HomePage(): React.JSX.Element {
  return (
    <div className="mx-auto max-w-5xl px-4">
      <section className="py-16 text-center sm:py-24">
        <p className="eyebrow">&#47;&#47; real-time scam intelligence</p>
        <h1 className="text-glow mt-4 font-display text-4xl font-bold tracking-tight text-text sm:text-5xl">
          Know before you click.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-text-muted">
          Paste a link, phone number, email, or message. ScamWatch shows what the community has
          reported and a calibrated read on the risk.
        </p>

        <div className="mx-auto mt-8 max-w-2xl">
          <SearchBar action="/search" />
        </div>

        <p className="mt-3 text-sm text-text-subtle">
          Verify with official organizations. This is consumer protection, not legal advice.
        </p>
      </section>

      <section className="grid gap-4 pb-20 sm:grid-cols-3">
        {FEATURES.map((f) => (
          <article key={f.title} className="panel panel-hover p-5">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-surface-muted text-brand">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.7}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="h-5 w-5"
              >
                {f.icon}
              </svg>
            </span>
            <h2 className="mt-3 font-display text-base font-semibold text-text">{f.title}</h2>
            <p className="mt-1 text-sm text-text-muted">{f.body}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
