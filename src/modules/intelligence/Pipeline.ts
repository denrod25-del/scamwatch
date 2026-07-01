import { PipelineContext } from './PipelineContext';

export interface PipelineStage {
  name: string;
  execute(context: PipelineContext): Promise<void>;
}

export class Pipeline {
  private readonly stages: PipelineStage[] = [];

  constructor(stages: PipelineStage[] = []) {
    this.stages = stages;
  }

  public addStage(stage: PipelineStage): void {
    this.stages.push(stage);
  }

  public getStages(): PipelineStage[] {
    return [...this.stages];
  }
}
