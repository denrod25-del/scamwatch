import { IntelligenceObject } from './IntelligenceObject';

export interface PipelineContext {
  id: string;
  input: IntelligenceObject;
  entities: Array<{
    type: string;
    value: string;
    confidence: number;
    source: 'rule' | 'llm' | 'both';
  }>;
  threats: Array<{
    category: string;
    confidence: number;
    abstained: boolean;
  }>;
  evidenceNodes: Array<{
    type: string;
    confidence: number;
    metadata: Record<string, any>;
    entityId?: string;
  }>;
  reasoningNodes: Array<{
    nodeType: string;
    summary: string;
    weight: number;
    confidence: number;
    children?: any[];
  }>;
  confidence: {
    evidence: number;
    model: number;
    community: number;
    historical: number;
    verification: number;
    overall: number;
  };
  verdict: 'Likely Safe' | 'No Signal' | 'Use Caution' | 'Likely Scam';
  campaignId?: string;
  timelineEvents: Array<{
    eventType: string;
    description: string;
    metadata?: Record<string, any>;
  }>;
  metadata: Record<string, any>;
}
