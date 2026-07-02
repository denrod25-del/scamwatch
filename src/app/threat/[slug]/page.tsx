import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { THREATS, getRiskBadgeColor, getRiskLabel, getRiskDescription, Threat } from '@/data/threats';
import DataModeBadge from '@/components/ui/DataModeBadge';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const threat = THREATS.find(t => t.slug.toUpperCase() === slug.toUpperCase());

  if (!threat) {
    return { title: 'Campaign Not Found — ScamWatch' };
  }

  return {
    title: `${threat.title} Alert | ScamWatch Florida`,
    description: `Learn how to recognize fake ${threat.title} campaigns, what red flags to look for, and how to verify safely before clicking.`,
  };
}

export default async function ThreatPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<React.JSX.Element> {
  const { slug } = await params;
  const threat = THREATS.find(t => t.slug.toUpperCase() === slug.toUpperCase());

  if (!threat) {
    notFound();
  }

  // Dynamic Schema Markup (Article + FAQPage)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'NewsArticle',
        '@id': `https://scamwatch-seven.vercel.app/threat/${threat.slug}#article`,
        'headline': threat.title,
        'datePublished': threat.firstSeenAt ? `${threat.firstSeenAt}T00:00:00Z` : '2026-07-01T00:00:00Z',
        'dateModified': `${threat.lastVerifiedAt}T00:00:00Z`,
        'author': {
          '@type': 'Organization',
          'name': 'ScamWatch Intelligence',
        },
        'publisher': {
          '@type': 'Organization',
          'name': 'ScamWatch',
        },
        'description': threat.summary,
      },
      {
        '@type': 'FAQPage',
        '@id': `https://scamwatch-seven.vercel.app/threat/${threat.slug}#faq`,
        'mainEntity': [
          {
            '@type': 'Question',
            'name': `How to identify fake ${threat.category} requests?`,
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': threat.redFlags.join(' '),
            },
          },
        ],
      },
    ],
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-8">
      {/* JSON-LD Injections */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="text-xs text-text-subtle">
        <ol className="flex gap-2">
          <li>
            <Link href="/" className="hover:underline">Home</Link>
          </li>
          <span>/</span>
          <li>
            <Link href="/alerts" className="hover:underline">Alerts</Link>
          </li>
          <span>/</span>
          <li aria-current="page">
            <span className="text-text-muted">{threat.id}</span>
          </li>
        </ol>
      </nav>

      <article className="space-y-6">
        <header className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className={`badge-pill text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border ${getRiskBadgeColor(threat.riskLevel)}`}>
              {getRiskLabel(threat.riskLevel)}
            </span>
            <span className="text-xs text-text-subtle">Last Verified: {threat.lastVerifiedAt}</span>
            <DataModeBadge mode={threat.dataMode} />
          </div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-text">
            {threat.title}
          </h1>
          <p className="text-sm text-text-muted leading-relaxed">
            {threat.summary}
          </p>
        </header>

        <hr className="border-border" />

        {/* How It Works */}
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-text">How the Scam Works</h2>
          <p className="text-xs text-text-muted leading-relaxed">
            This campaign targets citizens in {threat.affectedArea} through {threat.channels.join(' and ')} channels. Scammers impersonate trusted agencies or utilities, utilizing urgency, penalty threats, or service termination cutoffs to coerce victims into sharing credentials or making immediate payments.
          </p>
        </section>

        {/* Common Examples (Not clickable / Safely formatted) */}
        <section className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-subtle">Common Message Examples</h3>
          <div className="space-y-2">
            {threat.exampleMessages.map((msg, idx) => (
              <div key={idx} className="bg-background border border-border p-4 rounded-md font-mono text-xs text-text-muted">
                &ldquo;{msg}&rdquo;
              </div>
            ))}
          </div>
          <p className="text-[10px] text-text-subtle italic">Example only — do not visit or contact.</p>
        </section>

        {/* Red Flags */}
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-text">Red Flags to Watch For</h2>
          <ul className="list-disc pl-5 text-xs text-text-muted space-y-2">
            {threat.redFlags.map((flag, idx) => {
              const parts = flag.split(':');
              return (
                <li key={idx}>
                  <strong>{parts[0]}</strong>: {parts.slice(1).join(':')}
                </li>
              );
            })}
          </ul>
        </section>

        {/* Actions Checklist */}
        <section className="grid gap-4 sm:grid-cols-2">
          <div className="panel p-5 space-y-3">
            <h3 className="text-sm font-semibold text-text">Before you click</h3>
            <ul className="list-disc pl-4 text-xs text-text-muted space-y-1.5 leading-relaxed">
              {threat.beforeYouClick.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ul>
          </div>
          <div className="panel p-5 space-y-3">
            <h3 className="text-sm font-semibold text-text">If you clicked or paid</h3>
            <ul className="list-disc pl-4 text-xs text-text-muted space-y-1.5 leading-relaxed">
              {threat.ifYouClicked.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* Why this score? */}
        <section className="panel p-5 space-y-3">
          <h2 className="text-sm font-bold text-text uppercase tracking-wider">Why this score?</h2>
          <div className="space-y-3 text-xs text-text-muted leading-relaxed">
            <p>
              This campaign is rated <strong>{getRiskLabel(threat.riskLevel)}</strong> because:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>{getRiskDescription(threat.riskLevel)}</li>
              <li>Matches verified text templates and active impersonation vectors.</li>
              <li>Contains {threat.communityReports} community report indicators cataloged in Florida.</li>
              <li>Contains {threat.officialSourceCount} official state/federal consumer notices.</li>
            </ul>
            <p className="border-t border-border/20 pt-2 text-[10px] text-text-subtle leading-relaxed italic">
              This score is a safety signal, not a guarantee. Always verify directly with the official company or agency before paying, clicking, or sharing personal information.
            </p>
          </div>
        </section>

        {/* Verified Sources */}
        <section className="panel p-5 space-y-4">
          <h2 className="text-sm font-bold text-text uppercase tracking-wider">Verified Warning Sources</h2>
          <div className="space-y-3">
            {threat.verifiedSources.map((source, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border/30 pb-3 last:border-0 last:pb-0 gap-2">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-text">{source.title}</p>
                  <p className="text-[10px] text-text-subtle font-mono">{source.organization} {source.date ? `· ${source.date}` : ''}</p>
                </div>
                <div>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] font-semibold text-brand underline"
                  >
                    View Official Warning ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Official Verification Contacts */}
        <section className="rounded-lg border border-border bg-surface p-5 space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-text">Official Verification &amp; Reporting</h2>
          <div className="flex flex-wrap gap-3">
            {threat.officialReportLinks.map((link, idx) => (
              <a
                key={idx}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold rounded border border-border bg-background hover:bg-hover text-text"
              >
                {link.title} ({link.organization}) ↗
              </a>
            ))}
          </div>
        </section>

        {/* Report This Campaign CTA */}
        <section className="panel p-6 bg-surface border border-border/60 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1.5">
            <h3 className="font-display text-base font-semibold text-text">Seen this scam?</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Help warn others in Florida by reporting what you received. Every submission aids community calibration.
            </p>
          </div>
          <div>
            <Link
              href={`/report?threat=${threat.id}`}
              className="inline-block rounded bg-brand px-4 py-2 text-xs font-bold text-brand-contrast hover:bg-brand/80 whitespace-nowrap"
            >
              Report this scam
            </Link>
          </div>
        </section>
      </article>
    </div>
  );
}
