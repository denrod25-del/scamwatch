import React from 'react';
import Link from 'next/link';

export default function TollTextsAcademy(): React.JSX.Element {
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
            Fake Toll Text Scams (Smishing)
          </h1>
          <p className="text-sm text-text-muted leading-relaxed">
            Unpaid toll texts are currently the most common text message scam in Florida.
          </p>
        </header>

        <hr className="border-border" />

        <section className="space-y-2 text-xs text-text-muted leading-relaxed">
          <h2 className="text-base font-semibold text-text">How It Works</h2>
          <p>
            You receive a text claiming you owe a small amount for toll charges (e.g. $4.15 or $5.20). The text warns that if you do not pay within 24 hours, you will face driver license suspension or a $50 late fee. It includes a link that leads to a fake replica website designed to look like SunPass, E-Pass, or another local toll portal.
          </p>
        </section>

        <section className="space-y-2 text-xs text-text-muted leading-relaxed">
          <h2 className="text-base font-semibold text-text">Key Indicators (Red Flags)</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Non-Official Links:</strong> The domain is a variation like <code>sunpass-tolls-fees.com</code> or <code>florida-tolls-epass.com</code> instead of the official <code>sunpass.com</code>.</li>
            <li><strong>Short Fines Timeline:</strong> Threatening collections or license suspensions within a single day.</li>
            <li><strong>Standard Phone Numbers:</strong> Official notifications do not come from random 10-digit cellphone numbers.</li>
          </ul>
        </section>

        <section className="space-y-2 text-xs text-text-muted leading-relaxed">
          <h2 className="text-base font-semibold text-text">What to Do</h2>
          <p>
            Do not click the link. If you want to check your balance, open your web browser, type <strong>sunpass.com</strong> manually, and log in to your account.
          </p>
        </section>
      </article>
    </div>
  );
}
