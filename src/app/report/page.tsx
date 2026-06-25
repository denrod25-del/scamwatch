import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Report a scam',
  description: 'Share what happened. It helps protect others. Our wizard is trauma-aware.',
};

export default function ReportPage(): React.JSX.Element {
  return (
    <div className="mx-auto max-w-prose px-4 py-10">
      <h1 className="text-2xl font-semibold">Report a scam</h1>
      <p className="mt-3 text-text">
        Whatever happened, it isn’t your fault — scammers are skilled and relentless. Sharing the
        details helps protect other people in your community.
      </p>
      <ul className="mt-4 list-disc space-y-1 pl-5 text-text-muted">
        <li>You can report anonymously.</li>
        <li>Screenshots are de-identified before they’re stored.</li>
        <li>We’ll point you to the official organizations that can act on it.</li>
      </ul>
      <p className="mt-6 text-sm text-text-subtle">
        The multi-step wizard (Vol 5 FR-5.2) mounts here. This is consumer protection, not legal
        advice.
      </p>
    </div>
  );
}
