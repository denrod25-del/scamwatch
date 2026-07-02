import Link from 'next/link';

export default function SiteFooter(): React.JSX.Element {
  return (
    <footer className="mt-16 border-t border-border bg-surface-muted">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-text-muted">
        <p className="eyebrow">&#47;&#47; consumer scam intelligence</p>
        <nav aria-label="Footer" className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
          <Link href="/academy" className="transition-colors duration-fast hover:text-brand">
            Academy
          </Link>
          <Link href="/transparency" className="transition-colors duration-fast hover:text-brand">
            Transparency reports
          </Link>
          <Link href="/security" className="transition-colors duration-fast hover:text-brand">
            Security policy
          </Link>
          <Link href="/privacy" className="transition-colors duration-fast hover:text-brand">
            Privacy policy
          </Link>
          <Link href="/terms" className="transition-colors duration-fast hover:text-brand">
            Terms of use
          </Link>
          <Link href="/methodology" className="transition-colors duration-fast hover:text-brand">
            Methodology
          </Link>
          <Link href="/changelog" className="transition-colors duration-fast hover:text-brand">
            Changelog
          </Link>
        </nav>
        <p className="mt-4 max-w-prose">
          If you think you have been targeted, verify with official organizations such as the{' '}
          <a className="text-brand underline" href="https://reportfraud.ftc.gov">
            FTC
          </a>
          ,{' '}
          <a className="text-brand underline" href="https://www.ic3.gov">
            FBI IC3
          </a>
          , or your state Attorney General. ScamWatch is consumer protection, not legal advice.
        </p>
        <p className="mt-2 text-[10px] text-text-subtle leading-relaxed max-w-prose">
          Disclaimer: ScamWatch is not affiliated with SunPass, Duke Energy, FTC, FBI, IC3, the Florida Attorney General, UPS, FedEx, USPS, or any government agency or utility company mentioned. Always verify through official websites or phone numbers from your bill, card, statement, or agency website.
        </p>
        <p className="mt-4 font-mono text-text-subtle">© 2026 ScamWatch · Know Before You Click.</p>
      </div>
    </footer>
  );
}
