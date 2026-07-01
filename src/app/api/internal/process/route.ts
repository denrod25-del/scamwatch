import { NextResponse } from 'next/server';

import { createAdminClient } from '@/infrastructure/supabase/admin';
import { processPendingReports } from '@/shared/reports/processReport';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Internal worker endpoint (Vol 8/13). Drains pending reports through the pipeline.
 * Triggered by Vercel Cron (GET with `Authorization: Bearer $CRON_SECRET`) or any
 * scheduler/queue that presents the secret. Fails closed: no secret configured →
 * always 401, so it is never publicly invocable.
 */
async function handle(request: Request): Promise<NextResponse> {
  const secret = process.env['CRON_SECRET'];
  const auth = request.headers.get('authorization');
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json(
      { error: { code: 'unauthorized', message: 'Invalid or missing cron secret.' } },
      { status: 401 },
    );
  }

  try {
    const admin = createAdminClient();
    const results = await processPendingReports(admin, 20);
    return NextResponse.json({
      data: {
        processed: results.length,
        results: results.map((r) => ({
          reportId: r.reportId,
          status: r.status,
          entitiesAdded: r.entitiesAdded,
          mediaProcessed: r.mediaProcessed,
        })),
      },
    });
  } catch {
    return NextResponse.json(
      { error: { code: 'process_failed', message: 'Processing failed.' } },
      { status: 500 },
    );
  }
}

export const GET = handle;
export const POST = handle;
