import type { Metadata } from 'next';

import type { EntityType } from '@/types';
import EntityChip from '@/components/ui/EntityChip';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string; value: string }>;
}): Promise<Metadata> {
  const { type, value } = await params;
  return { title: `${type}: ${decodeURIComponent(value)}` };
}

export default async function EntityPage({
  params,
}: {
  params: Promise<{ type: string; value: string }>;
}): Promise<React.JSX.Element> {
  const { type, value } = await params;
  const decoded = decodeURIComponent(value);
  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-xl font-semibold">Entity</h1>
      <div className="mt-3">
        <EntityChip type={type as EntityType} value={decoded} />
      </div>
      <p className="mt-4 text-text-muted">
        Verified reports, related threat campaigns, and calibrated intelligence checks associated with this specific indicator.
      </p>
    </article>
  );
}
