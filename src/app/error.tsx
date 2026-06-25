'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
}): React.JSX.Element {
  useEffect(() => {
    // Surfacing to the console keeps the placeholder honest until Vol 14 wiring.
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-prose px-4 py-12">
      <div className="rounded-lg border border-caution-border bg-caution-bg p-6 text-caution-fg">
        <h1 className="text-xl font-semibold">Something went wrong on our end.</h1>
        <p className="mt-2 text-text-muted">
          This is not your fault. You can try again, and nothing you entered was shared.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-4 rounded-md bg-brand px-4 py-2 text-brand-contrast transition-colors duration-fast"
        >
          Try again
        </button>
        <p className="mt-4 text-sm text-text-subtle">
          If it keeps happening, verify with official organizations. This is consumer protection,
          not legal advice.
        </p>
      </div>
    </div>
  );
}
