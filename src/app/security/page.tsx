import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Security Policy — ScamWatch',
  description: 'Responsible disclosure guidelines, data handling policies, and safe harbor terms.',
};

export default function SecurityPage(): React.JSX.Element {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 space-y-6">
      <div>
        <Link href="/" className="text-xs font-semibold underline text-brand hover:text-brand/80">
          ← Back to Command Center
        </Link>
      </div>

      <article className="space-y-6">
        <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-text">
          Security Policy
        </h1>
        <p className="text-sm text-text-muted">
          Last Updated: July 1, 2026
        </p>

        <hr className="border-border" />

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-text">1. Responsible Disclosure</h2>
          <p className="text-xs text-text-muted leading-relaxed">
            We take system security seriously. If you discover a vulnerability or security flaw, please report it privately to our security team at{' '}
            <a href="mailto:security@scamwatch.org" className="text-brand underline">
              security@scamwatch.org
            </a>
            . We request that you do not disclose the vulnerability publicly until we have had reasonable time to evaluate and remediate it.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-text">2. Safe Harbor</h2>
          <p className="text-xs text-text-muted leading-relaxed">
            We support safety research. If you perform vulnerability research in good faith compliance with this policy, we will not initiate legal action against you or request law enforcement to investigate.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-text">3. Data Handling &amp; Stripping</h2>
          <p className="text-xs text-text-muted leading-relaxed">
            ScamWatch is built to protect your identity. All uploaded text is checked on the client and server to strip personal identifiers (such as SSNs, credit card numbers, or passwords) before saving. Uploaded screenshot files have their EXIF metadata (including location and device details) stripped in-place during pipeline processing.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-text">4. What You Should &amp; Should Not Submit</h2>
          <div className="rounded-md bg-amber-500/10 border border-amber-500/20 p-4 text-xs text-text-muted space-y-2">
            <p><strong>✅ What to submit:</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Suspicious text message narratives or copy-pasted scam scripts.</li>
              <li>Links (URLs) contained in suspicious messages.</li>
              <li>Phone numbers or emails that initiated the contact.</li>
            </ul>
            <p className="mt-2"><strong>❌ What NOT to submit:</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Your own passwords, credit card numbers, CVVs, or bank PINs.</li>
              <li>Your full Social Security Number (SSN).</li>
              <li>Any other sensitive personal document scans.</li>
            </ul>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-text">5. Reporting Abuse</h2>
          <p className="text-xs text-text-muted leading-relaxed">
            If you find that an entity page displays your private, personal number or email (due to someone incorrectly submitting it), please notify us immediately at{' '}
            <a href="mailto:abuse@scamwatch.org" className="text-brand underline">
              abuse@scamwatch.org
            </a>
            . We will review the submission and redact it within 24 hours.
          </p>
        </section>
      </article>
    </div>
  );
}
