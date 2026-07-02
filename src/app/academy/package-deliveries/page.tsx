import React from 'react';
import AcademyArticleLayout from '@/components/layout/AcademyArticleLayout';

export default function PackageDeliveriesAcademyPage(): React.JSX.Element {
  return (
    <AcademyArticleLayout
      title="Package Delivery Scams (UPS/FedEx/USPS)"
      description="Fake text messages claiming your shipment is on hold due to incorrect address details or unpaid customs fees."
      lastUpdated="July 2, 2026"
      seniorSummary="Delivery services (like USPS, FedEx, and UPS) will never text you out of the blue to ask for credit card numbers or address corrections to release a package. If you receive a text with a link asking for money or address details, do not click it. Always verify the tracking number directly on the official carrier's website."
      dos={[
        "Ignore texts claiming a package is suspended or undelivered.",
        "Copy any tracking number and paste it directly on the official UPS, FedEx, or USPS site.",
        "Forward suspicious package texts to 7726."
      ]}
      donts={[
        "Do not click links in SMS notifications about unexpected packages.",
        "Do not pay 'address correction fees' or 'customs holds' on unverified domains.",
        "Do not enter personal credentials or passwords on pages that appear after clicking."
      ]}
      faqs={[
        {
          q: "Why do I receive these if I didn't order anything?",
          a: "Scammers send these bulk texts to thousands of numbers at once, knowing that many people are actively waiting for an online order to arrive."
        },
        {
          q: "How can I tell a real USPS text from a fake?",
          a: "Legitimate USPS text alerts only come if you explicitly requested them for a specific tracking number, and they never contain links to input payment or personal details."
        }
      ]}
      verificationLinks={[
        { label: "Official USPS Tracking", url: "https://tools.usps.com" },
        { label: "Official UPS Support Page", url: "https://www.ups.com/us/en/support/contact-us.page" },
        { label: "Official FedEx Fraud Alerts", url: "https://www.fedex.com/en-us/trust-center/report-abuse.html" }
      ]}
      reportingLinks={[
        { label: "FTC Fraud Report", url: "https://reportfraud.ftc.gov" },
        { label: "USPS Postal Inspection Service", url: "https://www.uspis.gov" }
      ]}
      shareText="Hi there! I wanted to warn you about text messages pretending to be from USPS, FedEx, or UPS, claiming a package cannot be delivered unless you click a link and pay a fee. It's a scam to steal credit card details. Never click links in package texts—always check the official tracking website directly!"
    >
      <section className="space-y-2">
        <h2 className="text-base font-semibold text-text">How It Works</h2>
        <p>
          You receive an SMS text message indicating a package from USPS, FedEx, or UPS cannot be delivered due to an incorrect zip code or address. The message directs you to click a link to update your delivery address or pay a small fee (typically under $2.00) to schedule redelivery.
        </p>
        <p>
          The link takes you to a fake tracking portal that mimics the branding of the target shipping company. Once you enter your payment details to pay the redelivery fee, scammers capture your card details.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-text">Key Indicators</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Incorrect Domains:</strong> Links pointing to domains like <code>usps-address-correct.com</code> instead of the official <code>usps.com</code>.</li>
          <li><strong>Immediate Deadlines:</strong> Threats that your package will be returned to sender or destroyed within 24 hours if you do not act.</li>
          <li><strong>Suspicious Sender Numbers:</strong> Standard 10-digit mobile numbers or international country codes sending alerts instead of shortcode numbers.</li>
        </ul>
      </section>
    </AcademyArticleLayout>
  );
}
