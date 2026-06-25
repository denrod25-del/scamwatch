export interface SearchBarProps {
  /** Form GET target. Defaults to the search results route. */
  action?: string;
  defaultValue?: string;
  autoFocus?: boolean;
}

/**
 * Universal lookup entry point (Vol 5 FR-5.1 / Vol 6 UX). Plain GET form so it
 * works without JS and the query is shareable in the URL.
 */
export default function SearchBar({
  action = '/search',
  defaultValue,
  autoFocus,
}: SearchBarProps): React.JSX.Element {
  return (
    <form method="get" action={action} role="search" className="flex w-full gap-2">
      <label htmlFor="q" className="sr-only">
        Search a link, phone number, email, or message
      </label>
      <input
        id="q"
        name="q"
        type="search"
        inputMode="search"
        defaultValue={defaultValue}
        autoFocus={autoFocus}
        placeholder="Paste a link, phone number, email, or message…"
        className="flex-1 rounded-md border border-border-strong bg-surface px-4 py-2 text-base text-text placeholder:text-text-subtle"
      />
      <button type="submit" className="rounded-md bg-brand px-4 py-2 text-base text-brand-contrast">
        Check
      </button>
    </form>
  );
}
