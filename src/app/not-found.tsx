import type { Metadata } from 'next';

import SearchBar from '@/components/ui/SearchBar';

export const metadata: Metadata = { title: 'Page not found' };

export default function NotFound(): React.JSX.Element {
  return (
    <div className="mx-auto max-w-prose px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold">We couldn’t find that page</h1>
      <p className="mt-2 text-text-muted">Try checking a link, number, or message instead.</p>
      <div className="mt-6">
        <SearchBar />
      </div>
    </div>
  );
}
