import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Use — ScamWatch',
  description: 'Understand the terms, liability limitations, and acceptable use guidelines for ScamWatch.',
};

export default function TermsPage(): React.JSX.Element {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 space-y-6">
      <div>
        <Link href="/" className="text-xs font-semibold underline text-brand hover:text-brand/80">
          ← Back to Command Center
        </Link>
      </div>

      <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-text">
        Terms of Use
      </h1>
      <p className="text-xs text-text-subtle">
        Effective Date: July 1, 2026 | Version: v0.5.0-beta
      </p>

      <hr className="border-border" />

      <section className="space-y-4 text-xs text-text-muted leading-relaxed">
        <div>
          <h2 className="text-sm font-semibold text-text mb-1">1. Public-Benefit Consumer Platform</h2>
          <p>
            ScamWatch is a free, public-benefit resource operated to help consumers identify potential phishing, smishing, and other fraudulent campaigns. Our threat classifications, confidence ratings, and analyses are for informational purposes only and <strong>do not constitute legal, financial, or cyber-forensic advice</strong>.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-text mb-1">2. Verification Requirement</h2>
          <p>
            Users are solely responsible for verifying any alerts or warnings with official government agencies or utility providers (e.g. Duke Energy, SunPass, or the Florida Attorney General) before taking action or making payments.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-text mb-1">3. Acceptable Use Policy</h2>
          <p>
            You agree to use ScamWatch only for legitimate, personal scam checks or reporting. You must not:
          </p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>Submit spam or malicious payloads designed to degrade our service.</li>
            <li>Intentionally submit false reports to manipulate reputation scores.</li>
            <li>Incorporate private contact details of individuals without their express consent.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-text mb-1">4. Law Enforcement &amp; Agency Data Sharing</h2>
          <p>
            ScamWatch shares de-identified threat indicators (domains, phone numbers, and redacted SMS templates) with state and federal consumer protection agencies. We cooperate with law enforcement requests in accordance with Florida and Federal statutes.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-text mb-1">5. Limitation of Liability</h2>
          <p>
            ScamWatch is provided &ldquo;as is&rdquo; without warranties of any kind. Under no circumstances shall ScamWatch be liable for any financial losses, identity theft incidents, or system breaches resulting from your reliance on our tools, checklists, or classifications.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-text mb-1">6. Minor &amp; Vulnerable User Protection</h2>
          <p>
            Users must be at least 13 years of age. Parents or legal guardians are encouraged to assist minors and vulnerable family members in using our reporting tools to ensure sensitive credit credentials are not exposed.
          </p>
        </div>
      </section>
    </div>
  );
}
