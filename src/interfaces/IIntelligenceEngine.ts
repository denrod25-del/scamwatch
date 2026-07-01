import { IntelligenceObject } from '@/modules/intelligence/IntelligenceObject';
import { PipelineContext } from '@/modules/intelligence/PipelineContext';

export interface IIntelligenceEngine {
  analyze(
    input: IntelligenceObject,
    metadata?: Record<string, any>
  ): Promise<PipelineContext>;
}
