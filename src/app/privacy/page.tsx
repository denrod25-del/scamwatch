import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — ScamWatch',
  description: 'Learn about our data retention, de-identification, screenshot metadata stripping, and user safety policies.',
};

export default function PrivacyPage(): React.JSX.Element {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 space-y-6">
      <div>
        <Link href="/" className="text-xs font-semibold underline text-brand hover:text-brand/80">
          ← Back to Command Center
        </Link>
      </div>

      <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-text">
        Privacy Policy
      </h1>
      <p className="text-xs text-text-subtle">
        Effective Date: July 1, 2026 | Version: v0.5.0-beta
      </p>

      <hr className="border-border" />

      <section className="space-y-4 text-xs text-text-muted leading-relaxed">
        <div>
          <h2 className="text-sm font-semibold text-text mb-1">1. Information We Collect &amp; Process</h2>
          <p>
            ScamWatch is a public-benefit platform. We process the suspicious text narratives, phone numbers, emails, URLs, and screenshots you submit. Additionally, we transiently log network IP addresses solely for rate-limiting and abuse mitigation.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-text mb-1">2. Screenshot &amp; EXIF Metadata Stripping</h2>
          <p>
            When you upload a screenshot, our pipeline automatically strips all Exchangeable Image File (EXIF) tags—including GPS coordinates, device models, and creation timestamps—before storing the image file.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-text mb-1">3. Data Retention Periods</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Raw Connection IP Logs:</strong> Deleted automatically within 30 days.</li>
            <li><strong>Submitted Scam Indicators &amp; Redacted Narratives:</strong> Retained for up to 3 years to track multi-year threat campaigns and assist law enforcement.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-text mb-1">4. AI Training &amp; Model Utilization</h2>
          <p>
            De-identified scam texts may be used to fine-tune our local threat-classification models. We do not submit raw narratives containing personal information to third-party AI training sets or commercial models.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-text mb-1">5. Who Can Access Reports</h2>
          <p>
            Only authorized ScamWatch staff and moderators have access to raw submissions. Publicly published campaign summaries and indicators are completely scrubbed of personal details. De-identified indicator sets are shared with official consumer protection agencies (such as the FTC, FDLE, and Attorney General).
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-text mb-1">6. Deletion Requests &amp; Access Rights</h2>
          <p>
            If you accidentally submitted private information (like your phone number or email) and wish to request deletion, please contact us at{' '}
            <a href="mailto:privacy@scamwatch.org" className="text-brand underline">
              privacy@scamwatch.org
            </a>
            . We will redact or purge the target records within 24 hours.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-text mb-1">7. Minor &amp; Vulnerable User Protection</h2>
          <p>
            ScamWatch is not directed at children under 13. We actively redact submissions that appear to contain details of minors. We work with elder protection groups in Florida to ensure our reporting paths are accessible and protective of seniors who are disproportionately targeted by utility and toll scams.
          </p>
        </div>
      </section>
    </div>
  );
}
