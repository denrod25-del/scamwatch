import React from 'react';
import Link from 'next/link';

export default function HowToReportAcademy(): React.JSX.Element {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 space-y-6">
      <div>
        <Link href="/academy" className="text-xs font-semibold underline text-brand hover:text-brand/80">
          ← Back to Academy
        </Link>
      </div>

      <article className="space-y-6">
        <header className="space-y-2">
          <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-text">
            How to Report Scam Texts and Messages
          </h1>
          <p className="text-sm text-text-muted leading-relaxed">
            Report suspicious messages to telecommunications carriers and federal/state regulators to shut down fraud operators.
          </p>
        </header>

        <hr className="border-border" />

        <section className="space-y-2 text-xs text-text-muted leading-relaxed">
          <h2 className="text-base font-semibold text-text">1. Forward to 7726 (SPAM)</h2>
          <p>
            Cellular carriers operate a centralized reporting registry. Copy the text message and forward it to shortcode <strong>7726</strong> (spells SPAM on keypads). This works for AT&amp;T, T-Mobile, and Verizon, and alerts carrier security to block the sender.
          </p>
        </section>

        <section className="space-y-2 text-xs text-text-muted leading-relaxed">
          <h2 className="text-base font-semibold text-text">2. Report to the FTC</h2>
          <p>
            Report fraud narratives, URLs, and phone numbers to the Federal Trade Commission at <a href="https://reportfraud.ftc.gov" className="text-brand underline" target="_blank" rel="noopener noreferrer">reportfraud.ftc.gov</a>. Your report helps federal law enforcement build cases against scam networks.
          </p>
        </section>

        <section className="space-y-2 text-xs text-text-muted leading-relaxed">
          <h2 className="text-base font-semibold text-text">3. Report Cyber Crime to FBI IC3</h2>
          <p>
            If you experienced financial loss or wire fraud, file a complaint with the FBI Internet Crime Complaint Center (IC3) at <a href="https://www.ic3.gov" className="text-brand underline" target="_blank" rel="noopener noreferrer">ic3.gov</a>.
          </p>
        </section>
      </article>
    </div>
  );
}
