import { IReasoningEngine, ReasoningNode, ExplanationPayload } from '@/interfaces/IReasoningEngine';

export class ReasoningEngine implements IReasoningEngine {
  /**
   * Builds the reasoning tree node mapping from classification inputs.
   */
  public buildReasoningTree(
    verdict: string,
    overallConfidence: number,
    evidenceNodes: Array<{ type: string; confidence: number; metadata: Record<string, any> }>
  ): ReasoningNode {
    const rootId = crypto.randomUUID();
    const children: ReasoningNode[] = [];

    const ruleNodes = evidenceNodes.filter((e) => e.type === 'regex' || e.type === 'rule');
    if (ruleNodes.length > 0) {
      children.push({
        id: crypto.randomUUID(),
        nodeType: 'regex_rules',
        summary: `Identified ${ruleNodes.length} infrastructure pattern matches directly associated with known scam configurations.`,
        weight: 0.40,
        confidence: ruleNodes.reduce((max, n) => Math.max(max, n.confidence), 0.0),
        parentId: rootId,
        children: [],
      });
    }

    const similarityNodes = evidenceNodes.filter((e) => e.type === 'similarity' || e.type === 'rag');
    if (similarityNodes.length > 0) {
      const maxSim = similarityNodes.reduce((max, n) => Math.max(max, n.confidence), 0.0);
      children.push({
        id: crypto.randomUUID(),
        nodeType: 'rag_similarity',
        summary: `Matched historical reports in repository with a maximum similarity score of ${(maxSim * 100).toFixed(0)}%.`,
        weight: 0.40,
        confidence: maxSim,
        parentId: rootId,
        children: [],
      });
    }

    if (children.length === 0) {
      children.push({
        id: crypto.randomUUID(),
        nodeType: 'reputation_score',
        summary: 'No historical matches or rule-based entities matched in the incoming content.',
        weight: 0.20,
        confidence: 0.0,
        parentId: rootId,
        children: [],
      });
    }

    return {
      id: rootId,
      nodeType: 'root',
      summary: `Concluded verdict "${verdict}" based on aggregated evidence indicators with overall calibrated confidence of ${(overallConfidence * 100).toFixed(0)}%.`,
      weight: 1.0,
      confidence: overallConfidence,
      parentId: null,
      children,
    };
  }

  /**
   * Compiles explainable segments strictly from reasoning tree leaves.
   */
  public compileExplanations(tree: ReasoningNode): ExplanationPayload {
    const reasons: string[] = [];

    for (const child of tree.children) {
      if (child.confidence > 0.0) {
        reasons.push(child.summary);
      }
    }

    if (reasons.length === 0) {
      reasons.push('No direct risk indicators were identified in the analyzed content.');
    }

    return {
      summary: tree.summary,
      reasons,
    };
  }
}
