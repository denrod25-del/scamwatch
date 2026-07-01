export interface UnderstandItem {
  threat_id: string;
  title: string;
  confidence: number;
}

export interface VerifyItem {
  org: string;
  action: string;
  url: string;
}

export interface ProtectItem {
  step: string;
  urgency: 'low' | 'medium' | 'high';
}

export interface RecommendationPayload {
  understand: UnderstandItem[];
  verify: VerifyItem[];
  protect: ProtectItem[];
  disclaimer: string;
}

export interface RecommendationContext {
  did_lose_money: boolean;
  did_share_pii: boolean;
}

export interface IRecommendationEngine {
  generateRecommendations(
    verdict: string,
    entityType: string,
    context: RecommendationContext
  ): RecommendationPayload;
}
