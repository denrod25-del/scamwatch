import { EvidenceNode } from './EvidenceNode';

export class EvidenceBuilder {
  /**
   * Constructs an evidence node from a deterministic entity extraction step.
   */
  public buildFromExtraction(
    reportId: string,
    entityId: string,
    source: string,
    confidence: number,
    value: string
  ): EvidenceNode {
    return new EvidenceNode(
      source,
      confidence,
      { verbatim_span: value },
      reportId,
      entityId
    );
  }

  /**
   * Constructs an evidence node from RAG-similarity threat classifications.
   */
  public buildFromSimilarity(
    reportId: string,
    threatSlug: string,
    confidence: number
  ): EvidenceNode {
    return new EvidenceNode(
      'similarity',
      confidence,
      { threatSlug },
      reportId
    );
  }
}
