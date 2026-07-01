import { describe, it, expect, vi } from 'vitest';
import { IntelligenceObject } from '@/modules/intelligence/IntelligenceObject';
import { IntelligenceEngine } from '@/modules/intelligence/IntelligenceEngine';
import { PipelineContext, PipelineStage } from '@/modules/intelligence/Pipeline';
import { EvidenceNode } from '@/modules/evidence/EvidenceNode';
import { EvidenceGraph } from '@/modules/evidence/EvidenceGraph';
import { ReasoningEngine } from '@/modules/reasoning/ReasoningEngine';
import { ConfidenceService } from '@/modules/intelligence/services/ConfidenceService';
import { createInvestigation, archiveInvestigation, mergeInvestigation } from '@/modules/investigations';
import { SupabaseClient } from '@supabase/supabase-js';

describe('Sentinel Intelligence Engine (SIE) Upgrades', () => {
  describe('IntelligenceObject Ingestion', () => {
    it('detects emails correctly', () => {
      const obj = IntelligenceObject.create('support@scam-alert.org');
      expect(obj.type).toBe('Email');
    });

    it('detects URLs correctly', () => {
      const obj = IntelligenceObject.create('https://chase-security-login.com/secure');
      expect(obj.type).toBe('URL');
    });

    it('detects domains correctly', () => {
      const obj = IntelligenceObject.create('chase-security-login.com');
      expect(obj.type).toBe('Domain');
    });

    it('detects phones correctly', () => {
      const obj = IntelligenceObject.create('+1 (555) 019-2834');
      expect(obj.type).toBe('Phone');
    });

    it('defaults to FreeText for unstructured text', () => {
      const obj = IntelligenceObject.create('Urgent bank notice: verify your password now.');
      expect(obj.type).toBe('FreeText');
    });
  });

  describe('Pipeline Orchestrator', () => {
    it('executes registered stages in sequence and aggregates contexts', async () => {
      const mockStage1: PipelineStage = {
        name: 'MockStage1',
        execute: async (ctx: PipelineContext) => {
          ctx.verdict = 'Use Caution';
          ctx.entities.push({ type: 'phone', value: '12345', confidence: 0.9, source: 'rule' });
        },
      };

      const orchestrator = new IntelligenceEngine([mockStage1]);
      const obj = IntelligenceObject.create('test message');
      const ctx = await orchestrator.analyze(obj);

      expect(ctx.verdict).toBe('Use Caution');
      expect(ctx.entities).toHaveLength(1);
      expect(ctx.timelineEvents).toContainEqual(
        expect.objectContaining({
          eventType: 'Ingested',
        })
      );
    });
  });

  describe('EvidenceGraph Compiling', () => {
    it('adds evidence nodes and links edges correctly', () => {
      const graph = new EvidenceGraph();
      const reportId = crypto.randomUUID();
      const entityId = crypto.randomUUID();

      const node = new EvidenceNode('regex', 0.95, { term: 'paypal' }, reportId, entityId);
      graph.addNode(node);

      expect(graph.getNodes()).toHaveLength(1);
      expect(graph.getEdges()).toHaveLength(1);
      expect(graph.getEdges()[0]).toEqual(
        expect.objectContaining({
          sourceId: reportId,
          targetId: entityId,
          edgeType: 'extracted',
          weight: 0.95,
        })
      );
    });
  });

  describe('Reasoning Tree Service', () => {
    it('builds a tree and compiles clean explanations without exposing prompts', () => {
      const service = new ReasoningEngine();
      const evidence = [
        { type: 'regex', confidence: 0.9, metadata: {} },
        { type: 'similarity', confidence: 0.8, metadata: {} },
      ];

      const tree = service.buildReasoningTree('Likely Scam', 0.85, evidence);
      expect(tree.nodeType).toBe('root');
      expect(tree.children).toHaveLength(2);

      const explanation = service.compileExplanations(tree);
      expect(explanation.summary).toContain('Likely Scam');
      expect(explanation.reasons).toContain(
        'Identified 1 infrastructure pattern matches directly associated with known scam configurations.'
      );
    });
  });

  describe('Multi-Dimensional Confidence Scorer', () => {
    it('calculates weighted averages and handles limits correctly', () => {
      const service = new ConfidenceService();
      const vector = service.calculateConfidence(0.8, 2, 5, true);

      // Model = 0.8 -> 0.3 * 0.8 = 0.24
      // Evidence = 0.8 (2 entities) -> 0.3 * 0.8 = 0.24
      // Community = 0.9 (>= 2 reports) -> 0.2 * 0.9 = 0.18
      // Historical = 0.5 (default) -> 0.1 * 0.5 = 0.05
      // Verification = 1.0 (hasVerification) -> 0.1 * 1.0 = 0.10
      // Sum = 0.24 + 0.24 + 0.18 + 0.05 + 0.10 = 0.81
      expect(vector.overall).toBeCloseTo(0.81);
    });
  });

  describe('Investigations Case Builder', () => {
    it('creates, archives, and merges cases using client mock chains', async () => {
      const mockSb = {
        from: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { id: 'case-123' }, error: null }),
        eq: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        upsert: vi.fn().mockResolvedValue({ error: null }),
      } as unknown as SupabaseClient;

      const caseId = await createInvestigation(mockSb, ' Romance Scam Investigation');
      expect(caseId).toBe('case-123');

      await archiveInvestigation(mockSb, caseId);
      expect(mockSb.update).toHaveBeenCalledWith(expect.objectContaining({ status: 'archived' }));
    });
  });
});
