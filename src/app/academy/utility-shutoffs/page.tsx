import React from 'react';
import Link from 'next/link';

export default function UtilityShutoffsAcademy(): React.JSX.Element {
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
            Utility Shutoff Scams
          </h1>
          <p className="text-sm text-text-muted leading-relaxed">
            Calls or messages threatening to turn off your power or water within minutes.
          </p>
        </header>

        <hr className="border-border" />

        <section className="space-y-2 text-xs text-text-muted leading-relaxed">
          <h2 className="text-base font-semibold text-text">How It Works</h2>
          <p>
            An impersonator calls claiming to represent Duke Energy, FPL, or your local city utility company. They state you are behind on your bills and that a technician is on the way to cut off your service unless you make an immediate payment. They direct you to purchase a prepaid visa or gift card at a retail store, then call them back to share the PIN number.
          </p>
        </section>

        <section className="space-y-2 text-xs text-text-muted leading-relaxed">
          <h2 className="text-base font-semibold text-text">Key Indicators</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Immediate Disconnection:</strong> Duke Energy and other utilities never turn off power without mailing multiple notices over several weeks.</li>
            <li><strong>Gift Cards / Crypto Payments:</strong> Legitimate companies will never request payment via Apple Gift Cards, Vanilla Cards, or Bitcoin.</li>
            <li><strong>Direct Callback Requests:</strong> Impersonators will give you a specific direct phone line to call rather than the main billing number.</li>
          </ul>
        </section>

        <section className="space-y-2 text-xs text-text-muted leading-relaxed">
          <h2 className="text-base font-semibold text-text">What to Do</h2>
          <p>
            Hang up. Locate the official phone number printed on your utility statement, or log in directly to your online dashboard. Duke Energy can be reached directly at <strong>duke-energy.com</strong>.
          </p>
        </section>
      </article>
    </div>
  );
}
