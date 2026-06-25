export interface ExplanationPanelProps {
  summary: string;
  reasons?: string[];
  sources?: { label: string; href: string }[];
}

/**
 * The explainability surface (Vol 8 explainability contract). Calm, calibrated,
 * source-linked. Reasons are evidence, not accusations.
 */
export default function ExplanationPanel({
  summary,
  reasons = [],
  sources = [],
}: ExplanationPanelProps): React.JSX.Element {
  return (
    <section className="border-info-fg/20 rounded-lg border bg-info-bg p-5 text-info-fg">
      <h2 className="text-base font-semibold">Why we think this</h2>
      <p className="mt-2 text-text">{summary}</p>

      {reasons.length > 0 && (
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-text">
          {reasons.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
      )}

      {sources.length > 0 && (
        <p className="mt-3 text-sm">
          Sources:{' '}
          {sources.map((s, i) => (
            <span key={s.href}>
              {i > 0 ? ', ' : ''}
              <a className="text-brand underline" href={s.href}>
                {s.label}
              </a>
            </span>
          ))}
        </p>
      )}
    </section>
  );
}
