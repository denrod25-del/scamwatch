import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Trust & Transparency — ScamWatch',
  description: 'How ScamWatch works, AI boundaries, human moderation rules, capabilities, and limitations.',
};

export default function TrustCenterPage(): React.JSX.Element {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 space-y-8">
      <div>
        <Link href="/" className="text-xs font-semibold underline text-brand hover:text-brand/80">
          ← Back to Command Center
        </Link>
      </div>

      <article className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-text">
            Trust &amp; Transparency Center
          </h1>
          <p className="text-xs text-text-subtle mt-1">
            Last Updated: July 1, 2026 | Calibration Version: v0.5.0-beta
          </p>
        </div>

        <p className="text-sm text-text-muted leading-relaxed">
          Public trust is our primary metric. We operate under open principles, strict privacy standards, and grounded AI models. We do not claim perfect accuracy; instead, we offer calibrated indicators to help you make informed decisions.
        </p>

        <hr className="border-border" />

        {/* 1. Verified Campaign publishing */}
        <section className="space-y-2">
          <h2 className="text-base font-semibold text-text">1. What &ldquo;Verified&rdquo; Means</h2>
          <p className="text-xs text-text-muted leading-relaxed">
            An alert or campaign is marked as &ldquo;Verified&rdquo; on ScamWatch only when it has been confirmed by official law enforcement bulletins (such as the FTC, FBI, or state Attorney General alerts) or when multiple independent community reports confirm matching target addresses and message templates.
          </p>
        </section>

        {/* 2. Confidence Scoring */}
        <section className="space-y-2">
          <h2 className="text-base font-semibold text-text">2. How Confidence Scoring Works</h2>
          <p className="text-xs text-text-muted leading-relaxed">
            Rather than overclaiming, ScamWatch calculates confidence based on:
          </p>
          <ul className="list-disc pl-5 text-xs text-text-muted space-y-1">
            <li><strong>AI Match Confidence:</strong> Similarity comparison against cataloged scam patterns.</li>
            <li><strong>Evidence Density:</strong> The number of community submissions received for the same indicator.</li>
            <li><strong>Official Citations:</strong> Active matches against official databases of fraudulent domains/numbers.</li>
          </ul>
          <p className="text-xs text-text-muted leading-relaxed mt-2">
            No confidence rating is ever a guarantee of safety. A &ldquo;Low Risk&rdquo; verdict simply means we do not currently possess evidence linking the query to active campaigns.
          </p>
        </section>

        {/* 3. Human Review Requirements */}
        <section className="space-y-2">
          <h2 className="text-base font-semibold text-text">3. Human Review Requirements</h2>
          <p className="text-xs text-text-muted leading-relaxed">
            To prevent abuse, public threat campaigns cannot be created automatically by AI. Before a campaign is published to the public Florida Alerts Feed, a human moderator must review the reports, confirm redaction of all personal information, and verify the fraud signatures.
          </p>
        </section>

        {/* 4. What ScamWatch Can & Cannot Do */}
        <section className="space-y-2">
          <h2 className="text-base font-semibold text-text">4. Capabilities &amp; Limitations</h2>
          <div className="grid gap-4 sm:grid-cols-2 text-xs">
            <div className="panel p-4 space-y-2 border-l-2 border-l-safe-border">
              <h3 className="font-semibold text-text">What ScamWatch Can Do</h3>
              <ul className="list-disc pl-4 space-y-1 text-text-muted">
                <li>Deselect EXIF tags from uploaded images in-place.</li>
                <li>Extract links/numbers to check against abuse databases.</li>
                <li>De-identify text narratives to remove PII.</li>
                <li>Guide users directly to official reporting routes.</li>
              </ul>
            </div>
            <div className="panel p-4 space-y-2 border-l-2 border-l-brand">
              <h3 className="font-semibold text-text">What ScamWatch Cannot Do</h3>
              <ul className="list-disc pl-4 space-y-1 text-text-muted">
                <li>Guarantee that a website is 100% safe to interact with.</li>
                <li>Provide legal, financial, or cybersecurity consulting.</li>
                <li>Intercept or block incoming phone calls or text messages.</li>
                <li>Act on behalf of law enforcement or carrier registries.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 5. Pipeline Calibration */}
        <section className="space-y-2">
          <h2 className="text-base font-semibold text-text">5. Pipeline Metrics Disclaimer</h2>
          <p className="text-xs text-text-muted leading-relaxed">
            We reject the industry practice of claiming exact &ldquo;99% AI accuracy&rdquo; metrics. Machine learning models are subject to drift, spoofing, and false positives. We evaluate model performance against a curated validation set, but these test statistics are not a substitute for user vigilance.
          </p>
        </section>
      </article>
    </div>
  );
}
