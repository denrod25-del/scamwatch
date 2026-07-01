'use server';

import { revalidatePath } from 'next/cache';

import { requireStaff } from '@/shared/auth/session';
import { createAdminClient } from '@/infrastructure/supabase/admin';
import { publishReport, rejectReport } from '@/shared/moderation/moderate';

export async function approveAction(formData: FormData): Promise<void> {
  const user = await requireStaff();
  const reportId = String(formData.get('reportId') ?? '');
  if (reportId) {
    await publishReport(createAdminClient(), reportId, user.id);
  }
  revalidatePath('/moderation');
}

export async function rejectAction(formData: FormData): Promise<void> {
  const user = await requireStaff();
  const reportId = String(formData.get('reportId') ?? '');
  const reason = String(formData.get('reason') ?? '').trim();
  if (reportId) {
    await rejectReport(createAdminClient(), reportId, user.id, reason);
  }
  revalidatePath('/moderation');
}
