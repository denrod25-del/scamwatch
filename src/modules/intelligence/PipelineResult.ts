export interface PipelineResult {
  reportId: string;
  verdict: 'Likely Safe' | 'No Signal' | 'Use Caution' | 'Likely Scam';
  confidence: {
    evidence: number;
    model: number;
    community: number;
    historical: number;
    verification: number;
    overall: number;
  };
  explanation: {
    summary: string;
    reasons: string[];
  };
  recommendations: {
    understand: string[];
    verify: Array<{ action: string; org: string; url: string }>;
    protect: Array<{ step: string; urgency: 'high' | 'medium' | 'low' }>;
  };
  timeline: Array<{
    eventType: string;
    description: string;
    createdAt: string;
  }>;
}
