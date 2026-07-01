import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const capitalized = slug.toUpperCase();
  if (capitalized === 'FL-001') {
    return {
      title: 'SunPass Toll Text Scam (Smishing Alert)',
      description: 'Learn how to identify fake unpaid toll text messages, spot red flags, and protect your credit card info.',
    };
  }
  if (capitalized === 'FL-002') {
    return {
      title: 'Duke Energy Utility Disconnection Scam Alert',
      description: 'Duke Energy impersonators threatening power shutoffs. Spot gift card payment fraud indicators.',
    };
  }
  return { title: `Threat Campaign: ${slug}` };
}

export default async function ThreatPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<React.JSX.Element> {
  const { slug } = await params;
  const campaignId = slug.toUpperCase();

  const isFl001 = campaignId === 'FL-001';
  const isFl002 = campaignId === 'FL-002';

  if (!isFl001 && !isFl002) {
    notFound();
  }

  // Schema Markup (Article + FAQPage)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'NewsArticle',
        '@id': `https://scamwatch.org/threat/${slug}#article`,
        'headline': isFl001 ? 'SunPass Toll Text Scam Alert (Smishing)' : 'Utility Disconnection Scam Alert (Duke Energy)',
        'datePublished': '2026-07-01T00:00:00Z',
        'dateModified': '2026-07-01T00:00:00Z',
        'author': {
          '@type': 'Organization',
          'name': 'ScamWatch Intelligence',
        },
        'publisher': {
          '@type': 'Organization',
          'name': 'ScamWatch',
        },
        'description': isFl001 
          ? 'Urgent warning regarding fraudulent SMS texts claiming unpaid SunPass toll fees.' 
          : 'Urgent warning regarding utility shutoff threats demanding payment via gift cards.',
      },
      {
        '@type': 'FAQPage',
        '@id': `https://scamwatch.org/threat/${slug}#faq`,
        'mainEntity': [
          {
            '@type': 'Question',
            'name': isFl001 ? 'Does SunPass send text messages for unpaid tolls?' : 'Does Duke Energy threaten service cutoffs over the phone?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': isFl001 
                ? 'No. SunPass does not send text messages requesting payment for unpaid tolls. Official invoices are mailed or visible directly inside your account on SunPass.com.' 
                : 'No. Duke Energy will never call and threaten immediate shutoff within 30 minutes, nor do they accept payments via gift cards or prepaid credit cards.',
            },
          },
        ],
      },
    ],
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-8">
      {/* JSON-LD Injections */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb List schema */}
      <nav aria-label="Breadcrumb" className="text-xs text-text-subtle">
        <ol className="flex gap-2">
          <li>
            <Link href="/" className="hover:underline">Home</Link>
          </li>
          <span>/</span>
          <li>
            <span className="font-semibold text-text">Threat Campaigns</span>
          </li>
          <span>/</span>
          <li aria-current="page">
            <span className="text-text-muted">{campaignId}</span>
          </li>
        </ol>
      </nav>

      {/* Main Campaign Details */}
      {isFl001 ? (
        <article className="space-y-6">
          <header className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="badge-pill bg-red-500/10 text-red-500 font-bold uppercase tracking-wider text-[10px]">
                High Risk Threat
              </span>
              <span className="text-xs text-text-subtle">Last Updated: July 1, 2026</span>
            </div>
            <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-text">
              SunPass Toll Text Scam (Smishing Alert)
            </h1>
            <p className="text-sm text-text-muted">
              Fraudulent SMS text messages impersonating the Florida SunPass toll agency to harvest consumer credit card details.
            </p>
          </header>

          <hr className="border-border" />

          {/* How It Works */}
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-text">How the Scam Works</h2>
            <p className="text-xs text-text-muted leading-relaxed">
              Targeted users receive an SMS text message warning that they have an unpaid toll balance (frequently $4.15). The message threatens immediate late fees or court collection actions if the balance is not settled within 24 hours. A hyperlink pointing to a spoofed domain (such as `sunpass-toll-fees.com` or `sunpass-resolve.com`) is provided.
            </p>
          </section>

          {/* Common Examples */}
          <section className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-subtle">Common Message Examples</h3>
            <div className="bg-background border border-border p-4 rounded-md font-mono text-xs text-text-muted">
              &ldquo;SunPass: Urgent warning. You have an unpaid toll balance of $4.15. To avoid a $50.00 collections fee, settle your balance immediately at sunpass-toll-fees.com&rdquo;
            </div>
          </section>

          {/* Red Flags */}
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-text">Red Flags to Watch For</h2>
            <ul className="list-disc pl-5 text-xs text-text-muted space-y-1">
              <li><strong>Spoofed Domains</strong>: The link does not end in the official `sunpass.com` domain.</li>
              <li><strong>Urgent Pressure</strong>: Demanding immediate payment to prevent exorbitant fines or driver license suspensions.</li>
              <li><strong>Unrecognized Senders</strong>: Messages arriving from random 10-digit telephone numbers instead of shortcodes.</li>
            </ul>
          </section>

          {/* Actions Checklist */}
          <section className="grid gap-4 sm:grid-cols-2">
            <div className="panel p-5 space-y-3">
              <h3 className="text-sm font-semibold text-text">Before you click</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Manually navigate to the official website at <a href="https://www.sunpass.com" className="text-brand underline" target="_blank" rel="noopener noreferrer">sunpass.com</a> or log in to your SunPass mobile app. Do not click links inside text messages.
              </p>
            </div>
            <div className="panel p-5 space-y-3">
              <h3 className="text-sm font-semibold text-text">If you already clicked</h3>
              <p className="text-xs text-text-muted leading-relaxed font-sans">
                If you entered payment card info, contact your credit card issuer immediately to report fraud and freeze the card. Change your SunPass account passwords.
              </p>
            </div>
          </section>

          {/* Official Verification Contacts */}
          <section className="rounded-lg border border-border bg-surface p-5 space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-text">Official Verification &amp; Reporting</h2>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://www.sunpass.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold rounded border border-border bg-background hover:bg-hover text-text"
              >
                Official SunPass Portal
              </a>
              <a
                href="https://reportfraud.ftc.gov"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold rounded border border-border bg-background hover:bg-hover text-text"
              >
                File FTC Fraud Report
              </a>
            </div>
          </section>

          {/* Confidence explain */}
          <p className="text-[10px] text-text-subtle italic">
            Calibrated campaign metrics: Evaluated by the Sentinel Ingestion Pipeline. Confidence level derived from 48+ verified matching community reports in Florida. Disclaimer: This guide is informational and does not constitute legal or financial advice.
          </p>
        </article>
      ) : (
        <article className="space-y-6">
          <header className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="badge-pill bg-red-500/10 text-red-500 font-bold uppercase tracking-wider text-[10px]">
                High Risk Threat
              </span>
              <span className="text-xs text-text-subtle">Last Updated: July 1, 2026</span>
            </div>
            <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-text">
              Duke Energy Shutoff Scam (Utility Alert)
            </h1>
            <p className="text-sm text-text-muted">
              Impersonation phone calls and text messages threatening utility cutoff unless payment is provided via prepaid gift cards.
            </p>
          </header>

          <hr className="border-border" />

          {/* How It Works */}
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-text">How the Scam Works</h2>
            <p className="text-xs text-text-muted leading-relaxed">
              Scammers call or text customers claiming their Duke Energy statement is overdue. They threaten utility termination within 30 minutes unless the customer buys a prepaid card (such as a Vanilla Gift or GreenDot card) and calls back to provide the PIN.
            </p>
          </section>

          {/* Common Examples */}
          <section className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-subtle">Common Examples</h3>
            <div className="bg-background border border-border p-4 rounded-md font-mono text-xs text-text-muted">
              &ldquo;Duke Energy Urgent: Your electric service will be disconnected in 30 minutes due to unpaid bill amount. Please pay immediately by calling +1-800-555-0142.&rdquo;
            </div>
          </section>

          {/* Red Flags */}
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-text">Red Flags to Watch For</h2>
            <ul className="list-disc pl-5 text-xs text-text-muted space-y-1">
              <li><strong>Prepaid Card Demand</strong>: Duke Energy never demands payment via gift cards or GreenDot cards.</li>
              <li><strong>Imminent Disconnection</strong>: Threatening power cutoffs within minutes. Official terminations require multiple notices.</li>
              <li><strong>Callback Numbers</strong>: Demands to call a custom helpline instead of the official customer service contact.</li>
            </ul>
          </section>

          {/* Actions Checklist */}
          <section className="grid gap-4 sm:grid-cols-2">
            <div className="panel p-5 space-y-3">
              <h3 className="text-sm font-semibold text-text">Before you click</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Hang up immediately. Log in to your Duke Energy online portal or call the official customer service line located on your bill statement.
              </p>
            </div>
            <div className="panel p-5 space-y-3">
              <h3 className="text-sm font-semibold text-text">If you paid</h3>
              <p className="text-xs text-text-muted leading-relaxed font-sans">
                Contact your local police department immediately. Report the scam callback number and transaction details to the Florida Attorney General.
              </p>
            </div>
          </section>

          {/* Official Verification Contacts */}
          <section className="rounded-lg border border-border bg-surface p-5 space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-text">Official Verification &amp; Reporting</h2>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://www.duke-energy.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold rounded border border-border bg-background hover:bg-hover text-text"
              >
                Official Duke Energy Portal
              </a>
              <a
                href="https://myfloridalegal.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold rounded border border-border bg-background hover:bg-hover text-text"
              >
                Florida Attorney General
              </a>
            </div>
          </section>

          {/* Confidence explain */}
          <p className="text-[10px] text-text-subtle italic">
            Calibrated campaign metrics: Evaluated by the Sentinel Ingestion Pipeline. Confidence level derived from 22+ community reports. Disclaimer: This guide is informational and does not constitute legal or financial advice.
          </p>
        </article>
      )}
    </div>
  );
}
