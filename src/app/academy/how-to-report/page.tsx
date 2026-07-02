import React from 'react';
import AcademyArticleLayout from '@/components/layout/AcademyArticleLayout';

export default function HowToReportAcademyPage(): React.JSX.Element {
  return (
    <AcademyArticleLayout
      title="How to Report Scam Texts &amp; Messages"
      description="Report suspicious messages to telecommunications carriers and federal/state regulators to shut down fraud operators."
      lastUpdated="July 2, 2026"
      seniorSummary="Reporting scam texts to 7726 blocks the sender across all major carrier networks. Filing complaints with the FTC and FBI IC3 helps shut down scam registries and track down offshore operations."
      dos={[
        "Copy the scam text message and forward it to 7726 (SPAM) to alert your carrier.",
        "File a fraud complaint on the official FTC website at reportfraud.ftc.gov.",
        "Keep scam screenshots and receipt details as evidence."
      ]}
      donts={[
        "Do not call the scammers back to express your anger.",
        "Do not delete the scam evidence before copying the caller ID and link.",
        "Do not pay anyone claiming they can recover your money for an upfront fee."
      ]}
      faqs={[
        {
          q: "Does it cost anything to forward texts to 7726?",
          a: "No. Forwarding scam messages to 7726 is completely free and supported by AT&T, Verizon, and T-Mobile."
        },
        {
          q: "What happens after I report a scam to the FTC?",
          a: "The FTC registers the scam indicators in a secure database used by thousands of law enforcement agencies to track down and prosecute scam syndicates."
        }
      ]}
      verificationLinks={[
        { label: "FTC Report Fraud Homepage", url: "https://reportfraud.ftc.gov" },
        { label: "FBI Internet Crime Complaint Center (IC3)", url: "https://www.ic3.gov" }
      ]}
      reportingLinks={[
        { label: "FCC Spam Texts Advisory", url: "https://www.fcc.gov/rules-consumers-unwanted-calls-and-texts" },
        { label: "Florida Attorney General Portal", url: "https://myfloridalegal.com" }
      ]}
      shareText="Hi there! I wanted to share this quick guide on how to report scam texts and calls. You can forward any spam text to 7726 (spells SPAM) for free, which alerts phone companies to block the number. It's a simple way we can all help protect our community!"
    >
      <section className="space-y-2">
        <h2 className="text-base font-semibold text-text">1. Forward to 7726 (SPAM)</h2>
        <p>
          Cellular carriers operate a centralized reporting registry. Copy the text message and forward it to shortcode <strong>7726</strong> (spells SPAM on keypads). This works for AT&amp;T, T-Mobile, and Verizon, and alerts carrier security to block the sender and shut down the links.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-text">2. Report to the FTC</h2>
        <p>
          Report fraud narratives, URLs, and phone numbers to the Federal Trade Commission at <a href="https://reportfraud.ftc.gov" className="text-brand underline" target="_blank" rel="noopener noreferrer">reportfraud.ftc.gov</a>. Your report helps federal law enforcement build cases against scam networks.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-text">3. Report Cyber Crime to FBI IC3</h2>
        <p>
          If you experienced financial loss or wire fraud, file a complaint with the FBI Internet Crime Complaint Center (IC3) at <a href="https://www.ic3.gov" className="text-brand underline" target="_blank" rel="noopener noreferrer">ic3.gov</a> to initiate tracking of stolen funds.
        </p>
      </section>
    </AcademyArticleLayout>
  );
}
