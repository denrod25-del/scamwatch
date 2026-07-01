import { IntelligenceObject } from './IntelligenceObject';
import { PipelineContext } from './PipelineContext';
import { PipelineStage } from './Pipeline';

export class IntelligenceEngine {
  private readonly stages: PipelineStage[] = [];

  constructor(stages: PipelineStage[] = []) {
    this.stages = stages;
  }

  /**
   * Registers a pipeline stage.
   */
  public registerStage(stage: PipelineStage): void {
    this.stages.push(stage);
  }

  /**
   * Evaluates the pipeline stages against the intelligence object.
   */
  public async analyze(
    input: IntelligenceObject,
    initialMetadata: Record<string, any> = {}
  ): Promise<PipelineContext> {
    const context: PipelineContext = {
      id: crypto.randomUUID(),
      input,
      entities: [],
      threats: [],
      evidenceNodes: [],
      reasoningNodes: [],
      confidence: {
        evidence: 0.0,
        model: 0.0,
        community: 0.0,
        historical: 0.0,
        verification: 0.0,
        overall: 0.0,
      },
      verdict: 'No Signal',
      timelineEvents: [
        {
          eventType: 'Ingested',
          description: `Ingested ${input.type} object with identifier: ${input.id}`,
        },
      ],
      metadata: { ...initialMetadata },
    };

    for (const stage of this.stages) {
      try {
        await stage.execute(context);
      } catch (err) {
        console.error(`Orchestrator pipeline stage failed [${stage.name}]:`, err);
        context.timelineEvents.push({
          eventType: 'Stage Failed',
          description: `Stage [${stage.name}] encountered an exception.`,
        });
      }
    }

    return context;
  }
}
