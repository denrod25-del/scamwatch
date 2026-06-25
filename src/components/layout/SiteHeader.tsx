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
        <Link href="/" className="flex items-center gap-2">
          <ShieldIcon className="h-6 w-6 text-brand drop-shadow-[0_0_10px_rgba(34,211,238,0.65)]" />
          <span className="font-display text-lg font-bold tracking-tight text-text">
            Scam<span className="text-glow text-brand">Watch</span>
          </span>
        </Link>
        <nav aria-label="Primary" className="flex items-center gap-1 sm:gap-2">
          <ul className="hidden items-center gap-1 text-sm sm:flex">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="rounded-md px-2.5 py-1.5 text-text-muted transition-colors duration-fast hover:bg-surface hover:text-brand"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/login"
            className="chip-neon rounded-md px-3 py-1.5 font-mono text-sm font-medium"
          >
            Sign in
          </Link>
        </nav>
      </div>
    </header>
  );
}
