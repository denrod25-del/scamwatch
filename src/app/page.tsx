import type { Metadata } from 'next';
import Link from 'next/link';
import SearchBar from '@/components/ui/SearchBar';
import ScannerVisual from '@/components/ui/ScannerVisual';
import { THREATS, getRiskBadgeColor, getRiskLabel } from '@/data/threats';
import DataModeBadge from '@/components/ui/DataModeBadge';

export const metadata: Metadata = {
  title: 'ScamWatch — Know Before You Click',
  description:
    'Analyze suspicious text messages, emails, URLs, and phone numbers. Clean explanations, community data, and official verification resources.',
};

const STATS = [
  { k: '1,248', v: 'Verified scams analyzed' },
  { k: 'Calibrated', v: 'Grounded metrics, no exaggerated claims' },
  { k: '48', v: 'Active Florida campaigns tracked' },
  { k: '100% Free', v: 'Core public-benefit education' },
] as const;

const CATEGORIES = [
  { slug: 'url', title: 'URL Check', desc: 'Verify redirect domains and look-alike phish links.' },
  { slug: 'phone', title: 'Phone Verification', desc: 'Identify known spoof caller accounts and smish senders.' },
  { slug: 'email', title: 'Email Inspection', desc: 'Check sender domain reputations and BEC spoofing flags.' },
] as const;

const BORDER_COLORS = {
  critical: 'border-l-red-700',
  high: 'border-l-red-500',
  medium: 'border-l-amber-500',
  low: 'border-l-emerald-500',
};

export default function HomePage(): React.JSX.Element {
  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      {/* 1. HERO SECTION */}
      <section className="frame relative overflow-hidden p-6 sm:p-10">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <div>
            <span className="badge-pill">Sentinel Intelligence Engine Active</span>
            <h1 className="mt-5 font-display text-4xl font-bold uppercase leading-[1.1] tracking-tight text-text sm:text-5xl">
              Know before you click.
            </h1>
            <p className="mt-4 text-text-muted">
              Paste a suspicious message, link, phone number, or email. ScamWatch analyzes the threat vectors and provides a transparent, calibrated risk explanation.
            </p>
            <div className="mt-7 max-w-lg">
              <SearchBar action="/search" />
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-text-subtle">
              <span className="font-mono uppercase tracking-widest text-text-subtle">
                Official Routing
              </span>
              <span>FTC</span>
              <span aria-hidden="true">·</span>
              <span>FBI IC3</span>
              <span aria-hidden="true">·</span>
              <span>Florida Attorney General</span>
            </div>
          </div>
          <div className="hidden lg:block">
            <ScannerVisual />
          </div>
        </div>
      </section>

      {/* 2. LIVE FLORIDA THREAT FEED */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-text">
            Florida Threat Alerts Feed
          </h2>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-safe opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-safe"></span>
          </span>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {THREATS.map((threat) => (
            <div
              key={threat.id}
              className={`panel p-5 border-l-4 ${BORDER_COLORS[threat.riskLevel]}`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-display text-base font-semibold text-text">{threat.title}</span>
                <span className={`badge-pill text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 border ${getRiskBadgeColor(threat.riskLevel)}`}>
                  {getRiskLabel(threat.riskLevel)}
                </span>
              </div>
              <p className="mt-2 text-xs text-text-muted leading-relaxed">{threat.summary}</p>
              <div className="mt-4 flex items-center justify-between text-[10px] font-mono text-text-subtle">
                <span>Alert ID: {threat.id}</span>
                <Link href={`/threat/${threat.slug}`} className="underline hover:text-brand">
                  Analyze Campaign ↗
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. SCAM CATEGORIES SHORTCUTS */}
      <section className="grid gap-4 sm:grid-cols-3">
        {CATEGORIES.map((c) => (
          <div key={c.slug} className="panel p-5">
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-text">
              {c.title}
            </h3>
            <p className="mt-2 text-xs text-text-muted">{c.desc}</p>
            <Link
              href={`/search?type=${c.slug}`}
              className="mt-4 inline-block text-xs font-semibold underline text-brand hover:text-brand/80"
            >
              Start {c.title} ↗
            </Link>
          </div>
        ))}
      </section>

      {/* 4. COMMUNITY STATISTICS BAND */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-xs font-bold uppercase tracking-widest text-text-subtle">
            Community Safety Indicators
          </h2>
          <DataModeBadge mode="demo" showDisclaimer={true} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.k} className="panel p-5 text-center">
              <p className="font-display text-3xl font-bold tracking-tight text-brand">{s.k}</p>
              <p className="mt-1 text-xs text-text-muted">{s.v}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. LOCAL ALERTS & CHECKLIST DOWNLOAD (Epic 9) */}
      <section className="grid gap-6 md:grid-cols-2">
        <div className="panel p-6 space-y-4">
          <h3 className="font-display text-lg font-bold uppercase tracking-wider text-text">
            Get Local Scam Alerts
          </h3>
          <p className="text-xs text-text-muted">
            Stay informed about trending smishing campaigns, DMV impersonations, and utilities scams in Florida. Zero spam, de-identified alerts.
          </p>
          <form className="flex gap-2" action="/alerts" method="GET">
            <input
              type="email"
              placeholder="Enter your email"
              required
              aria-label="Email address for alerts"
              className="flex-1 rounded border border-border bg-background px-3 py-2 text-xs text-text focus:border-brand focus:outline-none"
            />
            <button
              type="submit"
              className="rounded bg-brand px-4 py-2 text-xs font-bold text-brand-contrast hover:bg-brand/80"
            >
              Get Local Alerts
            </button>
          </form>
        </div>

        <div className="panel p-6 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-display text-lg font-bold uppercase tracking-wider text-text">
              Scam Response Checklist
            </h3>
            <p className="text-xs text-text-muted mt-1">
              Know exactly what to do if you clicked a suspicious link, shared a password, or disclosed private details. Keep this safety guide handy.
            </p>
          </div>
          <div>
            <a
              href="/academy/what-if-clicked"
              className="inline-block rounded border border-brand px-4 py-2 text-xs font-bold text-brand hover:bg-brand/10 transition-colors"
            >
              View Response Checklist →
            </a>
          </div>
        </div>
      </section>

      {/* 6. WHY TRUST BAND */}
      <section className="frame p-6 sm:p-8 text-center space-y-4">
        <h2 className="font-display text-base font-bold uppercase tracking-[0.2em] text-text">
          Our Public Trust Commitment
        </h2>
        <p className="mx-auto max-w-xl text-sm text-text-muted">
          ScamWatch is a public-benefit platform built to protect consumer privacy. We strip all upload EXIF location data, de-identify messages to scrub names and social security numbers, and never sell user information.
        </p>
        <div className="flex justify-center gap-4 text-xs font-semibold underline text-text-subtle">
          <Link href="/methodology" className="hover:text-brand">How it Works</Link>
          <span>·</span>
          <Link href="/privacy" className="hover:text-brand">Privacy Policy</Link>
          <span>·</span>
          <Link href="/terms" className="hover:text-brand">Terms of Use</Link>
          <span>·</span>
          <Link href="/security" className="hover:text-brand">Security Policy</Link>
        </div>
      </section>
    </div>
  );
}
