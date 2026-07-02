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
            When users upload screenshots, ScamWatch strips hidden EXIF metadata before storage or review when technically possible.
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

        <div>
          <h2 className="text-sm font-semibold text-text mb-1">8. Security Standards &amp; Auditing</h2>
          <p>
            We implement industry-standard cryptographic practices. All communication with ScamWatch is encrypted via Transport Layer Security (TLS 1.3). Database storage utilizes Row-Level Security (RLS) to enforce data boundaries, and we conduct bi-annual internal security reviews of our ingestion pipelines.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-text mb-1">9. Cookies &amp; Analytical Telemetry</h2>
          <p>
            ScamWatch does not use tracking cookies or sell your activity data. We collect anonymous, aggregate telemetry regarding route usage to optimize page loads and server resources.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-text mb-1">10. Legal Disclosures &amp; Compliance</h2>
          <p>
            We cooperate with legal processes when required by law. However, because we strip all personal identification and EXIF data upon ingestion, the data we retain is typically de-identified and aggregate threat data.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-text mb-1">11. Florida Sunshine Law &amp; Public Record Exemptions</h2>
          <p>
            As a Florida-centric platform, we advocate for consumer safety. We treat user submissions with high confidentiality. We redact sensitive identifiers from reports shared with state agencies to prevent submissions from being subject to unrestricted public records requests that could expose victims.
          </p>
        </div>
      </section>
    </div>
  );
}
