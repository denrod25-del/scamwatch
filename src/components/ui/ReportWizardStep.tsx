'use client';

import type { ReactNode } from 'react';

export interface ReportWizardStepProps {
  stepIndex: number;
  totalSteps: number;
  title: string;
  children: ReactNode;
  onNext?: () => void;
  onBack?: () => void;
}

/**
 * One step of the trauma-aware report wizard (Vol 5 FR-5.2 / Vol 6). No-blame copy;
 * the surrounding flow de-identifies screenshots before storage (Vol 8/14).
 */
export default function ReportWizardStep({
  stepIndex,
  totalSteps,
  title,
  children,
  onNext,
  onBack,
}: ReportWizardStepProps): React.JSX.Element {
  return (
    <section
      aria-labelledby="wizard-step-title"
      className="rounded-lg border border-border bg-surface p-6"
    >
      <p className="text-sm text-text-subtle" aria-live="polite">
        Step {stepIndex} of {totalSteps}
      </p>
      <h2 id="wizard-step-title" className="mt-1 text-xl font-semibold text-text">
        {title}
      </h2>

      <div className="mt-4">{children}</div>

      <div className="mt-6 flex justify-between">
        <button
          type="button"
          onClick={onBack}
          disabled={!onBack}
          className="rounded-md border border-border-strong px-4 py-2 text-sm text-text disabled:opacity-50"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          className="rounded-md bg-brand px-4 py-2 text-sm text-brand-contrast"
        >
          {stepIndex === totalSteps ? 'Submit' : 'Continue'}
        </button>
      </div>
    </section>
  );
}
