import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return { title: `Threat: ${slug}` };
}

export default async function ThreatPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<React.JSX.Element> {
  const { slug } = await params;
  return (
    <article className="mx-auto max-w-prose px-4 py-10">
      <h1 className="text-2xl font-semibold">Threat: {slug}</h1>
      <p className="mt-3 text-text-muted">
        How this scam works, what to watch for, and how to verify — explained before any warning.
        (Placeholder; content from Vol 5 FR-5.3 + Academy.)
      </p>
    </article>
  );
}
