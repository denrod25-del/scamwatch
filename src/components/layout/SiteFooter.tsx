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
          <a href="/SECURITY.md" className="transition-colors duration-fast hover:text-brand">
            Security policy
          </a>
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
        <p className="mt-4 font-mono text-text-subtle">© 2026 ScamWatch · Know Before You Click.</p>
      </div>
    </footer>
  );
}
