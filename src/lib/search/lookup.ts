import type { SupabaseClient } from '@supabase/supabase-js';

import type { EntityType, Verdict } from '@/types';
import { createClient } from '@/lib/supabase/server';
import { classifyReport } from '@/lib/ai/classify';
import { canonicalizeEntity } from '@/lib/entities/canonicalize';
import { deriveVerdict } from './deriveVerdict';

export interface RelatedThreat {
  slug: string;
  title: string;
}

export interface SearchResult {
  query: string;
  entityType: EntityType | 'text';
  verdict: Verdict;
  confidence: number;
  reportCount: number;
  relatedThreats: RelatedThreat[];
  /** True when neither community signal nor the model could say anything. */
  abstained: boolean;
}

interface EntitySignal {
  reportCount: number;
  maxThreatConfidence: number;
  relatedThreats: RelatedThreat[];
}

const EMPTY_SIGNAL: EntitySignal = { reportCount: 0, maxThreatConfidence: 0, relatedThreats: [] };

/**
 * Universal lookup (Vol 5 FR-5.1). Canonicalizes the query to an entity, gathers
 * community signal from the DB, runs the calibrated classifier, and derives one
 * verdict. Degrades gracefully — if the DB/AI are unavailable it still returns a
 * valid "No Signal" result so the page always renders.
 */
export async function lookup(rawQuery: string): Promise<SearchResult> {
  const query = rawQuery.trim();
  const canon = canonicalizeEntity(query);
  const entityType: EntityType | 'text' = canon?.type ?? 'text';

  const signal = canon ? await fetchEntitySignal(canon.type, canon.value) : EMPTY_SIGNAL;

  // Real classifier path — calls OpenAI when configured, otherwise abstains.
  const classification = await classifyReport({ text: query });

  const { verdict, confidence } = deriveVerdict({
    reportCount: signal.reportCount,
    maxThreatConfidence: signal.maxThreatConfidence,
    classifierVerdict: classification.verdict,
    classifierConfidence: classification.confidence,
    classifierAbstained: classification.abstained,
  });

  return {
    query,
    entityType,
    verdict,
    confidence,
    reportCount: signal.reportCount,
    relatedThreats: signal.relatedThreats,
    abstained: classification.abstained && signal.reportCount === 0,
  };
}

async function fetchEntitySignal(type: EntityType, value: string): Promise<EntitySignal> {
  try {
    const typed = await createClient();
    // The generated Database types are a placeholder until `npm run db:types`,
    // so query through a permissive client view until the real schema types exist.
    const sb = typed as unknown as SupabaseClient;

    const { data: entity } = await sb
      .from('entities')
      .select('id')
      .eq('type', type)
      .eq('value_canonical', value)
      .maybeSingle();
    if (!entity) return EMPTY_SIGNAL;

    const { data: links } = await sb
      .from('report_entities')
      .select('report_id')
      .eq('entity_id', entity.id);
    const reportIds = (links ?? []).map((l: { report_id: string }) => l.report_id);
    if (reportIds.length === 0) return EMPTY_SIGNAL;

    const { data: threatRows } = await sb
      .from('report_threats')
      .select('confidence, threats(slug, title)')
      .in('report_id', reportIds)
      .order('confidence', { ascending: false })
      .limit(5);

    // A to-one embed may type/return as an object or a single-element array — handle both.
    const rows = (threatRows ?? []) as unknown as Array<{
      confidence: number | null;
      threats: { slug: string; title: string } | { slug: string; title: string }[] | null;
    }>;

    const relatedThreats: RelatedThreat[] = rows
      .map((r) => (Array.isArray(r.threats) ? r.threats[0] : r.threats))
      .filter((t): t is { slug: string; title: string } => Boolean(t?.slug))
      .map((t) => ({ slug: t.slug, title: t.title }));

    const maxThreatConfidence = rows.reduce((m, r) => Math.max(m, Number(r.confidence ?? 0)), 0);

    return { reportCount: reportIds.length, maxThreatConfidence, relatedThreats };
  } catch {
    // DB unavailable / not configured — degrade to no community signal.
    return EMPTY_SIGNAL;
  }
}
