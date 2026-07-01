import { NextResponse } from 'next/server';
import { z } from 'zod';

import { lookup } from '@/shared/search/lookup';
import { generateExplanation } from '@/shared/search/explain';
import { generateRecommendations } from '@/shared/search/recommend';
import { extractEntitiesHybrid } from '@/shared/entities/extractEntitiesHybrid';
import type { Verdict } from '@/types';

const checkRequestSchema = z
  .object({
    text: z.string().max(51200),
    type: z.enum(['text', 'email', 'image', 'url', 'phone', 'metadata']),
    submitter_context: z
      .object({
        did_lose_money: z.boolean(),
        did_share_pii: z.boolean(),
      })
      .strict(),
  })
  .strict();

function getConfidenceBand(verdict: Verdict): 'Low' | 'Moderate' | 'High' {
  if (verdict === 'Likely Safe' || verdict === 'No Signal') return 'Low';
  if (verdict === 'Use Caution') return 'Moderate';
  return 'High';
}

/**
 * POST /api/v1/search/check — Vol 11 / PRD-301.9.
 * Validates check payload, runs the real-time lookup/classification,
 * and formats the citation-mapped explanations and recovery checklists.
 */
export async function POST(request: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: 'invalid_json', message: 'Request body must be valid JSON.' } },
      { status: 400, headers: { 'X-API-Version': 'v1' } }
    );
  }

  const parseResult = checkRequestSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      {
        error: {
          code: 'validation_failed',
          message: 'Validation failed.',
          details: parseResult.error.format(),
        },
      },
      { status: 422, headers: { 'X-API-Version': 'v1' } }
    );
  }
  const { text, type, submitter_context } = parseResult.data;

  try {
    const hybridEntities = await extractEntitiesHybrid(text);
    const firstEntity = hybridEntities[0];
    const lookupQuery = firstEntity ? firstEntity.canonical_value : text;
    const result = await lookup(lookupQuery);

    const explanation = generateExplanation(
      result.verdict,
      result.query,
      result.entityType,
      result.abstained
    );
    const recommendations = generateRecommendations(
      result.verdict,
      result.entityType,
      submitter_context
    );

    const entities = hybridEntities.map((e) => ({
      id: crypto.randomUUID(),
      type: e.type === 'date' || e.type === 'case_number' ? 'brand' as const : e.type, // Map custom spec types back to DB compatible types for payload
      canonical_value: e.canonical_value,
      raw_value: e.raw_value,
    }));

    return NextResponse.json(
      {
        data: {
          verdict: result.verdict,
          confidence_band: getConfidenceBand(result.verdict),
          entities,
          explanation: {
            text: explanation.text,
            citations: explanation.citations,
          },
          recommendations: {
            understand: recommendations.understand,
            verify: recommendations.verify,
            protect: recommendations.protect,
          },
        },
      },
      { status: 200, headers: { 'X-API-Version': 'v1' } }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: 'check_failed',
          message: 'An error occurred while processing the check request.',
        },
      },
      { status: 500, headers: { 'X-API-Version': 'v1' } }
    );
  }
}
