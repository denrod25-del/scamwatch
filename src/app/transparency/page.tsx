import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Transparency',
  description: 'How ScamWatch works, what we publish, and how we measure ourselves.',
};

export default function TransparencyPage(): React.JSX.Element {
  return (
    <article className="mx-auto max-w-prose px-4 py-10">
      <h1 className="text-2xl font-semibold">Transparency reports</h1>
      <p className="mt-3 text-text">
        Being transparent is a principle, not a marketing line (Principle 5). We publish our
        moderation methodology, takedown/appeal outcomes, classification accuracy and calibration,
        and the metrics behind our North Star (Vol 18). Reports are published on a regular cadence
        (Vol 16).
      </p>
    </article>
  );
}
