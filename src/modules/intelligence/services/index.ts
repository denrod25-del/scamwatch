import { SupabaseClient } from '@supabase/supabase-js';
import { ConfidenceService, ConfidenceVector } from './ConfidenceService';
import { ReasoningNode, ReasoningEngine } from '@/modules/reasoning/ReasoningEngine';

export interface IEntityService {
  canonicalize(type: string, value: string): string;
  addEntity(sb: SupabaseClient, type: string, value: string): Promise<string>;
}

export interface IEvidenceService {
  logEvidence(
    sb: SupabaseClient,
    reportId: string,
    entityId: string,
    type: string,
    confidence: number,
    metadata?: Record<string, any>
  ): Promise<string>;
}

export interface ICampaignService {
  detectAndLink(sb: SupabaseClient, reportId: string): Promise<string | null>;
}

export interface ITimelineService {
  logEvent(
    sb: SupabaseClient,
    subjectType: 'report' | 'campaign' | 'investigation',
    subjectId: string,
    eventType: string,
    description?: string,
    metadata?: Record<string, any>
  ): Promise<void>;
}

export interface IKnowledgeGraphService {
  propagateRisk(sb: SupabaseClient, entityId: string, entityType: string): Promise<number>;
  upsertEdge(
    sb: SupabaseClient,
    sourceType: string,
    sourceId: string,
    targetType: string,
    targetId: string,
    edgeType: string,
    weight: number
  ): Promise<void>;
}

// Global default service class instantiations
export const confidenceService = new ConfidenceService();
export const reasoningService = new ReasoningEngine();
export { ConfidenceService, ReasoningEngine };
export type { ConfidenceVector, ReasoningNode };
