import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculateLinkScore, detectCampaignsForReport } from '@/modules/campaigns/detect';

describe('Campaign Detection', () => {
  describe('calculateLinkScore', () => {
    it('gives a high score for high-entropy shared indicators and close timestamps', () => {
      const score = calculateLinkScore({
        sharedEntities: [{ type: 'wallet', value: '0x123' }],
        templateSimilarity: 0.8,
        daysDifference: 1,
        sameGeo: true,
      });

      // S_entity = min(1.0, 1.0) = 1.0 -> 0.5 * 1.0 = 0.5
      // S_template = 0.8 -> 0.3 * 0.8 = 0.24
      // S_temporal = exp(-0.05 * 1) = 0.951 -> 0.15 * 0.951 = 0.142
      // S_geo = 1.0 -> 0.05 * 1.0 = 0.05
      // Sum = 0.5 + 0.24 + 0.142 + 0.05 = 0.932
      expect(score).toBeGreaterThanOrEqual(0.9);
    });

    it('gives a low score for low-entropy shared indicators and distant timestamps', () => {
      const score = calculateLinkScore({
        sharedEntities: [{ type: 'domain', value: 'gmail.com' }],
        templateSimilarity: 0.1,
        daysDifference: 30,
        sameGeo: false,
      });

      // S_entity = min(1.0, 0.05) = 0.05 -> 0.5 * 0.05 = 0.025
      // S_template = 0.1 -> 0.3 * 0.1 = 0.03
      // S_temporal = exp(-0.05 * 30) = 0.223 -> 0.15 * 0.223 = 0.033
      // S_geo = 0.2 -> 0.05 * 0.2 = 0.01
      // Sum = 0.025 + 0.03 + 0.033 + 0.01 = 0.098
      expect(score).toBeLessThan(0.25);
    });
  });

  describe('detectCampaignsForReport database matching', () => {
    let mockSb: any;

    beforeEach(() => {
      mockSb = {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        neq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockReturnThis(),
        single: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        upsert: vi.fn().mockReturnThis(),
      };
    });

    it('links report to an active campaign if composite score crosses 0.70', async () => {
      // Setup mock returns
      mockSb.single.mockResolvedValueOnce({
        data: {
          id: 'report-new',
          created_at: new Date().toISOString(),
          report_entities: [
            { entities: { id: 'ent-1', type: 'wallet', value_canonical: '0x555' } },
          ],
        },
      });

      mockSb.maybeSingle.mockResolvedValue({
        data: { embedding: [0.1, 0.2] }, // target embedding
      });

      let inCount = 0;
      mockSb.in.mockImplementation(() => {
        inCount++;
        if (inCount === 1) {
          return Promise.resolve({
            data: [
              {
                id: 'campaign-1',
                status: 'candidate',
                campaign_reports: [{ report_id: 'report-old' }],
              },
            ],
          });
        }
        return mockSb;
      });

      mockSb.limit.mockResolvedValueOnce({
        data: [
          {
            id: 'report-old',
            created_at: new Date().toISOString(),
            report_entities: [
              { entities: { id: 'ent-1', type: 'wallet', value_canonical: '0x555' } },
            ],
          },
        ],
      });

      const result = await detectCampaignsForReport(mockSb, 'report-new');

      expect(result).toBeDefined();
      expect(result?.linkedCampaignId).toBe('campaign-1');
      expect(result?.isNewCampaign).toBe(false);
      expect(result?.score).toBeGreaterThanOrEqual(0.7);
    });
  });
});
