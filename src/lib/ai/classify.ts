import type { Verdict } from '@/types';
import { getOpenAI, MODELS } from './client';

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
 * Threat classification (Vol 8, AI-8). Real OpenAI path with graceful degradation:
 * when no API key is configured (or any error/invalid output occurs) it ABSTAINS
 * rather than fabricating a verdict — fail closed. Output is never presented as fact;
 * callers pair it with community signal in deriveVerdict and always offer verification.
 */
export async function classifyReport(input: ClassifyInput): Promise<ClassifyResult> {
  const text = input.text?.trim();
  if (!text) return ABSTAIN;
  if (!process.env['OPENAI_API_KEY']) return ABSTAIN; // no key configured → abstain

  try {
    const client = getOpenAI();
    const res = await client.chat.completions.create({
      model: MODELS.classifier,
      temperature: 0,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: text },
      ],
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
    if (!verdict) return ABSTAIN; // unknown/invalid verdict → abstain
    const confidence =
      typeof parsed.confidence === 'number' ? Math.min(1, Math.max(0, parsed.confidence)) : 0;

    return { verdict, confidence, abstained: false };
  } catch {
    return ABSTAIN; // network/parse/quota error → fail closed
  }
}
