import { describe, it, expect, vi, beforeEach } from 'vitest';
import { classifyReport } from '@/infrastructure/ai/classify';
import { getOpenAI } from '@/infrastructure/ai/client';
import { createClient } from '@/infrastructure/supabase/server';

vi.mock('@/infrastructure/ai/client', () => {
  const mockCreate = vi.fn();
  const mockEmbeddingsCreate = vi.fn();
  return {
    getOpenAI: () => ({
      chat: {
        completions: {
          create: mockCreate,
        },
      },
      embeddings: {
        create: mockEmbeddingsCreate,
      },
    }),
    MODELS: {
      classifier: 'mock-classifier',
      embedding: 'mock-embedding',
    },
  };
});

vi.mock('@/infrastructure/supabase/server', () => {
  const mockRpc = vi.fn();
  const mockIn = vi.fn();
  const mockSelect = vi.fn().mockReturnValue({ in: mockIn });
  const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });

  return {
    createClient: () => ({
      rpc: mockRpc,
      from: mockFrom,
    }),
  };
});

describe('classifyReport', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('abstains if OPENAI_API_KEY is not set', async () => {
    // Temporarily unset key
    const oldKey = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;

    const result = await classifyReport({ text: 'Some text' });
    expect(result.verdict).toBe('No Signal');
    expect(result.confidence).toBe(0);
    expect(result.abstained).toBe(true);

    process.env.OPENAI_API_KEY = oldKey;
  });

  it('dampens confidence if RAG has no similar match (similarity < 0.3)', async () => {
    process.env.OPENAI_API_KEY = 'fake-key';

    const mockOpenAI = getOpenAI() as any;
    // Mock embeddings call
    mockOpenAI.embeddings.create.mockResolvedValueOnce({
      data: [{ embedding: [0.1, 0.2] }],
    });

    // Mock chat completions returning high confidence (e.g. 0.6)
    mockOpenAI.chat.completions.create.mockResolvedValueOnce({
      choices: [
        {
          message: {
            content: JSON.stringify({
              verdict: 'Use Caution',
              confidence: 0.6,
              abstain: false,
            }),
          },
        },
      ],
    });

    // Mock DB RPC return no similar matches (similarity < 0.3)
    const mockSb = (await createClient()) as any;
    mockSb.rpc.mockResolvedValueOnce({ data: [] }); // Empty similarity list

    const result = await classifyReport({ text: 'Some text' });

    // Dampened confidence: 0.6 * 0.70 = 0.42
    // Since 0.42 is below the 0.45 abstention threshold, it should return ABSTAIN!
    expect(result.verdict).toBe('No Signal');
    expect(result.abstained).toBe(true);
    expect(result.confidence).toBe(0);
  });

  it('preserves classification if confidence remains above threshold after dampening', async () => {
    process.env.OPENAI_API_KEY = 'fake-key';

    const mockOpenAI = getOpenAI() as any;
    mockOpenAI.embeddings.create.mockResolvedValueOnce({
      data: [{ embedding: [0.1, 0.2] }],
    });

    // Mock chat completions returning very high confidence (e.g. 0.8)
    mockOpenAI.chat.completions.create.mockResolvedValueOnce({
      choices: [
        {
          message: {
            content: JSON.stringify({
              verdict: 'Likely Scam',
              confidence: 0.8,
              abstain: false,
            }),
          },
        },
      ],
    });

    const mockSb = (await createClient()) as any;
    mockSb.rpc.mockResolvedValueOnce({ data: [] }); // Empty similarity list

    const result = await classifyReport({ text: 'Some text' });

    // Dampened confidence: 0.8 * 0.70 = 0.56
    // Since 0.56 is above the 0.45 threshold, the verdict is preserved!
    expect(result.verdict).toBe('Likely Scam');
    expect(result.abstained).toBe(false);
    expect(result.confidence).toBeCloseTo(0.56);
  });
});
