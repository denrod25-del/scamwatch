'use client';

import { useActionState, useState } from 'react';

import ReportWizardStep from '@/components/ui/ReportWizardStep';
import VerificationCallout from '@/components/ui/VerificationCallout';
import type { SubmitState } from '@/lib/reports/types';
import { submitReportAction } from './actions';

const INITIAL: SubmitState = { ok: false };
const CHANNELS = ['sms', 'email', 'phone', 'web', 'social', 'mail', 'other'] as const;
const TOTAL = 3;

export default function ReportWizard(): React.JSX.Element {
  const [state, formAction, pending] = useActionState(submitReportAction, INITIAL);
  const [step, setStep] = useState(1);

  if (state.ok) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-safe-border bg-safe-bg p-6 text-safe-fg">
          <h2 className="text-lg font-semibold">Thank you — your report was received.</h2>
          <p className="mt-2 text-text">
            Reference: <span className="font-mono">{state.reportId}</span>. You’ve helped protect
            other people in your community.
          </p>
        </div>
        <VerificationCallout />
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {/* All fields stay mounted (hidden, not unmounted) so values persist into FormData. */}
      <div hidden={step !== 1}>
        <ReportWizardStep
          stepIndex={1}
          totalSteps={TOTAL}
          title="What happened?"
          onNext={() => setStep(2)}
        >
          <label htmlFor="channel" className="block text-sm font-medium">
            How did they reach you?
          </label>
          <select
            id="channel"
            name="channel"
            defaultValue="sms"
            className="mt-1 w-full rounded-md border border-border-strong bg-surface px-3 py-2"
          >
            {CHANNELS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <label htmlFor="narrative" className="mt-4 block text-sm font-medium">
            In your words, what happened?
          </label>
          <textarea
            id="narrative"
            name="narrative"
            rows={5}
            className="mt-1 w-full rounded-md border border-border-strong bg-surface px-3 py-2"
            placeholder="Whatever happened, it isn’t your fault. Share as much as you’re comfortable with."
          />
          <p className="mt-2 text-sm text-text-subtle">
            Sensitive numbers like Social Security or card numbers are removed automatically before
            anything is stored.
          </p>
        </ReportWizardStep>
      </div>

      <div hidden={step !== 2}>
        <ReportWizardStep
          stepIndex={2}
          totalSteps={TOTAL}
          title="Evidence"
          onBack={() => setStep(1)}
          onNext={() => setStep(3)}
        >
          <label htmlFor="indicators" className="block text-sm font-medium">
            Scam phone numbers, links, or emails (one per line)
          </label>
          <textarea
            id="indicators"
            name="indicators"
            rows={3}
            className="mt-1 w-full rounded-md border border-border-strong bg-surface px-3 py-2 font-mono"
            placeholder={'+1 555 555 0142\npaypa1-secure.com'}
          />

          <label htmlFor="screenshot" className="mt-4 block text-sm font-medium">
            Screenshot (optional)
          </label>
          <input
            id="screenshot"
            name="screenshot"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="mt-1 block w-full text-sm"
          />
          <p className="mt-2 text-sm text-text-subtle">
            Stored privately. Image metadata is stripped during processing.
          </p>
        </ReportWizardStep>
      </div>

      <div hidden={step !== 3}>
        <section
          aria-labelledby="review-title"
          className="rounded-lg border border-border bg-surface p-6"
        >
          <p className="text-sm text-text-subtle">Step 3 of {TOTAL}</p>
          <h2 id="review-title" className="mt-1 text-xl font-semibold text-text">
            Review &amp; submit
          </h2>
          <p className="mt-3 text-text">
            When you submit, we de-identify the details, look for known scam patterns, and point you
            to the official organizations that can act on it.
          </p>
          {state.error ? (
            <p role="alert" className="mt-3 text-danger-fg">
              {state.error}
            </p>
          ) : null}
          <div className="mt-6 flex justify-between">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="rounded-md border border-border-strong px-4 py-2 text-sm text-text"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={pending}
              className="rounded-md bg-brand px-4 py-2 text-sm text-brand-contrast disabled:opacity-50"
            >
              {pending ? 'Submitting…' : 'Submit report'}
            </button>
          </div>
        </section>
      </div>
    </form>
  );
}
