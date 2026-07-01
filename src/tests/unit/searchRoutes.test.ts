import { describe, it, expect } from 'vitest';
import { GET } from '@/app/api/v1/search/route';
import { POST } from '@/app/api/v1/search/check/route';

describe('Search API Endpoints', () => {
  describe('GET /api/v1/search', () => {
    it('returns 422 if query parameter "q" is missing', async () => {
      const request = new Request('http://localhost/api/v1/search');
      const response = await GET(request);
      expect(response.status).toBe(422);

      const body = await response.json();
      expect(body.error.code).toBe('validation_failed');
    });

    it('returns 200 with search result if "q" is present', async () => {
      const request = new Request('http://localhost/api/v1/search?q=%2B15558675309');
      const response = await GET(request);
      expect(response.status).toBe(200);
      expect(response.headers.get('X-API-Version')).toBe('v1');

      const body = await response.json();
      expect(body.data).toBeDefined();
      expect(body.data.query).toBe('+15558675309');
      expect(body.data.entityType).toBe('phone');
      expect(body.data.verdict).toBe('No Signal');
    });
  });

  describe('POST /api/v1/search/check', () => {
    it('returns 400 on malformed JSON body', async () => {
      const request = new Request('http://localhost/api/v1/search/check', {
        method: 'POST',
        body: 'invalid-json',
      });
      const response = await POST(request);
      expect(response.status).toBe(400);

      const body = await response.json();
      expect(body.error.code).toBe('invalid_json');
    });

    it('returns 422 on schema validation failure', async () => {
      const request = new Request('http://localhost/api/v1/search/check', {
        method: 'POST',
        body: JSON.stringify({
          text: 'hello',
          // missing type and submitter_context
        }),
      });
      const response = await POST(request);
      expect(response.status).toBe(422);

      const body = await response.json();
      expect(body.error.code).toBe('validation_failed');
    });

    it('returns 200 with full data structure on valid lookup', async () => {
      const payload = {
        text: 'http://paypa1.com/login',
        type: 'url',
        submitter_context: {
          did_lose_money: true,
          did_share_pii: false,
        },
      };
      const request = new Request('http://localhost/api/v1/search/check', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      const response = await POST(request);
      expect(response.status).toBe(200);

      const body = await response.json();
      expect(body.data).toBeDefined();
      expect(body.data.verdict).toBe('No Signal'); // default fallback / no API key
      expect(body.data.confidence_band).toBe('Low');
      expect(body.data.entities).toHaveLength(1);
      expect(body.data.entities[0].type).toBe('url');
      expect(body.data.entities[0].canonical_value).toBe('paypa1.com/login');

      // Check explanation
      expect(body.data.explanation.text).toContain('No Signal');
      expect(body.data.explanation.citations).toHaveLength(0);

      // Check recommendations
      expect(body.data.recommendations.understand).toHaveLength(0);
      expect(body.data.recommendations.verify).toHaveLength(1);
      expect(body.data.recommendations.verify[0].org).toBe('FTC');
      expect(body.data.recommendations.protect).toHaveLength(2); // lose money protect steps
      expect(body.data.recommendations.protect[0].urgency).toBe('high');
    });
  });
});
