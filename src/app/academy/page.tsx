import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Academy — ScamWatch',
  description: 'Understand how common scams work, identify pressure tactics, and learn response checklists in plain language.',
};

export default function AcademyPage(): React.JSX.Element {
  const ARTICLES = [
    {
      slug: 'toll-texts',
      title: 'Fake Toll Text Scams',
      desc: 'How to spot fake unpaid toll alerts from SunPass/E-Pass and check your balance safely.',
    },
    {
      slug: 'traffic-tickets',
      title: 'Fake DMV & Traffic Citation Scams',
      desc: 'Identifying spoofed traffic citation text messages and license suspension warnings.',
    },
    {
      slug: 'utility-shutoffs',
      title: 'Utility Shutoff Scams',
      desc: 'What to do if Duke Energy, FPL, or other utilities threaten immediate power cutoff.',
    },
    {
      slug: 'package-deliveries',
      title: 'Package Delivery Hold Scams',
      desc: 'Spotting fake USPS, FedEx, and DHL address correction and customs fee texts.',
    },
    {
      slug: 'bank-fraud',
      title: 'Bank Fraud Alerts & Zelle Scams',
      desc: 'Protecting your PIN codes and avoiding fraudulent transfer requests.',
    },
    {
      slug: 'what-if-clicked',
      title: 'What to Do If You Clicked a Link',
      desc: 'A checklist of immediate steps to freeze accounts, change credentials, and protect data.',
    },
    {
      slug: 'how-to-report',
      title: 'How to Report Scams and Spam',
      desc: 'How to report text scams to carriers (7726), the FTC, and FBI IC3.',
    },
  ];

  const FAQS = [
    {
      q: 'How do I check if a text message is a scam?',
      a: 'Look for red flags: high urgency (fines in 24 hours), links that look like official sites but are not (e.g. sunpass-late-fees.com), and sender numbers from random 10-digit mobile phones. If in doubt, type the official site address manually in your browser.',
    },
    {
      q: 'Does SunPass send text alerts for unpaid tolls?',
      a: 'No. SunPass does not text customers requesting payment for unpaid tolls. Official notifications are mailed or posted inside the official SunPass portal.',
    },
    {
      q: 'Where do I report spam text messages in Florida?',
      a: 'You can forward spam texts to shortcode 7726. You can also file reports with the FTC at reportfraud.ftc.gov, the Florida Attorney General, and the FBI IC3.',
    },
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': FAQS.map((faq) => ({
      '@type': 'Question',
      'name': faq.q,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': faq.a,
      },
    })),
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 space-y-8">
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header */}
      <div>
        <span className="badge-pill bg-brand/10 text-brand text-[10px] uppercase font-bold tracking-wider">
          Public Benefit Education
        </span>
        <h1 className="mt-2 font-display text-4xl font-bold uppercase tracking-tight text-text">
          ScamWatch Academy
        </h1>
        <p className="mt-2 text-sm text-text-muted">
          Understanding is the first line of defense. Read our plain-language guides to identify common scam tactics.
        </p>
      </div>

      <hr className="border-border" />

      {/* Articles Grid */}
      <section className="grid gap-4 sm:grid-cols-2">
        {ARTICLES.map((article) => (
          <div key={article.slug} className="panel p-5 flex flex-col justify-between space-y-3">
            <div>
              <h2 className="font-display text-base font-semibold text-text">{article.title}</h2>
              <p className="mt-1 text-xs text-text-muted leading-relaxed">{article.desc}</p>
            </div>
            <div>
              <Link
                href={`/academy/${article.slug}`}
                className="text-xs font-semibold underline text-brand hover:text-brand/80"
              >
                Read Lesson →
              </Link>
            </div>
          </div>
        ))}
      </section>

      {/* FAQ Section */}
      <section className="panel p-6 space-y-4">
        <h2 className="font-display text-lg font-bold uppercase tracking-wider text-text">
          Frequently Asked Questions (FAQ)
        </h2>
        <div className="space-y-4 text-xs">
          {FAQS.map((faq, idx) => (
            <div key={idx} className="space-y-1">
              <p className="font-semibold text-text">{faq.q}</p>
              <p className="text-text-muted leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
