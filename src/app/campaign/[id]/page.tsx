import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return { title: `Campaign ${id}` };
}

export default async function CampaignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.JSX.Element> {
  const { id } = await params;
  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Campaign {id}</h1>
      <p className="mt-3 text-text-muted">
        A correlated cluster of reports and scam indicators verified to share common threat vectors, infrastructure, or templates. Detailed campaign logs and intelligence updates are published here.
      </p>
    </article>
  );
}
