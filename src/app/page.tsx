import type { Metadata } from 'next';
import Link from 'next/link';

import SearchBar from '@/components/ui/SearchBar';
import ScannerVisual from '@/components/ui/ScannerVisual';

export const metadata: Metadata = {
  title: 'Know Before You Click',
  description:
    'Check a link, phone number, email, or message against community reports and calibrated signals — then verify with official organizations.',
};

const STATS = [
  { k: 'FREE', v: 'Core education, always' },
  { k: 'CALIBRATED', v: 'Confidence, never exaggerated' },
  { k: 'PRIVATE', v: 'We never sell your data' },
  { k: 'OFFICIAL', v: 'Routed to verified orgs' },
] as const;

const THREATS = [
  {
    slug: 'toll-road-smishing',
    title: 'Toll-text smishing',
    desc: 'Fake unpaid-toll texts with look-alike pay links.',
  },
  {
    slug: 'pig-butchering',
    title: 'Pig-butchering',
    desc: 'Long-con fake crypto / trading platforms.',
    featured: true,
  },
  {
    slug: 'grandparent-scam',
    title: 'Grandparent scam',
    desc: 'Urgent “family emergency” money requests.',
  },
  {
    slug: 'tech-support',
    title: 'Tech-support',
    desc: 'Pop-ups and calls claiming your device is infected.',
  },
  { slug: 'romance', title: 'Romance scam', desc: 'Online partners who only ever ask for money.' },
  {
    slug: 'fake-invoice-bec',
    title: 'Invoice / BEC',
    desc: 'Spoofed invoices and changed payment details.',
  },
] as const;

export default function HomePage(): React.JSX.Element {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      {/* HERO */}
      <section className="frame overflow-hidden p-6 sm:p-10">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <div>
            <span className="badge-pill">Real-time consumer scam intelligence</span>
            <h1 className="mt-5 font-display text-3xl font-bold uppercase leading-[1.1] tracking-tight text-text sm:text-4xl">
              Know before you click.
            </h1>
            <p className="mt-4 max-w-md text-text-muted">
              Paste a link, phone number, email, or message. ScamWatch shows what the community has
              reported and a calibrated read on the risk — then points you to official help.
            </p>
            <div className="mt-7 max-w-lg">
              <SearchBar action="/search" />
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-text-subtle">
              <span className="font-mono uppercase tracking-widest text-text-muted">
                Verify with
              </span>
              <span>FTC</span>
              <span aria-hidden="true">·</span>
              <span>FBI&nbsp;IC3</span>
              <span aria-hidden="true">·</span>
              <span>CFPB</span>
              <span aria-hidden="true">·</span>
              <span>State&nbsp;AG</span>
            </div>
          </div>
          <div className="hidden lg:block">
            <ScannerVisual />
          </div>
        </div>
      </section>

      {/* PRINCIPLES BAND (honest — no fabricated metrics) */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.k} className="panel p-5">
            <p className="font-display text-2xl font-bold tracking-tight text-brand">{s.k}</p>
            <p className="mt-1 text-sm text-text-muted">{s.v}</p>
          </div>
        ))}
      </section>

      {/* WHAT WE CHECK — threat taxonomy bento */}
      <section className="frame p-6 sm:p-8">
        <h2 className="text-center font-display text-lg font-bold uppercase tracking-[0.25em] text-text">
          What we check
        </h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {THREATS.map((t) => (
            <Link
              key={t.slug}
              href={`/threat/${t.slug}`}
              className={`panel panel-hover group block p-5 ${
                'featured' in t ? 'border-safe-border' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-sm font-semibold text-text">{t.title}</span>
                <span
                  className="text-text-subtle transition-colors group-hover:text-brand"
                  aria-hidden="true"
                >
                  ↗
                </span>
              </div>
              <p className="mt-1 text-sm text-text-muted">{t.desc}</p>
              <p className="mt-3 font-mono text-[0.7rem] uppercase tracking-wider text-text-subtle">
                {t.slug}
              </p>
            </Link>
          ))}
        </div>
        <p className="mt-5 text-center text-sm text-text-subtle">
          Consumer protection, not legal advice. Always verify with official organizations.
        </p>
      </section>
    </div>
  );
}
