import { EvidenceNode } from './EvidenceNode';

export interface GraphEdge {
  id: string;
  sourceId: string;
  sourceType: string;
  targetId: string;
  targetType: string;
  edgeType: string;
  weight: number;
}

export class EvidenceGraph {
  private readonly nodes: Map<string, EvidenceNode> = new Map();
  private readonly edges: GraphEdge[] = [];

  public addNode(node: EvidenceNode): void {
    this.nodes.set(node.id, node);

    if (node.reportId && node.entityId) {
      this.addEdge({
        id: crypto.randomUUID(),
        sourceId: node.reportId,
        sourceType: 'report',
        targetId: node.entityId,
        targetType: 'entity',
        edgeType: 'extracted',
        weight: node.confidence,
      });
    }
  }

  public getNodes(): EvidenceNode[] {
    return Array.from(this.nodes.values());
  }

  public addEdge(edge: GraphEdge): void {
    this.edges.push(edge);
  }

  public getEdges(): GraphEdge[] {
    return [...this.edges];
  }

  public getNodesForReport(reportId: string): EvidenceNode[] {
    return this.getNodes().filter((n) => n.reportId === reportId);
  }

  public getNodesForEntity(entityId: string): EvidenceNode[] {
    return this.getNodes().filter((n) => n.entityId === entityId);
  }

  public toVisualJson(): { nodes: any[]; edges: any[] } {
    const visualNodes = Array.from(this.nodes.values()).map((n) => ({
      id: n.id,
      label: `${n.type} (${n.confidence.toFixed(2)})`,
      type: 'evidence',
      metadata: n.metadata,
    }));

    return {
      nodes: visualNodes,
      edges: this.edges.map((e) => ({
        source: e.sourceId,
        target: e.targetId,
        type: e.edgeType,
        weight: e.weight,
      })),
    };
  }
}
