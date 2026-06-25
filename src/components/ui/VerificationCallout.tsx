export interface VerificationCalloutProps {
  orgs?: { name: string; href: string }[];
}

const DEFAULT_ORGS = [
  { name: 'FTC — ReportFraud', href: 'https://reportfraud.ftc.gov' },
  { name: 'FBI IC3', href: 'https://www.ic3.gov' },
  { name: 'CFPB', href: 'https://www.consumerfinance.gov/complaint/' },
] as const;

/**
 * Routes users to official organizations to confirm/report (Principle 7).
 * Always present near any verdict — ScamWatch never replaces official verification.
 */
export default function VerificationCallout({
  orgs = [...DEFAULT_ORGS],
}: VerificationCalloutProps): React.JSX.Element {
  return (
    <aside className="rounded-lg border border-border bg-surface p-5">
      <h2 className="text-base font-semibold text-text">Verify with an official source</h2>
      <ul className="mt-2 space-y-1 text-sm">
        {orgs.map((org) => (
          <li key={org.href}>
            <a className="text-brand underline" href={org.href} rel="noopener noreferrer">
              {org.name}
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-sm text-text-subtle">
        ScamWatch is consumer protection, not legal advice.
      </p>
    </aside>
  );
}
