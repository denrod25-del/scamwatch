import React from 'react';
import Link from 'next/link';

export default function BankFraudAcademy(): React.JSX.Element {
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
            Bank Fraud Text Scams
          </h1>
          <p className="text-sm text-text-muted leading-relaxed">
            Fake security alerts claiming suspicious activity or transfers on your bank account.
          </p>
        </header>

        <hr className="border-border" />

        <section className="space-y-2 text-xs text-text-muted leading-relaxed">
          <h2 className="text-base font-semibold text-text">How It Works</h2>
          <p>
            An SMS claiming to represent Chase, Wells Fargo, or Bank of America asks if you authorized a large transaction (e.g. $800 to Zelle). If you reply &quot;NO&quot;, you receive a call from a scammer spoofing your bank&apos;s caller ID. They walk you through transferring your money to a &quot;safe account&quot; which they control.
          </p>
        </section>

        <section className="space-y-2 text-xs text-text-muted leading-relaxed">
          <h2 className="text-base font-semibold text-text">Key Indicators</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Immediate Callbacks:</strong> Prompting you to call a specific phone number or receiving a call immediately after replying to a text.</li>
            <li><strong>Zelle / Wire Requests:</strong> The bank will never ask you to transfer funds to yourself or a &quot;secure safety vault&quot; via Zelle.</li>
            <li><strong>PIN / Code requests:</strong> Bank staff will never ask you to read back a one-time passcode sent to your phone.</li>
          </ul>
        </section>

        <section className="space-y-2 text-xs text-text-muted leading-relaxed">
          <h2 className="text-base font-semibold text-text">What to Do</h2>
          <p>
            Do not reply. Hang up. Find the official customer service telephone number located on the back of your credit or debit card, and call them directly.
          </p>
        </section>
      </article>
    </div>
  );
}
