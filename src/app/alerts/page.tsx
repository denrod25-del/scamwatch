import type { Metadata } from 'next';
import React from 'react';
import AlertsFeed from './AlertsFeed';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Local Scam Alerts — ScamWatch',
  description: 'Trending scam campaigns, active warnings, and official verification steps.',
};

export default function AlertsPage(): React.JSX.Element {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-8">
      {/* 1. Header */}
      <div>
        <span className="badge-pill bg-brand/10 text-brand text-[10px] uppercase font-bold tracking-wider">
          Active Warning Feed
        </span>
        <h1 className="mt-2 font-display text-4xl font-bold uppercase tracking-tight text-text">
          Local Scam Alerts
        </h1>
        <p className="mt-2 text-sm text-text-muted leading-relaxed">
          ScamWatch alerts combine public warnings, community reports, and human-reviewed scam indicators. Alerts are informational and should be verified directly with the official agency or company.
        </p>
      </div>

      <hr className="border-border" />

      {/* 2. Interactive Alerts Feed */}
      <AlertsFeed />

      <hr className="border-border" />

      {/* 3. Verification & Action Guidelines */}
      <section className="grid gap-6 md:grid-cols-2">
        <div className="panel p-5 space-y-3">
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-text">
            How We Verify Alerts
          </h3>
          <p className="text-xs text-text-muted leading-relaxed">
            Alerts are published after being cross-referenced with official law enforcement bulletins (such as the FTC or Florida Attorney General alerts) or verified through multiple matching community reports confirming matching phone numbers and message templates.
          </p>
        </div>

        <div className="panel p-5 space-y-3">
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-text">
            What to Do When You See an Alert
          </h3>
          <ul className="list-disc pl-4 text-xs text-text-muted space-y-1.5 leading-relaxed">
            <li><strong>Do not click</strong> any links inside text messages.</li>
            <li><strong>Do not call back</strong> numbers left on voicemail messages.</li>
            <li><strong>Verify independently</strong> by logging in to the official service website directly or calling the number on your bill.</li>
          </ul>
        </div>
      </section>

      {/* 4. Action Calls (CTAs) */}
      <section className="grid gap-4 sm:grid-cols-2">
        <div className="panel p-6 flex flex-col justify-between space-y-3">
          <div>
            <h3 className="font-display text-base font-semibold text-text">Check a Suspicious Message</h3>
            <p className="text-xs text-text-muted leading-relaxed mt-1">
              Have a link, phone number, email, or message you want to check? Run a quick calibration scan to check for matches.
            </p>
          </div>
          <div>
            <Link href="/search" className="inline-block rounded bg-brand px-4 py-2 text-xs font-bold text-brand-contrast hover:bg-brand/80">
              Check an Indicator
            </Link>
          </div>
        </div>

        <div className="panel p-6 flex flex-col justify-between space-y-3">
          <div>
            <h3 className="font-display text-base font-semibold text-text">Report an Active Scam</h3>
            <p className="text-xs text-text-muted leading-relaxed mt-1">
              Did you encounter or lose money to a scam? Report it anonymously to protect others in Florida.
            </p>
          </div>
          <div>
            <Link href="/report" className="inline-block rounded border border-brand px-4 py-2 text-xs font-bold text-brand hover:bg-brand/10">
              File a Report
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Privacy Reassurance */}
      <div className="p-4 bg-surface border border-border rounded-md text-xs text-text-muted flex items-start gap-3">
        <span className="text-base" role="img" aria-label="shield">🛡️</span>
        <div className="space-y-1">
          <p className="font-semibold text-text">Your Privacy is Protected</p>
          <p className="leading-relaxed text-text-subtle">
            ScamWatch is a public-benefit service. We strip location coordinates from uploaded screenshots, automatically redact names and credit card details, and never sell your data.
          </p>
        </div>
      </div>

      {/* 6. Official Reporting Resources */}
      <section className="panel p-5 space-y-4">
        <h3 className="font-display text-base font-bold uppercase tracking-wider text-text">
          Official Federal &amp; State Agencies
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 text-xs">
          <div className="space-y-1">
            <p className="font-semibold text-text">Federal Trade Commission (FTC)</p>
            <a href="https://reportfraud.ftc.gov" target="_blank" rel="noopener noreferrer" className="text-brand underline">
              reportfraud.ftc.gov
            </a>
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-text">FBI Internet Crime Complaint Center (IC3)</p>
            <a href="https://www.ic3.gov" target="_blank" rel="noopener noreferrer" className="text-brand underline">
              ic3.gov
            </a>
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-text">Florida Attorney General</p>
            <a href="https://myfloridalegal.com" target="_blank" rel="noopener noreferrer" className="text-brand underline">
              myfloridalegal.com
            </a>
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-text">Mobile Carriers Spam Reporting</p>
            <p className="text-text-muted">Forward suspicious SMS texts directly to <strong>7726</strong>.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
