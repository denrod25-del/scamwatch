import Link from 'next/link';

const NAV = [
  { href: '/search', label: 'Search' },
  { href: '/report', label: 'Report' },
  { href: '/academy', label: 'Academy' },
  { href: '/transparency', label: 'Transparency' },
  { href: '/alerts', label: 'Alerts' },
] as const;

export default function SiteHeader(): React.JSX.Element {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="text-lg font-bold text-brand">
          ScamWatch
        </Link>
        <nav aria-label="Primary" className="flex items-center gap-4">
          <ul className="flex items-center gap-4 text-sm">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-text-muted hover:text-text">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/login"
            className="rounded-md bg-brand px-3 py-1.5 text-sm text-brand-contrast"
          >
            Sign in
          </Link>
        </nav>
      </div>
    </header>
  );
}
