// process-report — async AI pipeline worker (PRD Vol 8 + Vol 13).
//
// In production this is driven by a pgmq queue (Vol 13), not called inline by the
// API. It runs the stages: OCR -> entity extraction -> threat classification ->
// campaign detection -> explanation. Every model output is CALIBRATED and may
// ABSTAIN; nothing is presented to users as fact, and PII is de-identified before
// any third-party AI call (Vol 14).
//
// This is a stub: it validates the payload and returns the stage plan.

import { corsHeaders } from '../_shared/cors.ts';

interface JobPayload {
  reportId: string;
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  let payload: JobPayload;
  try {
    payload = (await req.json()) as JobPayload;
  } catch {
    return json({ error: { code: 'bad_request', message: 'Invalid JSON body' } }, 400);
  }

  if (!payload?.reportId) {
    return json({ error: { code: 'bad_request', message: 'reportId is required' } }, 400);
  }

  // TODO(Vol 8): for each stage, persist results with model_version + confidence.
  const stages = [
    'ocr', // screenshots -> text (PII tagged/stripped)
    'entity_extraction', // -> entities (canonicalized, confidence-scored)
    'threat_classification', // -> verdict + calibrated confidence, may abstain
    'campaign_detection', // -> propose campaign links with confidence
    'explanation', // -> calibrated, source-linked "why we think this"
    'moderation_gate', // -> defamation/PII/abuse screen on input + output
  ];

  return json(
    {
      reportId: payload.reportId,
      status: 'accepted',
      note: 'Stub. Real orchestration runs via pgmq (Vol 13). No model output is presented as fact.',
      stages,
    },
    202,
  );
});

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
