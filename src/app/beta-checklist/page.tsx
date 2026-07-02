import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Beta Release Hardening Checklist — ScamWatch',
  robots: { index: false },
};

const CHECKLIST_ITEMS = [
  { category: 'Risk Consistency', status: 'Pass', details: 'All risk levels are mapped dynamically from src/data/threats.ts, ensuring Duke Energy and SunPass match exactly on the homepage, alerts, search results, and threat detail pages.' },
  { category: 'Official Source Citations', status: 'Pass', details: 'Every campaign page showcases official warnings (FTC, Attorney General, FCC) with links, organizations, and dates.' },
  { category: 'Demo/Live Data Labeling', status: 'Pass', details: 'Added DataModeBadge component marking Demo Data, Verified Data, or Live Data with disclaimers across stats, search, alerts, threat pages, and trust center.' },
  { category: 'Report Privacy Consent', status: 'Pass', details: 'Added required checkbox and de-identification agreement to the submit step of ReportWizard.' },
  { category: 'Accessibility', status: 'Pass', details: 'Ensured only the active step in ReportWizard is visible to screen readers (using hidden/aria-hidden) and added unique IDs for step headers.' },
  { category: 'Security Claims Verified', status: 'Pass', details: 'Responsible disclosure contact (mailto:security@scamwatch.org) and security policy are set up. /public/.well-known/security.txt matches RFC 9116.' },
  { category: 'Loading States Cleaned', status: 'Pass', details: 'Verified no raw unfinished loading texts are present on public pages; Next.js streaming boundaries render layout-matching skeletons.' },
  { category: 'Search Mode Specificity', status: 'Pass', details: 'Dynamic headers, placeholders, and helper hints customized for type=url, type=phone, and type=email modes.' },
  { category: 'Threat Detail CTA', status: 'Pass', details: 'Added "Report this scam" buttons linking to /report?threat=FL-00X at the bottom of threat campaign files.' },
  { category: 'SEO Metadata & Schema', status: 'Pass', details: 'Configured generateMetadata dynamically for threats and search modes. Structured FAQPage and NewsArticle schemas are injected.' },
];

export default function BetaChecklistPage(): React.JSX.Element {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-6">
      <div>
        <Link href="/" className="text-xs font-semibold underline text-brand hover:text-brand/80">
          ← Back to Command Center
        </Link>
      </div>

      <header className="space-y-1.5">
        <span className="badge-pill bg-brand/10 text-brand text-[10px] uppercase font-bold tracking-wider">
          Internal Dev Tool
        </span>
        <h1 className="font-display text-2xl font-bold uppercase tracking-tight text-text">
          Beta release hardening checklist
        </h1>
        <p className="text-xs text-text-muted">
          Verification dashboard tracking mandatory requirements for public beta readiness.
        </p>
      </header>

      <hr className="border-border" />

      <div className="space-y-4">
        {CHECKLIST_ITEMS.map((item, idx) => (
          <div key={idx} className="panel p-5 space-y-2 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-text">{item.category}</h3>
              <p className="text-xs text-text-muted leading-relaxed">{item.details}</p>
            </div>
            <div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                {item.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
