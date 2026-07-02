import React, { ReactNode } from 'react';
import Link from 'next/link';

export interface FAQItem {
  q: string;
  a: string;
}

export interface LinkItem {
  label: string;
  url: string;
}

interface AcademyArticleLayoutProps {
  title: string;
  description: string;
  lastUpdated: string;
  seniorSummary: string;
  dos: string[];
  donts: string[];
  faqs: FAQItem[];
  verificationLinks: LinkItem[];
  reportingLinks: LinkItem[];
  shareText: string;
  children: ReactNode; // Main article text
}

export default function AcademyArticleLayout({
  title,
  description,
  lastUpdated,
  seniorSummary,
  dos,
  donts,
  faqs,
  verificationLinks,
  reportingLinks,
  shareText,
  children,
}: AcademyArticleLayoutProps): React.JSX.Element {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 space-y-6">
      <div>
        <Link href="/academy" className="text-xs font-semibold underline text-brand hover:text-brand/80">
          ← Back to Academy
        </Link>
      </div>

      <article className="space-y-6">
        <header className="space-y-2">
          <div className="flex flex-wrap items-center justify-between text-xs text-text-subtle">
            <span>Last Updated: {lastUpdated}</span>
            <span className="badge-pill bg-brand/10 text-brand text-[9px] uppercase font-bold">Beta Feed</span>
          </div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-text">
            {title}
          </h1>
          <p className="text-sm text-text-muted leading-relaxed">
            {description}
          </p>
        </header>

        <hr className="border-border" />

        {/* Senior Friendly Summary Box */}
        <section className="panel p-5 bg-surface-muted/50 border-l-4 border-l-brand space-y-2">
          <h2 className="text-sm font-bold text-text uppercase tracking-wider">👵 Senior-Friendly Summary</h2>
          <p className="text-xs text-text-muted leading-relaxed">
            {seniorSummary}
          </p>
        </section>

        {/* Main content body from children */}
        <div className="space-y-6 text-xs text-text-muted leading-relaxed">
          {children}
        </div>

        {/* Do / Don't Box */}
        <section className="grid gap-4 sm:grid-cols-2">
          <div className="panel p-5 border border-emerald-500/20 bg-emerald-500/5 space-y-2">
            <h3 className="text-sm font-bold text-emerald-500 uppercase tracking-wider">✔️ What to DO</h3>
            <ul className="list-disc pl-4 text-xs text-text-muted space-y-1">
              {dos.map((d, i) => <li key={i}>{d}</li>)}
            </ul>
          </div>
          <div className="panel p-5 border border-red-500/20 bg-red-500/5 space-y-2">
            <h3 className="text-sm font-bold text-red-500 uppercase tracking-wider">❌ What to AVOID</h3>
            <ul className="list-disc pl-4 text-xs text-text-muted space-y-1">
              {donts.map((d, i) => <li key={i}>{d}</li>)}
            </ul>
          </div>
        </section>

        {/* FAQs */}
        {faqs.length > 0 && (
          <section className="space-y-4 pt-4 border-t border-border">
            <h2 className="text-lg font-semibold text-text">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="space-y-1 text-xs">
                  <p className="font-bold text-text">Q: {faq.q}</p>
                  <p className="text-text-muted leading-relaxed">A: {faq.a}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Verification & Reporting Links */}
        <section className="grid gap-4 sm:grid-cols-2 pt-4 border-t border-border">
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-text uppercase tracking-wider">Official Verification</h3>
            <ul className="space-y-1 text-xs">
              {verificationLinks.map((link, i) => (
                <li key={i}>
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-brand underline">
                    {link.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-text uppercase tracking-wider">Official Reporting</h3>
            <ul className="space-y-1 text-xs">
              {reportingLinks.map((link, i) => (
                <li key={i}>
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-brand underline">
                    {link.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Share with a family member */}
        <section className="panel p-5 bg-surface border border-border/80 space-y-3">
          <h3 className="text-sm font-semibold text-text">📞 Share with a family member</h3>
          <p className="text-xs text-text-muted leading-relaxed">
            {shareText}
          </p>
        </section>

        {/* Non-Affiliation Disclaimer */}
        <p className="text-[10px] text-text-subtle leading-relaxed border-t border-border/20 pt-4">
          Disclaimer: ScamWatch is not affiliated with SunPass, Duke Energy, FTC, FBI, IC3, the Florida Attorney General, UPS, FedEx, USPS, or any government agency or utility company mentioned above. Always verify through official websites or phone numbers from your bill, card, statement, or agency website.
        </p>
      </article>
    </div>
  );
}
