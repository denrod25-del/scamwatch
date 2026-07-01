import { describe, it, expect, vi, beforeEach } from 'vitest';
import { extractEntitiesHybrid } from '@/shared/entities/extractEntitiesHybrid';
import { getOpenAI } from '@/infrastructure/ai/client';

vi.mock('@/infrastructure/ai/client', () => {
  const mockCreate = vi.fn();
  return {
    getOpenAI: () => ({
      chat: {
        completions: {
          create: mockCreate,
        },
      },
    }),
    MODELS: { classifier: 'mock-model' },
  };
});

describe('extractEntitiesHybrid', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('runs rules-only fallback if skipLlm is true', async () => {
    const text = 'Call +1 (561) 555-0142 now';
    const result = await extractEntitiesHybrid(text, { skipLlm: true });

    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('phone');
    expect(result[0].canonical_value).toBe('+15615550142');
    expect(result[0].confidence).toBe(0.95);
    expect(result[0].source).toBe('rule');
    expect(result[0].degraded).toBe(true);
  });

  it('reconciles rules and LLM outputs and discards hallucinated spans', async () => {
    const text = 'They emailed me at help@paypa1.com and said to pay now';

    // Mock LLM returning 3 entities:
    // 1) A matching email (paypa1.com) -> should merge
    // 2) An organization (PayPal) -> should add as brand (LLM only)
    // 3) A hallucinated phone number -> should be discarded
    const mockResponseContent = JSON.stringify({
      entities: [
        {
          type: 'email',
          raw_value: 'help@paypa1.com',
          evidence_span: 'emailed me at help@paypa1.com',
          normalized_hint: 'help@paypa1.com',
        },
        {
          type: 'organization',
          raw_value: 'PayPal',
          evidence_span: 'emailed me at help@paypa1.com',
          normalized_hint: 'PayPal',
        },
        {
          type: 'phone',
          raw_value: '+15551234567',
          evidence_span: 'call me at +15551234567', // Not in source text!
        },
      ],
    });

    const mockCreate = getOpenAI().chat.completions.create as any;
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: mockResponseContent } }],
    });

    const result = await extractEntitiesHybrid(text, { getApiKey: () => 'fake-key' });

    const byType = (t: string) => result.filter((e) => e.type === t);

    // Hallucinated phone number should be discarded
    expect(byType('phone')).toHaveLength(0);

    // Email should be merged (rules found it, LLM found it) -> source 'both', confidence 0.99
    const emails = byType('email');
    expect(emails).toHaveLength(1);
    expect(emails[0].canonical_value).toBe('help@paypa1.com');
    expect(emails[0].source).toBe('both');
    expect(emails[0].confidence).toBe(0.99);

    // Organization should be mapped to brand (LLM only) -> source 'llm', confidence 0.85
    const brands = byType('brand');
    expect(brands).toHaveLength(1);
    expect(brands[0].canonical_value).toBe('PayPal');
    expect(brands[0].source).toBe('llm');
    expect(brands[0].confidence).toBe(0.85);
  });
});
