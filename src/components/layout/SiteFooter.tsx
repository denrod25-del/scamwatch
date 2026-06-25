import Link from 'next/link';

export default function SiteFooter(): React.JSX.Element {
  return (
    <footer className="mt-16 border-t border-border bg-surface-muted">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-text-muted">
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
          <Link href="/academy" className="hover:text-text">
            Academy
          </Link>
          <Link href="/transparency" className="hover:text-text">
            Transparency reports
          </Link>
          <a href="/SECURITY.md" className="hover:text-text">
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
        <p className="mt-4 text-text-subtle">© 2026 ScamWatch · Know Before You Click.</p>
      </div>
    </footer>
  );
}
