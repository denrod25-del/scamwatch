import React from 'react';
import AcademyArticleLayout from '@/components/layout/AcademyArticleLayout';

export default function TollTextsAcademyPage(): React.JSX.Element {
  return (
    <AcademyArticleLayout
      title="SunPass &amp; Toll Road Text Scams"
      description="Fake SMS messages claiming you have unpaid toll charges that will trigger immediate penalty fees."
      lastUpdated="July 2, 2026"
      seniorSummary="Florida utilities and toll agencies will never text you to demand immediate payment. If you receive a text with a link about unpaid toll balances, do not click it. Always type sunpass.com directly in your browser."
      dos={[
        "Ignore texts demanding urgent payments for unpaid tolls.",
        "Log in directly to the official SunPass.com portal.",
        "Forward scam texts to 7726 to alert carrier filters."
      ]}
      donts={[
        "Do not click links in unsolicited SMS messages.",
        "Do not enter credit card numbers on non-sunpass.com domains.",
        "Do not reply to the sender (they want to verify your phone number is active)."
      ]}
      faqs={[
        {
          q: "How do scammers know my phone number?",
          a: "Scammers purchase lists of mobile numbers leaked in past data breaches and send automated mass texts to random Florida area codes."
        },
        {
          q: "I clicked the link but didn't enter payment info. Am I safe?",
          a: "Usually yes. However, clicking the link registers that your line is active. Run a scan of your device and avoid clicking further links."
        }
      ]}
      verificationLinks={[
        { label: "Official SunPass Portal", url: "https://www.sunpass.com" },
        { label: "Florida Attorney General Alert", url: "https://myfloridalegal.com/newsrelease/attorney-general-moody-alerts-floridians-sunpass-smishing-scam" }
      ]}
      reportingLinks={[
        { label: "FTC Fraud Report", url: "https://reportfraud.ftc.gov" },
        { label: "FCC Smishing Report", url: "https://www.fcc.gov/unpaid-toll-text-scams-fcc-consumer-advisory" }
      ]}
      shareText="Hi there! I read about a new scam where people get text messages claiming they owe money for Florida tolls (SunPass). It's a fake link designed to steal credit card info. If you get one, please ignore it and check the official sunpass.com website instead."
    >
      <section className="space-y-2">
        <h2 className="text-base font-semibold text-text">How It Works</h2>
        <p>
          You receive a text message claiming you have an unpaid toll balance (frequently for a small, specific amount like $4.15 or $3.50). The message warns that to avoid an immediate collections fee of $50 or driver's license suspension, you must settle your balance immediately by clicking a link.
        </p>
        <p>
          The link takes you to a copycat website that looks exactly like the official SunPass website. Once you enter your login details or credit card information, the scammers steal your credentials and make unauthorized transactions.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-text">Key Indicators</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Incorrect Website Names:</strong> Links pointing to domains like <code>sunpass-toll-payment.com</code> or <code>floridatolls-bill.com</code> instead of <code>sunpass.com</code>.</li>
          <li><strong>Urgent Pressure Tactics:</strong> Demanding payment within 24 hours to prevent immediate collections or license suspensions.</li>
          <li><strong>Generic Greetings:</strong> Messages addressed to &ldquo;Dear Customer&rdquo; or without your real name.</li>
        </ul>
      </section>
    </AcademyArticleLayout>
  );
}
