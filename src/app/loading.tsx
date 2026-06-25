export default function Loading(): React.JSX.Element {
  return (
    <div className="mx-auto max-w-prose px-4 py-12" role="status" aria-label="Loading">
      <div className="h-8 w-2/3 animate-pulse rounded-md bg-surface-muted" />
      <div className="mt-4 h-4 w-full animate-pulse rounded-sm bg-surface-muted" />
      <div className="mt-2 h-4 w-5/6 animate-pulse rounded-sm bg-surface-muted" />
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="h-24 animate-pulse rounded-lg bg-surface-muted" />
        <div className="h-24 animate-pulse rounded-lg bg-surface-muted" />
        <div className="h-24 animate-pulse rounded-lg bg-surface-muted" />
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
