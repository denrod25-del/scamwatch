export interface SearchBarProps {
  /** Form GET target. Defaults to the search results route. */
  action?: string;
  defaultValue?: string;
  autoFocus?: boolean;
  placeholder?: string;
}

/**
 * Universal lookup entry point (Vol 5 FR-5.1 / Vol 6 UX). Plain GET form so it
 * works without JS and the query is shareable in the URL.
 */
export default function SearchBar({
  action = '/search',
  defaultValue,
  autoFocus,
  placeholder = "Paste a link, phone number, email, or message…",
}: SearchBarProps): React.JSX.Element {
  return (
    <form
      method="get"
      action={action}
      role="search"
      className="flex w-full gap-2 rounded-md transition-shadow duration-base focus-within:shadow-glow"
    >
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
        placeholder={placeholder}
        className="flex-1 rounded-md border border-border-strong bg-surface-muted px-4 py-2.5 font-mono text-base text-text placeholder:font-sans placeholder:text-text-subtle"
      />
      <button
        type="submit"
        className="rounded-md bg-brand px-5 py-2.5 font-mono text-base font-semibold text-brand-contrast transition-shadow duration-fast hover:shadow-glow"
      >
        Check
      </button>
    </form>
  );
}
