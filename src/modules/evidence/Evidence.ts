import { EvidenceNode } from './EvidenceNode';

export interface EvidencePayload {
  reportId: string;
  nodes: EvidenceNode[];
  summary: string;
}

export class Evidence {
  public readonly reportId: string;
  public readonly nodes: EvidenceNode[];
  public readonly summary: string;

  constructor(reportId: string, nodes: EvidenceNode[] = [], summary = '') {
    this.reportId = reportId;
    this.nodes = nodes;
    this.summary = summary;
  }
}
