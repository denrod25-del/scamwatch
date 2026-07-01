import type { Verdict } from '@/types';
import { getOpenAI, MODELS } from './client';
import { createClient } from '@/infrastructure/supabase/server';

export interface ClassifyInput {
  /** De-identified report/query text (PII removed upstream — Vol 8/14). */
  text: string;
  channel?: string;
}

export interface ClassifyResult {
  verdict: Verdict;
  /** Calibrated confidence in [0,1]. */
  confidence: number;
  /** True when the model declines to classify (low evidence) — a first-class outcome. */
  abstained: boolean;
}

const ABSTAIN: ClassifyResult = { verdict: 'No Signal', confidence: 0, abstained: true };
const ALLOWED: Verdict[] = ['Likely Safe', 'No Signal', 'Use Caution', 'Likely Scam'];

const SYSTEM_PROMPT = [
  'You are a calibrated scam-classification assistant for ScamWatch.',
  'Given a user-supplied message, link, number, or email, assess scam risk.',
  'Return ONLY a JSON object: {"verdict": <one of "Likely Safe"|"No Signal"|"Use Caution"|"Likely Scam">, "confidence": <number 0..1>, "abstain": <boolean>}.',
  'Rules: never claim certainty. If evidence is weak or ambiguous, set "abstain": true.',
  'Never output "Confirmed Reported Scam" — that requires community reports, not your judgment.',
  'Prefer "Use Caution" over "Likely Scam" unless the scam signals are strong and explicit.',
].join(' ');

/**
 * Threat classification (Vol 8, AI-8, PRD-301.3).
 * Performs pgvector RAG matches against historical reports to anchor the LLM,
 * and enforces the abstention threshold (theta_abstain = 0.45).
 */
export async function classifyReport(input: ClassifyInput): Promise<ClassifyResult> {
  const text = input.text?.trim();
  if (!text) return ABSTAIN;
  if (!process.env['OPENAI_API_KEY']) return ABSTAIN; // no key configured → abstain

  let queryEmbedding: number[] | null = null;
  try {
    const client = getOpenAI();
    const embedRes = await client.embeddings.create({
      model: MODELS.embedding,
      input: text,
    });
    queryEmbedding = embedRes.data[0]?.embedding ?? null;
  } catch {
    // Ignore embedding failures, fallback to zero-shot
  }

  let exemplarsText = '';
  let maxSimilarity = 0;

  try {
    if (queryEmbedding) {
      const sb = (await createClient()) as any;
      const { data: matched } = await sb.rpc('match_embeddings', {
        query_embedding: queryEmbedding,
        match_threshold: 0.3,
        match_count: 5,
        filter_owner_type: 'report',
      });

      if (matched && matched.length > 0) {
        maxSimilarity = matched[0].similarity;
        const reportIds = matched.map((m: any) => m.owner_id);

        const { data: reportsData } = await sb
          .from('reports')
          .select('id, raw_text, report_threats(confidence, threats(slug, title))')
          .in('id', reportIds);

        if (reportsData && reportsData.length > 0) {
          exemplarsText = 'Below are historically resolved scam reports matching the input:\n\n';
          for (const r of reportsData) {
            const threatsArray = Array.isArray(r.report_threats)
              ? r.report_threats
              : r.report_threats
              ? [r.report_threats]
              : [];
            const firstThreat = threatsArray[0] as any;
            const threatLabel = firstThreat?.threats?.title ?? 'Unknown Threat';
            exemplarsText += `Example Report:\n"${r.raw_text}"\nResulting Classification: ${threatLabel}\n\n`;
          }
        }
      }
    }
  } catch {
    // Fallback silently to zero-shot classification (no exemplars)
  }

  try {
    const client = getOpenAI();
    const messages = [{ role: 'system' as const, content: SYSTEM_PROMPT }];

    if (exemplarsText) {
      messages.push({
        role: 'system' as const,
        content: `You have retrieved historical exemplars for few-shot learning.\n${exemplarsText}`,
      });
    }

    messages.push({ role: 'user' as const, content: text });

    const res = await client.chat.completions.create({
      model: MODELS.classifier,
      temperature: 0,
      response_format: { type: 'json_object' },
      messages,
    });

    const content = res.choices[0]?.message?.content;
    if (!content) return ABSTAIN;

    const parsed = JSON.parse(content) as {
      verdict?: unknown;
      confidence?: unknown;
      abstain?: unknown;
    };
    if (parsed.abstain === true) return ABSTAIN;

    const verdict = ALLOWED.find((v) => v === parsed.verdict);
    if (!verdict) return ABSTAIN;

    let confidence =
      typeof parsed.confidence === 'number' ? Math.min(1, Math.max(0, parsed.confidence)) : 0;

    // Apply confidence dampening if RAG returned no similar matches (similarity < 0.3)
    if (queryEmbedding && maxSimilarity < 0.3) {
      confidence = confidence * 0.7;
    }

    // Enforce abstention threshold (theta_abstain = 0.45)
    if (confidence < 0.45) {
      return ABSTAIN;
    }

    return { verdict, confidence, abstained: false };
  } catch (err) {
    // OpenAI failed / unavailable -> Rules-only fallback (Epic 7)
    const lowerText = text.toLowerCase();
    if (
      lowerText.includes('toll') ||
      lowerText.includes('unpaid') ||
      lowerText.includes('sunpass') ||
      lowerText.includes('disconnected') ||
      lowerText.includes('gift card') ||
      lowerText.includes('ssn') ||
      lowerText.includes('irs')
    ) {
      return { verdict: 'Likely Scam', confidence: 0.75, abstained: false };
    }
    return ABSTAIN;
  }

}

