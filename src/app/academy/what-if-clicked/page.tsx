import React from 'react';
import AcademyArticleLayout from '@/components/layout/AcademyArticleLayout';

export default function WhatIfClickedAcademyPage(): React.JSX.Element {
  return (
    <AcademyArticleLayout
      title="What to Do If You Clicked a Scam Link"
      description="Steps to protect yourself immediately if you interacted with a suspicious message."
      lastUpdated="July 2, 2026"
      seniorSummary="If you realize you clicked a fake link, don't panic. Disconnect from Wi-Fi immediately to stop background downloads. If you shared card details or passwords, freeze your cards and change logins immediately."
      dos={[
        "Disconnect your device from Wi-Fi and mobile data immediately.",
        "Call your bank's official support line using the number on your card.",
        "Change passwords on compromised accounts and enable Two-Factor Authentication (2FA)."
      ]}
      donts={[
        "Do not enter any more details on the page if you realize it's fake.",
        "Do not reuse the compromised password on any other online account.",
        "Do not ignore the incident—early action blocks account drain."
      ]}
      faqs={[
        {
          q: "I clicked the link but closed it immediately. Am I safe?",
          a: "Most likely yes. Simply clicking a link rarely compromises a modern device unless you download file attachments or enter personal info."
        },
        {
          q: "What should I do if I entered my Social Security Number?",
          a: "Immediately contact the three major credit bureaus to place a free credit freeze on your credit reports."
        }
      ]}
      verificationLinks={[
        { label: "Identity Theft Recovery Portal", url: "https://www.identitytheft.gov" },
        { label: "Equifax Credit Freeze Guide", url: "https://www.equifax.com/personal/education/credit/report/how-to-freeze-credit-report/" }
      ]}
      reportingLinks={[
        { label: "FTC Fraud Report", url: "https://reportfraud.ftc.gov" },
        { label: "Florida Attorney General Portal", url: "https://myfloridalegal.com" }
      ]}
      shareText="Hi there! I just read this really useful safety guide explaining what to do if you accidentally click a scam link. Key steps: turn off Wi-Fi, call your bank if you shared details, and change your passwords. Check it out in case you ever need it!"
    >
      <section className="space-y-2">
        <h2 className="text-base font-semibold text-text">1. Disconnect Immediately</h2>
        <p>
          If you realize mid-session that a site is fake, close the tab, turn off your mobile data, or disconnect your phone from Wi-Fi. This can prevent further background scripts or payloads from running on your device.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-text">2. Contact Your Financial Institution</h2>
        <p>
          If you entered credit card details, debit card numbers, or online banking credentials, call your bank immediately using the phone number on the back of your card. Report fraud, cancel/reissue your cards, and monitor transactions.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-text">3. Change Passwords</h2>
        <p>
          If you logged in to a spoofed account, change the password immediately. If you reuse that password on other sites (such as your email or banking portals), change them there as well and enable Two-Factor Authentication (2FA).
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-text">4. Monitor Credit Reports</h2>
        <p>
          If you disclosed your Social Security Number, file a fraud alert with the three major credit bureaus (Equifax, Experian, TransUnion) and consider freezing your credit files.
        </p>
      </section>
    </AcademyArticleLayout>
  );
}
