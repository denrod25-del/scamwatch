export type IntelligenceObjectType =
  | 'Text'
  | 'URL'
  | 'Domain'
  | 'Email'
  | 'Phone'
  | 'Organization'
  | 'FreeText'
  // Phase 2 placeholders
  | 'Image'
  | 'QR'
  | 'Voice'
  | 'PDF'
  | 'Video';

export interface IntelligenceObjectJson {
  id: string;
  type: IntelligenceObjectType;
  value: string;
  metadata: Record<string, any>;
  createdAt: string;
}

export class IntelligenceObject {
  public readonly id: string;
  public readonly type: IntelligenceObjectType;
  public readonly value: string;
  public readonly metadata: Record<string, any>;
  public readonly createdAt: Date;

  constructor(
    type: IntelligenceObjectType,
    value: string,
    metadata: Record<string, any> = {},
    id?: string,
    createdAt?: Date
  ) {
    this.id = id || crypto.randomUUID();
    this.type = type;
    this.value = value.trim();
    this.metadata = metadata;
    this.createdAt = createdAt || new Date();
  }

  /**
   * Factory function to create an IntelligenceObject and auto-detect type if not specified.
   */
  public static create(
    value: string,
    type?: IntelligenceObjectType,
    metadata: Record<string, any> = {}
  ): IntelligenceObject {
    const detectedType = type || this.detectType(value);
    return new IntelligenceObject(detectedType, value, metadata);
  }

  /**
   * Auto-detect the type of a string.
   */
  public static detectType(value: string): IntelligenceObjectType {
    const trimmed = value.trim();

    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      return 'Email';
    }

    if (/^https?:\/\//i.test(trimmed)) {
      return 'URL';
    }

    if (/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,63}$/.test(trimmed)) {
      return 'Domain';
    }

    if (/^\+?[0-9\s\-()]{7,20}$/.test(trimmed)) {
      return 'Phone';
    }

    return 'FreeText';
  }

  public toJson(): IntelligenceObjectJson {
    return {
      id: this.id,
      type: this.type,
      value: this.value,
      metadata: this.metadata,
      createdAt: this.createdAt.toISOString(),
    };
  }
}