export interface ThreatClassification {
  threatSlug: string;
  confidence: number;
}

/**
 * Multi-label threat classification (PRD-301.3).
 * Classifies an incoming report against the controlled threat database slugs,
 * incorporating pgvector exemplars and applying calibration dampening/abstention gates.
 */
export async function classifyThreats(
  text: string,
  deps: { getApiKey?: () => string | undefined } = {}
): Promise<ThreatClassification[]> {
  const t = text.trim();
  if (!t) return [];

  const getApiKey = deps.getApiKey ?? (() => process.env['OPENAI_API_KEY']);
  if (!getApiKey()) return [];

  // 1) Fetch database threats to construct taxonomy context
  let dbThreats: Array<{ slug: string; title: string; summary: string }> = [];
  try {
    const sb = await createClient();
    const { data } = await sb.from('threats').select('slug, title, summary');
    dbThreats = data ?? [];
  } catch {
    // offline/test fallback starter threats
    dbThreats = [
      { slug: 'toll-road-smishing', title: 'Unpaid toll text scam', summary: 'unpaid toll text' },
      { slug: 'pig-butchering', title: 'Pig-butchering investment scam', summary: 'crypto trading relationship' },
      { slug: 'tech-support', title: 'Tech-support scam', summary: 'tech support infection warning' },
    ];
  }

  if (dbThreats.length === 0) return [];

  // 2) Get query embedding
  let queryEmbedding: number[] | null = null;
  try {
    const client = getOpenAI();
    const embedRes = await client.embeddings.create({
      model: MODELS.embedding,
      input: t,
    });
    queryEmbedding = embedRes.data[0]?.embedding ?? null;
  } catch {
    // ignore
  }

  // 3) RAG matching
  let exemplarsText = '';
  let maxSimilarity = 0;
  try {
    if (queryEmbedding) {
      const sb = (await createClient()) as any;
      const { data: matched } = await sb.rpc('match_embeddings', {
        query_embedding: queryEmbedding,
        match_threshold: 0.3,
        match_count: 5,
        filter_owner_type: 'report',
      });

      if (matched && matched.length > 0) {
        maxSimilarity = matched[0].similarity;
        const reportIds = matched.map((m: any) => m.owner_id);

        const { data: reportsData } = await sb
          .from('reports')
          .select('id, raw_text, report_threats(confidence, threats(slug, title))')
          .in('id', reportIds);

        if (reportsData && reportsData.length > 0) {
          exemplarsText = 'Below are historically resolved scam reports matching the input:\n\n';
          for (const r of reportsData) {
            const threatsArray = Array.isArray(r.report_threats)
              ? r.report_threats
              : r.report_threats
              ? [r.report_threats]
              : [];
            const firstThreat = threatsArray[0] as any;
            const threatLabel = firstThreat?.threats?.title ?? 'Unknown Threat';
            exemplarsText += `Example Report:\n"${r.raw_text}"\nResulting Classification: ${threatLabel}\n\n`;
          }
        }
      }
    }
  } catch {
    // silent fallback
  }

  // 4) Ask LLM to classify threat categories
  const THREATS_SYSTEM_PROMPT = [
    'You are a calibrated scam threat taxonomy classifier.',
    'Map the user report to the applicable threat slugs from the list below.',
    'List of threats:',
    dbThreats.map((th) => `- Slug: "${th.slug}". Title: "${th.title}". Summary: "${th.summary}"`).join('\n'),
    'Return ONLY a JSON object: {"matches": [{"slug": "<threat_slug>", "confidence": <number 0..1>}]}.',
    'Set confidence representing the probability (0..1) that the report belongs to this threat category.',
  ].join('\n');

  try {
    const client = getOpenAI();
    const messages = [{ role: 'system' as const, content: THREATS_SYSTEM_PROMPT }];
    if (exemplarsText) {
      messages.push({
        role: 'system' as const,
        content: `RAG Exemplars:\n${exemplarsText}`,
      });
    }
    messages.push({ role: 'user' as const, content: t });

    const response = await client.chat.completions.create({
      model: MODELS.classifier,
      temperature: 0,
      response_format: { type: 'json_object' },
      messages,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return [];

    const parsed = JSON.parse(content) as {
      matches?: Array<{ slug: string; confidence: number }>;
    };

    const matches = parsed.matches ?? [];
    const results: ThreatClassification[] = [];

    for (const m of matches) {
      const validThreat = dbThreats.find((th) => th.slug === m.slug);
      if (!validThreat) continue;

      let confidence = typeof m.confidence === 'number' ? Math.min(1, Math.max(0, m.confidence)) : 0;

      // Apply confidence dampening if RAG returned no similar matches (similarity < 0.3)
      if (queryEmbedding && maxSimilarity < 0.3) {
        confidence = confidence * 0.7;
      }

      // Enforce threshold (theta_abstain = 0.45)
      if (confidence >= 0.45) {
        results.push({ threatSlug: m.slug, confidence });
      }
    }

    return results;
  } catch {
    // OpenAI failed / unavailable -> Rules-only fallback (Epic 7)
    const lowerText = t.toLowerCase();
    const matchedThreats: ThreatClassification[] = [];
    if (lowerText.includes('toll') || lowerText.includes('sunpass')) {
      matchedThreats.push({ threatSlug: 'toll-road-smishing', confidence: 0.85 });
    }
    if (
      lowerText.includes('disconnected') ||
      lowerText.includes('duke energy') ||
      lowerText.includes('power')
    ) {
      matchedThreats.push({ threatSlug: 'tech-support', confidence: 0.80 });
    }
    return matchedThreats;
  }
}
