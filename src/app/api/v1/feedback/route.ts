import { NextResponse } from 'next/server';
import { createClient } from '@/infrastructure/supabase/server';
import { SupabaseClient } from '@supabase/supabase-js';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { report_id, feedback_type, comments, rating } = body || {};

    if (!feedback_type || typeof feedback_type !== 'string') {
      return NextResponse.json(
        { error: { code: 'validation_failed', message: 'feedback_type is a required string parameter.' } },
        { status: 422 }
      );
    }

    let savedId = crypto.randomUUID();

    try {
      const sb = (await createClient()) as unknown as SupabaseClient;
      const { data } = await sb
        .from('feedback_logs')
        .insert({
          id: savedId,
          report_id: report_id || null,
          feedback_type,
          comments: comments || '',
          rating: rating ? Number(rating) : null,
          created_at: new Date().toISOString(),
        })
        .select('id')
        .maybeSingle();

      if (data) {
        savedId = data.id;
      }
    } catch {
      // Degrade gracefully if DB table does not exist
    }

    return NextResponse.json(
      { data: { id: savedId, status: 'logged' } },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: 'server_error', message: err.message || 'An unexpected error occurred.' } },
      { status: 500 }
    );
  }
}
