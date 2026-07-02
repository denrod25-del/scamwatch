import type { Metadata } from 'next';
import React, { Suspense } from 'react';

import ReportWizard from './ReportWizard';

export const metadata: Metadata = {
  title: 'Report a scam',
  description: 'Share what happened. It helps protect others. Our wizard is trauma-aware.',
};

export default function ReportPage(): React.JSX.Element {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Report a scam</h1>
      <p className="mt-3 text-text">
        Whatever happened, it isn’t your fault — scammers are skilled and relentless. Sharing the
        details helps protect other people in your community. You can report anonymously, and we
        de-identify sensitive details before storing anything.
      </p>
      <div className="mt-6">
        <Suspense fallback={<div className="h-48 animate-pulse rounded-lg bg-surface-muted border border-border" />}>
          <ReportWizard />
        </Suspense>
      </div>
    </div>
  );
}
