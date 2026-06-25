import OpenAI from 'openai';

/**
 * OpenAI client for the AI Intelligence Engine (Vol 8).
 *
 * CONTRACT: content MUST be de-identified before any call (Vol 8/14). Use an
 * organization/project with data-retention disabled. Never present model output
 * as fact — outputs carry calibrated confidence and may abstain.
 */
let _client: OpenAI | null = null;

export function getOpenAI(): OpenAI {
  if (_client) return _client;
  const apiKey = process.env['OPENAI_API_KEY'];
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set — see .env.example');
  }
  _client = new OpenAI({ apiKey });
  return _client;
}

export const MODELS = {
  classifier: process.env['OPENAI_MODEL_CLASSIFIER'] ?? 'gpt-4o-mini',
  explainer: process.env['OPENAI_MODEL_EXPLAINER'] ?? 'gpt-4o',
  embedding: process.env['OPENAI_EMBEDDING_MODEL'] ?? 'text-embedding-3-small',
} as const;
