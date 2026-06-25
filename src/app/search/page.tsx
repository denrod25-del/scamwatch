import type { Metadata } from 'next';

import SearchBar from '@/components/ui/SearchBar';
import VerdictCard from '@/components/ui/VerdictCard';
import VerificationCallout from '@/components/ui/VerificationCallout';

export const metadata: Metadata = {
  title: 'Search results',
  description: 'Calibrated assessment of a link, phone number, email, or message.',
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}): Promise<React.JSX.Element> {
  const { q } = await searchParams;
  const query = (q ?? '').trim();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <SearchBar defaultValue={query} />

      {query ? (
        <div className="mt-8 space-y-6">
          <h1 className="text-xl font-semibold">
            Results for <span className="font-mono">{query}</span>
          </h1>
          {/* Placeholder — wired to the AI engine (Vol 8) + DB (Vol 10) later. */}
          <VerdictCard verdict="No Signal" confidence={0} subject={query}>
            We don’t have enough information about this yet. That doesn’t mean it’s safe — it just
            means no one has reported it.
          </VerdictCard>
          <VerificationCallout />
        </div>
      ) : (
        <p className="mt-8 text-text-muted">
          Enter a link, phone number, email, or message to check it.
        </p>
      )}
    </div>
  );
}
