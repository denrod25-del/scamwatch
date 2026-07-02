import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import DataModeBadge from '@/components/ui/DataModeBadge';

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
            Last Updated: July 2, 2026 | Dataset Version: v1.0.0-beta
          </p>
        </div>

        <p className="text-sm text-text-muted leading-relaxed">
          Public trust is our primary metric. We operate under open principles, strict privacy standards, and grounded models. We do not claim perfect accuracy; instead, we offer calibrated indicators to help you make informed decisions.
        </p>

        {/* Core Disclaimer Box */}
        <div className="p-4 bg-surface border border-border rounded-md text-xs text-text-muted leading-relaxed">
          <strong>Accuracy Notice:</strong> ScamWatch does not guarantee that every scam is detected or that every warning is correct. Scam tactics change quickly, and confidence scores should be treated as safety signals, not final proof.
        </div>

        <hr className="border-border" />

        {/* 1. Verified vs Demo Data */}
        <section className="space-y-2">
          <h2 className="text-base font-semibold text-text">1. Data Modes &amp; &ldquo;Verified&rdquo; Thresholds</h2>
          <p className="text-xs text-text-muted leading-relaxed">
            To prevent spreading misinformation, ScamWatch explicitly labels all data sources so consumers are never misled:
          </p>
          <ul className="list-disc pl-5 text-xs text-text-muted space-y-2 leading-relaxed">
            <li>
              <strong>Verified Data:</strong> An alert or campaign is marked as &ldquo;Verified&rdquo; only when it has been confirmed by official law enforcement bulletins (such as the FTC, FBI, or state Attorney General alerts) or when multiple independent community reports confirm matching target infrastructure and templates.
            </li>
            <li>
              <strong>Demo Data:</strong> Seeded campaign records used to demonstrate platform capability during beta evaluation. These are simulated examples for educational testing.
            </li>
            <li>
              <strong>Live Data:</strong> Real-time alerts generated directly by incoming signals (such as live website check requests).
            </li>
          </ul>
        </section>

        {/* 2. Confidence Scoring */}
        <section className="space-y-2">
          <h2 className="text-base font-semibold text-text">2. How Confidence Scores Are Calculated</h2>
          <p className="text-xs text-text-muted leading-relaxed">
            We evaluate confidence based on factual markers rather than exaggerated claims. Our formula aggregates:
          </p>
          <ul className="list-disc pl-5 text-xs text-text-muted space-y-1.5 leading-relaxed">
            <li><strong>Infrastructure Matches:</strong> Presence of domains or phone numbers listed on verified warning registries.</li>
            <li><strong>Text Pattern Matching:</strong> Similarity to known smishing/phishing templates (such as SunPass toll demands or utility cutoffs).</li>
            <li><strong>Report Density:</strong> The volume of independent, matching community reports logged within a short time frame.</li>
          </ul>
        </section>

        {/* 3. Limitations & Model Drift Disclaimer */}
        <section className="space-y-2">
          <h2 className="text-base font-semibold text-text">3. False Positive, False Negative &amp; Model Drift Warning</h2>
          <p className="text-xs text-text-muted leading-relaxed">
            Machine learning models are subject to drift, evasion, and false detections. A &ldquo;Low Risk&rdquo; search result does not guarantee safety—it simply means our database does not currently possess evidence linking that indicator to known scams. Conversely, harmless links or newly registered domains might occasionally trigger caution warnings (false positives). Always exercise independent caution.
          </p>
        </section>

        {/* 4. Human Review & Moderation Policy */}
        <section className="space-y-2">
          <h2 className="text-base font-semibold text-text">4. Human Review Policy</h2>
          <p className="text-xs text-text-muted leading-relaxed">
            To prevent platform abuse and targeted harassment, public campaigns cannot be created automatically. Before a campaign is published to the public Florida Alerts Feed, a human moderator must review the reports, confirm redaction of all private identifiers (PII), and verify the fraud signatures.
          </p>
        </section>

        {/* 5. Data Removal & Appeal Procedure */}
        <section className="space-y-2">
          <h2 className="text-base font-semibold text-text">5. Data Removal &amp; Dispute Policy</h2>
          <p className="text-xs text-text-muted leading-relaxed">
            If you represent a legitimate company whose domain, phone number, or brand name has been flagged in error, please contact us at <a href="mailto:abuse@scamwatch.org" className="text-brand underline">abuse@scamwatch.org</a>. We review all verification disputes within 24 hours and immediately white-list verified legitimate entities.
          </p>
        </section>

        {/* 6. What ScamWatch Can & Cannot Do */}
        <section className="space-y-2">
          <h2 className="text-base font-semibold text-text">6. Capabilities &amp; Limitations</h2>
          <div className="grid gap-4 sm:grid-cols-2 text-xs">
            <div className="panel p-4 space-y-2 border-l-2 border-l-safe-border">
              <h3 className="font-semibold text-text">What ScamWatch Can Do</h3>
              <ul className="list-disc pl-4 space-y-1 text-text-muted">
                <li>Strip EXIF metadata (hidden photo details, like location/device information) from uploaded screenshots.</li>
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

        <hr className="border-border" />

        {/* 7. Changelog */}
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-text">7. Changelog</h2>
          <div className="space-y-3 text-xs text-text-muted">
            <div className="border-l-2 border-l-border pl-3 space-y-1">
              <p className="font-bold text-text">July 2026</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Added official warning source citations to threat campaigns.</li>
                <li>Added global data mode badges (Demo, Verified, Live).</li>
                <li>Improved risk scoring explanations with detailed signals.</li>
                <li>Updated report privacy consent language and de-identification notices.</li>
              </ul>
            </div>
            <div className="border-l-2 border-l-border pl-3 space-y-1">
              <p className="font-bold text-text">June 2026</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Initial public beta launch of ScamWatch platform.</li>
                <li>Released trauma-aware reporting wizard steps.</li>
                <li>Configured Supabase database row-level security (RLS) policies.</li>
              </ul>
            </div>
          </div>
        </section>
      </article>
    </div>
  );
}
