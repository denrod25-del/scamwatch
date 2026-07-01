export interface ThreatMatch {
  threatSlug: string;
  confidence: number;
}

export interface ClassifyResult {
  verdict: 'Likely Safe' | 'No Signal' | 'Use Caution' | 'Likely Scam';
  confidence: number;
  abstained: boolean;
}

export interface IClassificationEngine {
  classifyReport(input: { text: string }): Promise<ClassifyResult>;
  classifyThreats(text: string): Promise<ThreatMatch[]>;
}
