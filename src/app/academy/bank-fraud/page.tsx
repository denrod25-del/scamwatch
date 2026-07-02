import React from 'react';
import AcademyArticleLayout from '@/components/layout/AcademyArticleLayout';

export default function BankFraudAcademyPage(): React.JSX.Element {
  return (
    <AcademyArticleLayout
      title="Bank Fraud Text Scams"
      description="Fake security alerts claiming suspicious activity or transfers on your bank account."
      lastUpdated="July 2, 2026"
      seniorSummary="Banks will never ask you to transfer money to another account to 'protect it' from fraud, nor will they ask you to read back one-time security codes. If you get a text or call claiming fraud on your account, hang up and call the number on the back of your debit card."
      dos={[
        "Hang up immediately if a caller claims they represent your bank's fraud unit.",
        "Call the official number printed directly on the back of your credit or debit card.",
        "Review transactions inside your bank's official mobile application or web portal."
      ]}
      donts={[
        "Do not transfer funds to anyone claiming it will keep your money safe.",
        "Do not share one-time security codes, passwords, or PINs with anyone.",
        "Do not reply 'YES' or 'NO' to suspicious text notifications."
      ]}
      faqs={[
        {
          q: "Will my bank ever call me?",
          a: "A bank may call you to verify recent card transactions, but they will never ask you to transfer funds via Zelle, give them one-time passcodes, or verify password credentials over the phone."
        },
        {
          q: "What should I do if I shared a one-time passcode?",
          a: "Call your bank's official number immediately to report account compromise, freeze your cards, and reset your login details."
        }
      ]}
      verificationLinks={[
        { label: "FTC Bank Impersonation Guide", url: "https://consumer.ftc.gov/consumer-alerts/2023/06/know-how-spot-bank-impersonation-scams" },
        { label: "Wells Fargo Security Alerts Guide", url: "https://www.wellsfargo.com/privacy-security/fraud/" },
        { label: "Chase Security Fraud Alerts", url: "https://www.chase.com/personal/security" }
      ]}
      reportingLinks={[
        { label: "FTC Fraud Report", url: "https://reportfraud.ftc.gov" },
        { label: "FBI IC3 Complaint Portal", url: "https://www.ic3.gov" }
      ]}
      shareText="Hi there! I wanted to share a warning about fake bank text messages claiming there is suspicious activity or Zelle transfers on your account. If you reply, scammers call pretending to be your bank and ask you to move your money or read back security codes. Please ignore these texts and call the phone number on the back of your card instead!"
    >
      <section className="space-y-2">
        <h2 className="text-base font-semibold text-text">How It Works</h2>
        <p>
          You receive a text message claiming to be from Chase, Wells Fargo, Bank of America, or another major bank. The message asks you to confirm if you authorized a large transaction (often for Zelle transfers or wiring services like Zelle/Venmo, e.g. $800 to an unfamiliar name).
        </p>
        <p>
          If you reply &ldquo;NO&rdquo;, your phone rings immediately. The caller ID displays the name of your bank. The scammer pretending to be a bank agent tells you your account is compromised and instructs you to transfer your funds to a &ldquo;safe account&rdquo; or read back one-time codes to verify your identity. In reality, they are using these details to drain your accounts.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-text">Key Indicators</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Disconnection Calls:</strong> Urgently pushing you to transfer money to yourself or a secure safety vault via Zelle.</li>
          <li><strong>One-Time Passcodes:</strong> Asking you to read back a verification code sent to your phone. Banks will never ask for this.</li>
          <li><strong>Aggressive Urgency:</strong> Demanding that you act immediately before your funds are permanently frozen.</li>
        </ul>
      </section>
    </AcademyArticleLayout>
  );
}
