import { NextResponse } from 'next/server';
import { createClient } from '@/infrastructure/supabase/server';
import { SupabaseClient } from '@supabase/supabase-js';

export async function GET(): Promise<NextResponse> {
  const start = Date.now();
  let dbStatus = 'healthy';
  let errorMsg = null;

  try {
    const sb = (await createClient()) as unknown as SupabaseClient;
    // Fast ping query
    const { error } = await sb.from('reports').select('id').limit(1);
    if (error) {
      dbStatus = 'degraded';
      errorMsg = error.message;
    }
  } catch (err: any) {
    dbStatus = 'unreachable';
    errorMsg = err.message || 'unknown error';
  }

  const duration = Date.now() - start;

  return NextResponse.json(
    {
      status: dbStatus === 'healthy' ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      latencyMs: duration,
      checks: {
        database: {
          status: dbStatus,
          error: errorMsg,
        },
      },
    },
    {
      status: dbStatus === 'healthy' ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    }
  );
}
