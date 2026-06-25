import { confidenceToBand } from '@/types';

export interface ConfidenceMeterProps {
  /** Calibrated confidence in [0,1]. */
  value: number;
  label?: string;
}

/**
 * Presents calibrated confidence as a labeled band — never a raw percentage with
 * false precision (Vol 6/7). Uses native <meter> for built-in semantics.
 */
export default function ConfidenceMeter({
  value,
  label = 'Confidence',
}: ConfidenceMeterProps): React.JSX.Element {
  const clamped = Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0));
  const band = confidenceToBand(clamped);
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-text-muted">{label}:</span>
      <meter
        min={0}
        max={1}
        value={clamped}
        low={0.4}
        high={0.75}
        optimum={0}
        aria-label={`${label}: ${band}`}
        className="h-2 w-24"
      />
      <span className="font-medium capitalize text-text">{band}</span>
    </div>
  );
}
