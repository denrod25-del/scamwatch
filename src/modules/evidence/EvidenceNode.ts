export interface EvidenceNodeJson {
  id: string;
  reportId?: string;
  entityId?: string;
  type: string;
  confidence: number;
  metadata: Record<string, any>;
  createdAt: string;
}

export class EvidenceNode {
  public readonly id: string;
  public readonly reportId?: string;
  public readonly entityId?: string;
  public readonly type: string;
  public readonly confidence: number;
  public readonly metadata: Record<string, any>;
  public readonly createdAt: Date;

  constructor(
    type: string,
    confidence: number,
    metadata: Record<string, any> = {},
    reportId?: string,
    entityId?: string,
    id?: string,
    createdAt?: Date
  ) {
    this.id = id || crypto.randomUUID();
    this.type = type;
    this.confidence = Math.max(0.0, Math.min(1.0, confidence));
    this.metadata = metadata;
    this.reportId = reportId;
    this.entityId = entityId;
    this.createdAt = createdAt || new Date();
  }

  public toJson(): EvidenceNodeJson {
    return {
      id: this.id,
      reportId: this.reportId,
      entityId: this.entityId,
      type: this.type,
      confidence: this.confidence,
      metadata: this.metadata,
      createdAt: this.createdAt.toISOString(),
    };
  }
}
