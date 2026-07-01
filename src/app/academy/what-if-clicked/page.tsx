import React from 'react';
import Link from 'next/link';

export default function WhatIfClickedAcademy(): React.JSX.Element {
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
            What to Do If You Clicked a Scam Link
          </h1>
          <p className="text-sm text-text-muted leading-relaxed">
            Steps to protect yourself immediately if you interacted with a suspicious message.
          </p>
        </header>

        <hr className="border-border" />

        <section className="space-y-2 text-xs text-text-muted leading-relaxed">
          <h2 className="text-base font-semibold text-text">1. Disconnect Immediately</h2>
          <p>
            If you realize mid-session that a site is fake, close the tab, turn off your mobile data, or disconnect your phone from Wi-Fi. This can prevent further background scripts or payloads from running.
          </p>
        </section>

        <section className="space-y-2 text-xs text-text-muted leading-relaxed">
          <h2 className="text-base font-semibold text-text">2. Contact Your Financial Institution</h2>
          <p>
            If you entered credit card details, debit card numbers, or online banking credentials, call your bank immediately using the phone number on the back of your card. Report fraud, cancel/reissue your cards, and monitor transactions.
          </p>
        </section>

        <section className="space-y-2 text-xs text-text-muted leading-relaxed">
          <h2 className="text-base font-semibold text-text">3. Change Passwords</h2>
          <p>
            If you logged in to a spoofed account, change the password immediately. If you reuse that password on other sites (such as your email or banking portals), change them there as well and enable Two-Factor Authentication (2FA).
          </p>
        </section>

        <section className="space-y-2 text-xs text-text-muted leading-relaxed">
          <h2 className="text-base font-semibold text-text">4. Monitor Credit Reports</h2>
          <p>
            If you disclosed your Social Security Number, file a fraud alert with the three major credit bureaus (Equifax, Experian, TransUnion) and consider freezing your credit files.
          </p>
        </section>
      </article>
    </div>
  );
}
