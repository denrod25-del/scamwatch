'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';

import ReportWizardStep from '@/components/ui/ReportWizardStep';
import type { SubmitState } from '@/shared/reports/types';
import { submitReportAction } from './actions';

const INITIAL: SubmitState = { ok: false };
const CHANNELS = ['sms', 'email', 'phone', 'web', 'social', 'mail', 'other'] as const;
const TOTAL = 3;

export default function ReportWizard(): React.JSX.Element {
  const [state, formAction, pending] = useActionState(submitReportAction, INITIAL);
  const [step, setStep] = useState(1);
  const [piiWarning, setPiiWarning] = useState(false);

  if (state.ok) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-6 text-text space-y-4">
          <div className="flex items-center gap-2 text-green-500">
            <span className="text-xl">✅</span>
            <h2 className="text-lg font-semibold font-display uppercase tracking-wider">Report Safely Received</h2>
          </div>
          <p className="text-xs text-text-muted">
            Thank you. Your report ID is <strong className="font-mono text-text">{state.reportId}</strong>. 
            All submitted content has been de-identified, and screenshot EXIF location tags have been stripped.
          </p>
          <div className="p-4 bg-background border border-border rounded-md text-xs space-y-2">
            <p className="font-bold uppercase text-text-subtle">Recommended Next Steps:</p>
            <ul className="list-disc pl-5 text-text-muted space-y-1">
              <li><strong>Forward SMS to 7726:</strong> Copy the scam text and send it to 7726 (SPAM) to alert your carrier.</li>
              <li><strong>File FTC Fraud Complaint:</strong> Submit the details at <a href="https://reportfraud.ftc.gov" target="_blank" rel="noreferrer" className="text-brand underline">reportfraud.ftc.gov</a>.</li>
              <li><strong>Report to FBI IC3:</strong> If you lost money, submit a complaint at <a href="https://www.ic3.gov" target="_blank" rel="noreferrer" className="text-brand underline">ic3.gov</a>.</li>
              <li><strong>Florida Attorney General:</strong> File a consumer complaint at <a href="https://myfloridalegal.com" target="_blank" rel="noreferrer" className="text-brand underline">myfloridalegal.com</a>.</li>
            </ul>
          </div>
        </div>
        <div className="flex gap-4">
          <Link
            href="/"
            className="rounded bg-brand px-4 py-2 text-xs font-bold text-brand-contrast hover:bg-brand/80"
          >
            Return to Command Center
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="rounded border border-border px-4 py-2 text-xs font-semibold text-text hover:bg-hover"
          >
            Submit Another Report
          </button>
        </div>
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
            onChange={(e) => {
              const text = e.target.value;
              const piiRegex = /(\b\d{3}-\d{2}-\d{4}\b)|(\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b)/;
              setPiiWarning(piiRegex.test(text));
            }}
            className="mt-1 w-full rounded-md border border-border-strong bg-surface px-3 py-2"
            placeholder="Whatever happened, it isn’t your fault. Share as much as you’re comfortable with."
          />
          {piiWarning && (
            <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500 rounded-md text-xs text-amber-500">
              <strong>PII Warning:</strong> We detected what looks like a Social Security Number or Credit Card. While our system de-identifies details automatically before storing, we recommend redacting sensitive numbers.
            </div>
          )}
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
          <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-md text-xs text-text-muted space-y-1">
            <p className="font-bold text-amber-500">⚠️ Sensitive Information Notice</p>
            <p>Please double-check that you have not included full Social Security Numbers (SSN), account passwords, or complete credit/debit card numbers in your narrative or screenshots.</p>
          </div>
          <p className="mt-3 text-xs text-text-subtle">
            🔒 <strong>Privacy Commitment:</strong> All uploads are processed securely. Screenshot EXIF/GPS tags are stripped automatically. We never sell personal information.
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
