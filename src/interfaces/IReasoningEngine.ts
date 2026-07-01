export interface ReasoningNode {
  id: string;
  nodeType: string;
  summary: string;
  weight: number;
  confidence: number;
  parentId: string | null;
  children: ReasoningNode[];
}

export interface ExplanationPayload {
  summary: string;
  reasons: string[];
}

export interface IReasoningEngine {
  buildReasoningTree(
    verdict: string,
    overallConfidence: number,
    evidenceNodes: Array<{ type: string; confidence: number; metadata: Record<string, any> }>
  ): ReasoningNode;

  compileExplanations(tree: ReasoningNode): ExplanationPayload;
}
