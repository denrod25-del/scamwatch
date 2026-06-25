'use server';

import { headers } from 'next/headers';

import { createAdminClient } from '@/lib/supabase/admin';
import { submitReport } from '@/lib/reports/submit';
import { clientIp, enforceRateLimit, RateLimitError } from '@/lib/reports/rateLimit';
import type { SubmitState } from '@/lib/reports/types';

const BUCKET = 'report-media';

function sanitize(name: string): string {
  return name.replace(/[^\w.-]/g, '_').slice(-80) || 'upload';
}

/**
 * Server action behind the report wizard. Anonymous: writes run with the service
 * role here (not a direct client insert), which is why RLS can stay write-locked
 * for anon/authenticated. Uploads go to the private evidence bucket.
 */
export async function submitReportAction(
  prevState: SubmitState,
  formData: FormData,
): Promise<SubmitState> {
  void prevState;

  const channel = String(formData.get('channel') ?? 'other');
  const narrative = String(formData.get('narrative') ?? '').trim();
  const indicators = String(formData.get('indicators') ?? '')
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (!narrative) {
    return { ok: false, error: 'Please describe what happened before submitting.' };
  }

  try {
    const admin = createAdminClient();

    const h = await headers();
    const ip = clientIp(h.get('x-forwarded-for'), h.get('x-real-ip'));
    await enforceRateLimit(admin, `report:${ip}`);

    const mediaPaths: string[] = [];
    const files = formData
      .getAll('screenshot')
      .filter((f): f is File => f instanceof File && f.size > 0);
    for (const file of files) {
      const path = `reports/${crypto.randomUUID()}-${sanitize(file.name)}`;
      const { error } = await admin.storage.from(BUCKET).upload(path, file, {
        contentType: file.type || 'application/octet-stream',
        upsert: false,
      });
      if (error) throw error;
      mediaPaths.push(path);
    }

    const report = await submitReport(
      { channel, narrative, indicators, reporterId: null, mediaPaths },
      { getClient: async () => admin },
    );
    return { ok: true, reportId: report.id };
  } catch (e) {
    if (e instanceof RateLimitError) {
      return {
        ok: false,
        error:
          'You’ve submitted several reports recently. Please wait a few minutes and try again.',
      };
    }
    return { ok: false, error: 'Something went wrong submitting your report. Please try again.' };
  }
}
