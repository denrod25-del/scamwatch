import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Changelog & Beta Release Notes — ScamWatch',
  description: 'Track updates, release notes, bug fixes, and known limitations for the ScamWatch public beta.',
};

export default function ChangelogPage(): React.JSX.Element {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 space-y-8">
      <div>
        <Link href="/" className="text-xs font-semibold underline text-brand hover:text-brand/80">
          ← Back to Command Center
        </Link>
      </div>

      <article className="space-y-6">
        <header className="space-y-2">
          <span className="badge-pill bg-brand/10 text-brand text-[10px] uppercase font-bold tracking-wider">
            Platform Releases
          </span>
          <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-text">
            Changelog &amp; Beta Notes
          </h1>
          <p className="text-xs text-text-subtle">
            Current Version: v1.0.0-beta | Last Updated: July 2, 2026
          </p>
        </header>

        <hr className="border-border" />

        {/* 1. Recent Improvements */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-text">Recent Improvements (July 2026)</h2>
          <ul className="list-disc pl-5 text-xs text-text-muted space-y-2 leading-relaxed">
            <li>
              <strong>Standardized Risk Data:</strong> Duke Energy Disconnection alerts have been unified as <strong>High Risk</strong> globally. Mappings are drawn dynamically from a single threats data module to ensure consistency across search, homepage, alerts, and detailed guide templates.
            </li>
            <li>
              <strong>Typo Corrections:</strong> Corrected package delivery academy labels to <code>UPS/FedEx/USPS</code> and scrubbed residual carrier typos from references.
            </li>
            <li>
              <strong>EXIF Privacy Disclosures:</strong> Standardized screenshot privacy disclosures. Clear, plain language stating that ScamWatch strips hidden EXIF metadata before storage or review has been integrated into the Privacy Policy, Security Center, Transparency reports, and Report Wizard.
            </li>
            <li>
              <strong>Search Result Origin Badges:</strong> Added clear separation indicators distinguishing simulated demo runs (<em>&ldquo;Demo example — not based on your submission&rdquo;</em>) from actual user search inputs (<em>&ldquo;Based on the message or link you entered&rdquo;</em>).
            </li>
            <li>
              <strong>Emergency Home CTAs:</strong> Created the home panel <em>&ldquo;Already clicked or paid? Start here.&rdquo;</em> with rapid-response cards routing targeted users to immediate protection steps.
            </li>
            <li>
              <strong>Academy Lesson Redesigns:</strong> Updated all seven educational guides using a standardized layout containing senior-friendly summaries, Do/Don&apos;t boxes, FAQs, verified official links, and family-sharing text blocks.
            </li>
            <li>
              <strong>New Information Pages:</strong> Launched new `/methodology` and `/changelog` routes to provide public transparency.
            </li>
          </ul>
        </section>

        {/* 2. Known Limitations */}
        <section className="space-y-2 text-xs text-text-muted leading-relaxed">
          <h2 className="text-base font-semibold text-text">Known Limitations</h2>
          <p>
            During the public beta test, the Sentinel Engine runs on simulated and verified seed databases. Real-time network intercept or direct active carrier cell tracing is not performed. All confidence levels should be treated as safety signals rather than legal proof.
          </p>
        </section>

        {/* 3. Reporting Issues or False Positives */}
        <section className="space-y-2 text-xs text-text-muted leading-relaxed">
          <h2 className="text-base font-semibold text-text">Reporting Bugs &amp; False Positives</h2>
          <p>
            If you encounter errors in threat risk levels, find a website incorrectly flagged (false positive), or wish to report an application bug, please contact us at:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Disputes &amp; Redactions: <a href="mailto:abuse@scamwatch.org" className="text-brand underline">abuse@scamwatch.org</a></li>
            <li>Security Vulnerabilities: <a href="mailto:security@scamwatch.org" className="text-brand underline">security@scamwatch.org</a></li>
          </ul>
        </section>

        <hr className="border-border" />

        {/* 4. Trust Center Links */}
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-text uppercase tracking-wider">Quick Navigation</h2>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold underline text-brand">
            <Link href="/methodology" className="hover:text-brand/80">Methodology</Link>
            <Link href="/transparency" className="hover:text-brand/80">Transparency Center</Link>
            <Link href="/security" className="hover:text-brand/80">Security Policy</Link>
            <Link href="/privacy" className="hover:text-brand/80">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-brand/80">Terms of Use</Link>
          </div>
        </section>

        {/* Non-Affiliation Disclaimer */}
        <p className="text-[10px] text-text-subtle leading-relaxed border-t border-border/20 pt-4">
          Disclaimer: ScamWatch is not affiliated with SunPass, Duke Energy, FTC, FBI, IC3, the Florida Attorney General, UPS, FedEx, USPS, or any government agency or utility company mentioned above. Always verify through official websites or phone numbers from your bill, card, statement, or agency website.
        </p>
      </article>
    </div>
  );
}
