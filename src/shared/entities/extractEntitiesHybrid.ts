import { getOpenAI, MODELS } from '@/infrastructure/ai/client';
import { canonicalizeEntity } from './canonicalize';
import { extractEntities } from './extractEntities';
import type { EntityType } from '@/types';

export interface ExtractedEntity {
  type: EntityType | 'date' | 'case_number';
  raw_value: string;
  canonical_value: string;
  confidence: number;
  source: 'rule' | 'llm' | 'both';
  evidence_span?: string;
  degraded?: boolean;
}

const LLM_SYSTEM_PROMPT = [
  'You extract structured fraud-infrastructure entities from the text.',
  'Output ONLY JSON matching the requested schema.',
  'Every entity needs type, raw_value, evidence_span, and normalized_hint.',
  'If evidence is weak or absent, return an empty array.',
].join(' ');

const LLM_JSON_SCHEMA = {
  type: 'object',
  properties: {
    entities: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: [
              'url',
              'domain',
              'email',
              'phone',
              'organization',
              'date',
              'payment_handle',
              'case_number',
            ],
          },
          raw_value: { type: 'string' },
          evidence_span: { type: 'string' },
          normalized_hint: { type: 'string' },
        },
        required: ['type', 'raw_value', 'evidence_span'],
        additionalProperties: false,
      },
    },
  },
  required: ['entities'],
  additionalProperties: false,
};

/**
 * Maps the LLM's extracted types to the database-compatible EntityType enum.
 */
function mapLlmType(type: string, rawValue: string): EntityType | 'date' | 'case_number' {
  switch (type) {
    case 'phone':
      return 'phone';
    case 'url':
      return 'url';
    case 'domain':
      return 'domain';
    case 'email':
      return 'email';
    case 'organization':
      return 'brand';
    case 'date':
      return 'date';
    case 'case_number':
      return 'case_number';
    case 'payment_handle':
      if (rawValue.startsWith('0x') || /^[13bc1]/.test(rawValue)) return 'wallet';
      return 'handle';
    default:
      return 'brand';
  }
}

/**
 * Verifies that the evidence span exists verbatim in the source text
 * (case-insensitive, whitespace-normalized).
 */
function verifyEvidenceSpan(text: string, span: string): boolean {
  const normText = text.toLowerCase().replace(/\s+/g, ' ');
  const normSpan = span.toLowerCase().replace(/\s+/g, ' ');
  return normText.includes(normSpan);
}

/**
 * Hybrid Entity Extraction pipeline (PRD-301.2).
 * Runs deterministic regex rules first, calls schema-constrained LLM extractor
 * (if OPENAI_API_KEY is present), verifies evidence spans, and reconciles results.
 */
export async function extractEntitiesHybrid(
  text: string,
  deps: {
    getApiKey?: () => string | undefined;
    skipLlm?: boolean;
  } = {}
): Promise<ExtractedEntity[]> {
  const t = text.trim();
  if (!t) return [];

  // 1) Run deterministic regex rules first
  const ruleEntities = extractEntities(t);
  const reconciled = new Map<string, ExtractedEntity>();

  // Initialize rules in map
  for (const re of ruleEntities) {
    const key = `${re.type}:${re.value}`;
    reconciled.set(key, {
      type: re.type,
      raw_value: re.value, // for rules, raw is same as canon
      canonical_value: re.value,
      confidence: 0.95,
      source: 'rule',
    });
  }

  // Check API Key
  const getApiKey = deps.getApiKey ?? (() => process.env['OPENAI_API_KEY']);
  const apiKey = getApiKey();
  const skipLlm = deps.skipLlm || !apiKey;

  if (skipLlm) {
    // Degrade gracefully to rules-only
    return [...reconciled.values()].map((e) => ({ ...e, degraded: true }));
  }

  try {
    const client = getOpenAI();
    const response = await client.chat.completions.create({
      model: MODELS.classifier, // gpt-4o-mini is fine for structured extraction
      temperature: 0,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: LLM_SYSTEM_PROMPT },
        { role: 'user', content: t },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('Empty LLM response');

    const parsed = JSON.parse(content) as {
      entities?: Array<{
        type: string;
        raw_value: string;
        evidence_span: string;
        normalized_hint?: string;
      }>;
    };

    const llmEntities = parsed.entities ?? [];

    for (const le of llmEntities) {
      // Hallucination Guard: Verify evidence span verbatim in source text
      if (!verifyEvidenceSpan(t, le.evidence_span)) {
        continue; // Discard hallucinated entity
      }

      const mappedType = mapLlmType(le.type, le.raw_value);

      // Canonicalize the value
      const canon = canonicalizeEntity(le.raw_value);
      const canonicalValue = canon?.value ?? le.normalized_hint ?? le.raw_value.trim();

      const key = `${mappedType}:${canonicalValue}`;
      const existing = reconciled.get(key);

      if (existing) {
        // Match found: merge and elevate confidence
        reconciled.set(key, {
          ...existing,
          source: 'both',
          confidence: 0.99,
          evidence_span: le.evidence_span,
        });
      } else {
        // LLM only: set raw value and calculate confidence
        // reduce slightly if type is domain/url (lookalike check possibility)
        const isUrlOrDomain = mappedType === 'url' || mappedType === 'domain';
        const baseConfidence = isUrlOrDomain ? 0.75 : 0.85;

        reconciled.set(key, {
          type: mappedType,
          raw_value: le.raw_value,
          canonical_value: canonicalValue,
          confidence: baseConfidence,
          source: 'llm',
          evidence_span: le.evidence_span,
        });
      }
    }
  } catch (err) {
    // If LLM fails, return rules-only with degraded flag
    return [...reconciled.values()].map((e) => ({ ...e, degraded: true }));
  }

  return [...reconciled.values()];
}
