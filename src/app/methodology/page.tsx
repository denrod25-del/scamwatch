import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Check Methodology — ScamWatch',
  description: 'How ScamWatch analyzes indicators, verifies scam campaigns, rates risks, and protects user privacy.',
};

export default function MethodologyPage(): React.JSX.Element {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 space-y-8">
      <div>
        <Link href="/" className="text-xs font-semibold underline text-brand hover:text-brand/80">
          ← Back to Command Center
        </Link>
      </div>

      <article className="space-y-6">
        <header className="space-y-2">
          <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-text">
            Evaluation Methodology
          </h1>
          <p className="text-sm text-text-muted leading-relaxed">
            How ScamWatch evaluates suspicious links, numbers, and messages to protect communities in Florida.
          </p>
        </header>

        {/* Core Disclaimer Box */}
        <div className="p-4 bg-surface border border-border rounded-md text-xs text-text-muted leading-relaxed">
          <strong>Accuracy Notice:</strong> ScamWatch does not guarantee that every scam is detected or that every warning is correct. Scam tactics change quickly, and confidence scores should be treated as safety signals, not final proof. Always verify through official websites or phone numbers from your bill, statement, or agency website.
        </div>

        <hr className="border-border" />

        {/* 1. What "Verified" Means */}
        <section className="space-y-2 text-xs text-text-muted leading-relaxed">
          <h2 className="text-base font-semibold text-text">1. What &ldquo;Verified&rdquo; Means</h2>
          <p>
            An alert or campaign is marked as <strong>Verified</strong> only when it meets strict credibility thresholds:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Official Confirmation:</strong> The scam signature has been documented in official law enforcement alerts, federal advisories (such as the FTC or FCC), or state Attorney General bulletins.</li>
            <li><strong>Infrastructure Matching:</strong> The URLs, phone numbers, or text messages have been confirmed as malicious infrastructure through verified abuse databases.</li>
            <li><strong>High Community Consensus:</strong> Multiple independent community reports are logged matching the exact message template and target entity.</li>
          </ul>
        </section>

        {/* 2. How Risk Levels Are Assigned */}
        <section className="space-y-2 text-xs text-text-muted leading-relaxed">
          <h2 className="text-base font-semibold text-text">2. Risk Levels Explained</h2>
          <div className="space-y-3">
            <div className="border-l-2 border-l-border pl-3">
              <p className="font-bold text-text">⚪ Unknown Risk</p>
              <p>Insufficient signals to classify threat. Treat with caution and verify independently.</p>
            </div>
            <div className="border-l-2 border-l-safe-border pl-3">
              <p className="font-bold text-text">🟢 Low Risk</p>
              <p>No active campaigns or threat indicators matching this signature have been identified. Exercise normal vigilance.</p>
            </div>
            <div className="border-l-2 border-l-amber-500 pl-3">
              <p className="font-bold text-text">🟡 Medium Risk</p>
              <p>Potential threat indicators matching this signature have been identified, requiring cautious independent verification.</p>
            </div>
            <div className="border-l-2 border-l-red-500 pl-3">
              <p className="font-bold text-text">🔴 High Risk</p>
              <p>Active impersonation campaigns identified with verified warnings from utilities or official registries. Extreme caution advised.</p>
            </div>
            <div className="border-l-2 border-l-red-700 pl-3">
              <p className="font-bold text-text">🚨 Critical Risk</p>
              <p>Widespread active campaigns targeting critical infrastructure, financial access, or state portals with severe risks of immediate loss.</p>
            </div>
          </div>
        </section>

        {/* 3. How Confidence is Calculated */}
        <section className="space-y-2 text-xs text-text-muted leading-relaxed">
          <h2 className="text-base font-semibold text-text">3. How Confidence is Calculated</h2>
          <p>
            Confidence scores reflect the strength of evidence. We look at matching text patterns, domain registration ages, known brand-impersonation indicators, and the volume of independent reports. We do not use arbitrary predictions.
          </p>
        </section>

        {/* 4. Official Alerts vs. Community Reports */}
        <section className="space-y-2 text-xs text-text-muted leading-relaxed">
          <h2 className="text-base font-semibold text-text">4. Official Sources vs. Community Reports</h2>
          <p>
            <strong>Official Alerts</strong> are official warnings published by government agencies (FTC, FCC, Attorney General) or utilities (like Duke Energy or SunPass). <strong>Community Reports</strong> are submissions from everyday citizens who receive suspicious text messages or phone calls. Combining both allows us to warn you about new scams before official alerts are published.
          </p>
        </section>

        {/* 5. Human Review Policy */}
        <section className="space-y-2 text-xs text-text-muted leading-relaxed">
          <h2 className="text-base font-semibold text-text">5. Human Review &amp; Moderation</h2>
          <p>
            To prevent abuse, harassment, or error, every campaign published to the public Florida Alerts Feed is reviewed by a human moderator. Moderators confirm that the report contains a verified scam signature and that all personal information is removed.
          </p>
        </section>

        {/* 6. Dispute & Data Removal Procedure */}
        <section className="space-y-2 text-xs text-text-muted leading-relaxed">
          <h2 className="text-base font-semibold text-text">6. Data Removal &amp; Dispute Policy</h2>
          <p>
            If you represent a legitimate company whose domain, phone number, or brand has been flagged in error, please contact us at <a href="mailto:abuse@scamwatch.org" className="text-brand underline">abuse@scamwatch.org</a>. We review disputes within 24 hours and immediately white-list verified legitimate entities.
          </p>
        </section>

        {/* 7. What ScamWatch Can and Cannot Do */}
        <section className="space-y-4">
          <h2 className="text-base font-semibold text-text">7. What ScamWatch Can and Cannot Do</h2>
          <div className="grid gap-4 sm:grid-cols-2 text-xs leading-relaxed">
            <div className="panel p-4 border-l-2 border-l-safe-border space-y-2">
              <h3 className="font-semibold text-text">What ScamWatch Can Do</h3>
              <ul className="list-disc pl-4 space-y-1 text-text-muted">
                <li>Flag common scam indicators inside links, phone numbers, and messages.</li>
                <li>Explain why something looks suspicious using matched fraud templates.</li>
                <li>Suggest safer next steps if you have been targeted.</li>
                <li>Point users to official federal and state reporting channels.</li>
                <li>Help users pause and verify before clicking or paying.</li>
              </ul>
            </div>
            <div className="panel p-4 border-l-2 border-l-brand space-y-2">
              <h3 className="font-semibold text-text">What ScamWatch Cannot Do</h3>
              <ul className="list-disc pl-4 space-y-1 text-text-muted">
                <li>Guarantee that any message, website, or phone number is 100% safe.</li>
                <li>Recover stolen money or reverse fraudulent card charges.</li>
                <li>Replace your bank, police department, lawyer, or government agencies.</li>
                <li>Verify every global phone number or domain in real time.</li>
                <li>Provide official legal, financial, or law-enforcement advice.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 8. Data De-Identification & What NOT to Submit */}
        <section className="space-y-2 text-xs text-text-muted leading-relaxed">
          <h2 className="text-base font-semibold text-text">8. Privacy &amp; Sensitive Information Guidelines</h2>
          <p>
            <strong>What we DO NOT collect:</strong> ScamWatch does not use tracking cookies or sell your activity data. We do not store original screenshot metadata (EXIF/GPS) or personal identifiers in raw narrative text.
          </p>
          <div className="rounded-md bg-amber-500/10 border border-amber-500/20 p-4 text-xs space-y-1 text-text-muted">
            <p className="font-bold text-amber-500">❌ What users should NEVER submit:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Your personal bank PINs, CVV codes, or active passwords.</li>
              <li>Your full Social Security Number (SSN) or account balances.</li>
              <li>Credit card scans showing your full name and security code.</li>
            </ul>
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
