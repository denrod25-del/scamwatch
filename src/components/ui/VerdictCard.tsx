import type { ReactNode } from 'react';

import type { Verdict } from '@/types';
import { cn } from '@/lib/utils';
import ConfidenceMeter from './ConfidenceMeter';

export interface VerdictCardProps {
  verdict: Verdict;
  /** Calibrated confidence in [0,1]. */
  confidence: number;
  /** What was checked (URL, number, message subject). */
  subject: string;
  /** Explanation/context — rendered BEFORE the verdict badge (explain-before-warning). */
  children?: ReactNode;
}

/** Verdict → status token family. Never color alone — always a text label (DS-7). */
const TONE: Record<Verdict, string> = {
  'Likely Safe': 'border-safe-border bg-safe-bg text-safe-fg',
  'No Signal': 'border-border bg-surface-muted text-text-muted',
  'Use Caution': 'border-caution-border bg-caution-bg text-caution-fg',
  'Likely Scam': 'border-danger-border bg-danger-bg text-danger-fg',
  'Confirmed Reported Scam': 'border-danger-border bg-danger-bg text-danger-fg',
};

export default function VerdictCard({
  verdict,
  confidence,
  subject,
  children,
}: VerdictCardProps): React.JSX.Element {
  return (
    <section
      aria-label={`Assessment for ${subject}`}
      className="rounded-lg border border-border bg-surface p-6"
    >
      {/* Explanation/context first (DS-7.1.1). */}
      {children ? <div className="mb-4 text-text">{children}</div> : null}

      <div className="flex flex-wrap items-center gap-3">
        <span
          className={cn(
            'inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold',
            TONE[verdict],
          )}
        >
          {verdict}
        </span>
        <ConfidenceMeter value={confidence} />
      </div>

      <p className="mt-3 text-sm text-text-subtle">
        This is a calibrated read, not a guarantee. Verify with official organizations before you
        act.
      </p>
    </section>
  );
}
