import Link from 'next/link';

const NAV = [
  { href: '/search', label: 'Search' },
  { href: '/report', label: 'Report' },
  { href: '/academy', label: 'Academy' },
  { href: '/transparency', label: 'Transparency' },
  { href: '/alerts', label: 'Alerts' },
] as const;

function ShieldIcon({ className }: { className?: string }): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

export default function SiteHeader(): React.JSX.Element {
  return (
    <header className="header-bar sticky top-0 z-40">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-md border border-border px-2.5 py-1.5"
        >
          <ShieldIcon className="h-5 w-5 text-brand" />
          <span className="font-display text-base font-bold tracking-tight text-text">
            ScamWatch
          </span>
        </Link>

        <nav aria-label="Primary" className="flex items-center gap-1 sm:gap-2">
          <ul className="hidden items-center gap-1 font-mono text-sm md:flex">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="rounded-md px-2.5 py-1.5 text-text-muted transition-colors duration-fast hover:text-brand"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/login"
            className="hidden px-2.5 py-1.5 font-mono text-sm text-text-muted transition-colors duration-fast hover:text-brand sm:inline"
          >
            Sign in
          </Link>
          <Link
            href="/report"
            className="btn-primary rounded-md px-3.5 py-1.5 font-mono text-sm font-semibold"
          >
            Report a scam
          </Link>
        </nav>
      </div>
    </header>
  );
}
