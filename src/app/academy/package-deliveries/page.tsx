import React from 'react';
import Link from 'next/link';

export default function PackageDeliveriesAcademy(): React.JSX.Element {
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
            Package Delivery Scams (UPS/FedEx/USPS)
          </h1>
          <p className="text-sm text-text-muted leading-relaxed">
            Fake text messages claiming your shipment is on hold due to incorrect address details or unpaid customs fees.
          </p>
        </header>

        <hr className="border-border" />

        <section className="space-y-2 text-xs text-text-muted leading-relaxed">
          <h2 className="text-base font-semibold text-text">How It Works</h2>
          <p>
            You receive a text indicating a package from USPS, FedEx, or DHL cannot be delivered. The message asks you to click a link to update your delivery address or pay a small fee (e.g. $1.50). The link takes you to a fake package tracking page that steals your credit card number.
          </p>
        </section>

        <section className="space-y-2 text-xs text-text-muted leading-relaxed">
          <h2 className="text-base font-semibold text-text">Key Indicators</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Suspicious Links:</strong> Domain names like <code>usps-delivery-status.com</code> instead of <code>usps.com</code>.</li>
            <li><strong>Imminent Return warnings:</strong> Claims that the package will be returned to sender within 24 hours.</li>
            <li><strong>Unexplained Fees:</strong> USPS does not text you to request additional payments for package delivery.</li>
          </ul>
        </section>

        <section className="space-y-2 text-xs text-text-muted leading-relaxed">
          <h2 className="text-base font-semibold text-text">What to Do</h2>
          <p>
            Do not click the link. Copy the tracking number (if provided) and paste it directly into the search bar of the official carrier website (e.g. <strong>usps.com</strong> or <strong>fedex.com</strong>).
          </p>
        </section>
      </article>
    </div>
  );
}
