import type { Metadata } from 'next';
import Link from 'next/link';

import SearchBar from '@/components/ui/SearchBar';
import VerdictCard from '@/components/ui/VerdictCard';
import VerificationCallout from '@/components/ui/VerificationCallout';
import EntityChip from '@/components/ui/EntityChip';
import { lookup } from '@/lib/search/lookup';

export const metadata: Metadata = {
  title: 'Search results',
  description: 'Calibrated assessment of a link, phone number, email, or message.',
};

function contextLine(reportCount: number, abstained: boolean): string {
  if (reportCount > 0) {
    const verb = reportCount === 1 ? 'report mentions' : 'reports mention';
    return `${reportCount} community ${verb} this.`;
  }
  if (abstained) {
    return 'We don’t have enough information to assess this yet. No one has reported it, and the automated check wasn’t confident enough to say. That doesn’t mean it’s safe.';
  }
  return 'No community reports yet. The read below is a calibrated estimate, not a guarantee.';
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}): Promise<React.JSX.Element> {
  const { q } = await searchParams;
  const query = (q ?? '').trim();
  const result = query ? await lookup(query) : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <SearchBar defaultValue={query} />

      {result ? (
        <div className="mt-8 space-y-6">
          <div className="flex flex-wrap items-center gap-2 text-sm text-text-muted">
            <span>Checked:</span>
            {result.entityType === 'text' ? (
              <span className="text-text">“{result.query}”</span>
            ) : (
              <EntityChip type={result.entityType} value={result.query} />
            )}
          </div>

          <VerdictCard
            verdict={result.verdict}
            confidence={result.confidence}
            subject={result.query}
          >
            {contextLine(result.reportCount, result.abstained)}
          </VerdictCard>

          {result.relatedThreats.length > 0 && (
            <section className="rounded-lg border border-border bg-surface p-5">
              <h2 className="text-base font-semibold text-text">Related scam patterns</h2>
              <ul className="mt-2 space-y-1 text-sm">
                {result.relatedThreats.map((threat) => (
                  <li key={threat.slug}>
                    <Link className="text-brand underline" href={`/threat/${threat.slug}`}>
                      {threat.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

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
