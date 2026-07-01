import React from 'react';
import Link from 'next/link';

export default function TrafficTicketsAcademy(): React.JSX.Element {
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
            Fake DMV &amp; Traffic Ticket Scams
          </h1>
          <p className="text-sm text-text-muted leading-relaxed">
            Scammers send text notifications claiming you have an outstanding speeding ticket or DMV fee.
          </p>
        </header>

        <hr className="border-border" />

        <section className="space-y-2 text-xs text-text-muted leading-relaxed">
          <h2 className="text-base font-semibold text-text">How It Works</h2>
          <p>
            An SMS claiming to be from the DMV or a local municipal traffic court warns of an outstanding citation. The message asserts your vehicle registration is about to be suspended. It includes a link to resolve the citation by paying a fine.
          </p>
        </section>

        <section className="space-y-2 text-xs text-text-muted leading-relaxed">
          <h2 className="text-base font-semibold text-text">Key Indicators</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Out-of-State Senders:</strong> Messages often originate from numbers with area codes far outside Florida.</li>
            <li><strong>Official Citation Numbers Missing:</strong> The message does not list your actual license plate or citation number.</li>
            <li><strong>Non-Government Domains:</strong> Official Florida DMV websites always end in <code>.gov</code> (such as <code>flhsmv.gov</code>).</li>
          </ul>
        </section>

        <section className="space-y-2 text-xs text-text-muted leading-relaxed">
          <h2 className="text-base font-semibold text-text">What to Do</h2>
          <p>
            Do not pay fines via links sent in SMS messages. Visit the official Florida Highway Safety and Motor Vehicles portal directly at <strong>flhsmv.gov</strong> to query your driver license status.
          </p>
        </section>
      </article>
    </div>
  );
}
