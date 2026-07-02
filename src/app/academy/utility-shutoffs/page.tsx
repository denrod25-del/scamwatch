import React from 'react';
import AcademyArticleLayout from '@/components/layout/AcademyArticleLayout';

export default function UtilityShutoffsAcademyPage(): React.JSX.Element {
  return (
    <AcademyArticleLayout
      title="Utility Shutoff Scams"
      description="Calls or messages threatening to turn off your power or water within minutes."
      lastUpdated="July 2, 2026"
      seniorSummary="Utility companies (like Duke Energy or FPL) will never call you to threaten immediate power cutoff or demand payments via gift cards, prepaid vouchers, or crypto. If someone calls threatening to turn off your power within minutes, hang up."
      dos={[
        "Hang up immediately on aggressive callers threatening service disconnection.",
        "Call the official utility number found directly on your physical utility bill.",
        "Log in to your utility account online to verify outstanding balances."
      ]}
      donts={[
        "Do not pay utilities using gift cards (Vanilla, Apple), crypto, or prepaid vouchers.",
        "Do not give the caller account numbers, PINs, or home addresses.",
        "Do not call phone numbers provided by the caller."
      ]}
      faqs={[
        {
          q: "How do utilities handle unpaid balances?",
          a: "Legitimate utility providers send multiple written notifications in the mail over several weeks before service is interrupted. They also provide various official payment channels."
        },
        {
          q: "Can they shut off my power during extreme weather?",
          a: "In Florida, major utilities are prohibited from shutting off electricity during extreme heat events or when storm warnings are active. Sudden shutoff threats are a major red flag."
        }
      ]}
      verificationLinks={[
        { label: "Official Duke Energy Safety Page", url: "https://www.duke-energy.com/customer-service/scams-and-fraud" },
        { label: "Official FPL Scams Page", url: "https://www.fpl.com/help/safety/scams.html" }
      ]}
      reportingLinks={[
        { label: "FTC Consumer Protection", url: "https://reportfraud.ftc.gov" },
        { label: "Florida Attorney General Portal", url: "https://myfloridalegal.com" }
      ]}
      shareText="Hi there! I read about utility scammers calling people and pretending to be from Duke Energy or FPL, threatening to turn off electricity in 30 minutes unless they pay immediately using gift cards. It's a total scam. Utilities never demand gift cards or give sudden cutoff threats. If you get a call like this, please hang up!"
    >
      <section className="space-y-2">
        <h2 className="text-base font-semibold text-text">How It Works</h2>
        <p>
          An impersonator calls claiming to represent Duke Energy, FPL, or your local city utility company. They state you are behind on your bills and that a technician is on the way to cut off your service unless you make an immediate payment.
        </p>
        <p>
          To create panic, they demand you purchase a prepaid debit card (such as a Green Dot MoneyPak card) or a popular retail gift card, then call them back to share the PIN number. Once they have the PIN, the money is gone instantly.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-text">Key Indicators</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Immediate Disconnection Threats:</strong> Utilities never disconnect power without mailing multiple notices over several weeks.</li>
          <li><strong>Prepaid / Gift Card Demands:</strong> Legitimate companies will never request payment via Apple Gift Cards, Vanilla Cards, or Bitcoin.</li>
          <li><strong>Caller ID Spoofing:</strong> The caller ID may display the name of your utility, but it is easily faked. Always hang up and call back using the number on your bill.</li>
        </ul>
      </section>
    </AcademyArticleLayout>
  );
}
