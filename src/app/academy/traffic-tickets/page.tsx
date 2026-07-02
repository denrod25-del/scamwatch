import React from 'react';
import AcademyArticleLayout from '@/components/layout/AcademyArticleLayout';

export default function TrafficTicketsAcademyPage(): React.JSX.Element {
  return (
    <AcademyArticleLayout
      title="Traffic Ticket &amp; Citation Scams"
      description="Unsolicited warnings asserting that you have unpaid red-light camera citations or speed trap violations."
      lastUpdated="July 2, 2026"
      seniorSummary="Official Florida traffic tickets are always sent by mail from the local clerk of courts, never by text message or email. If you receive an urgent text claiming you owe money for a speeding ticket or red-light camera, delete it immediately."
      dos={[
        "Ignore text and email demands for traffic ticket payments.",
        "Verify citations directly on the official Florida Clerk of Courts website.",
        "Use the official citation number to search court records."
      ]}
      donts={[
        "Do not enter driver's license numbers on unverified websites.",
        "Do not pay traffic fines via wire transfer, gift cards, or crypto.",
        "Do not open attachments on emails claiming to be citations."
      ]}
      faqs={[
        {
          q: "How are legitimate citations sent?",
          a: "Legitimate traffic citations are delivered via physical mail through the US Postal Service and will direct you to pay through your local county clerk of courts portal."
        },
        {
          q: "What if I actually had a speeding ticket recently?",
          a: "Always look up your driver's license or citation number on your local county's official clerk of courts website to check for outstanding court actions."
        }
      ]}
      verificationLinks={[
        { label: "Florida Highway Safety and Motor Vehicles", url: "https://www.flhsmv.gov" },
        { label: "Florida Clerk of Courts Directory", url: "https://flclerks.com" }
      ]}
      reportingLinks={[
        { label: "FTC Fraud Report", url: "https://reportfraud.ftc.gov" },
        { label: "Florida Attorney General Portal", url: "https://myfloridalegal.com" }
      ]}
      shareText="Hi there! Just wanted to share a quick warning: scammers are sending text messages about fake traffic tickets or speeding citations in Florida. If you get one, it's a scam. Legitimate tickets always arrive in the mail, never by text. Let's make sure our family doesn't get tricked!"
    >
      <section className="space-y-2">
        <h2 className="text-base font-semibold text-text">How It Works</h2>
        <p>
          Scammers send automated text messages or emails claiming you have an unpaid traffic citation, parking ticket, or red-light camera violation. They warn you that failure to pay the fine immediately will result in a driver's license suspension, vehicle registration hold, or legal prosecution.
        </p>
        <p>
          The message includes a link to a fake &ldquo;Florida Citation Portal&rdquo; that asks you to enter your credit card number, date of birth, and driver's license number. Once entered, the scammers use these details to steal your identity and money.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-text">Key Indicators</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Text Notification:</strong> Florida courts never notify citizens of citations or fines via SMS text.</li>
          <li><strong>Generic Web Portals:</strong> Link addresses that use suspicious domains like <code>florida-citations-processing.com</code> instead of the official county clerk site.</li>
          <li><strong>No County Specified:</strong> Failure to specify which county sheriff or police department issued the ticket.</li>
        </ul>
      </section>
    </AcademyArticleLayout>
  );
}
