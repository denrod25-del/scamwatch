export interface PipelinePerformanceMetrics {
  pipelineDurationMs: number;
  extractionDurationMs: number;
  classificationDurationMs: number;
  graphLookupDurationMs: number;
  recommendationDurationMs: number;
  explanationDurationMs: number;
  cacheHitRatio: number;
  tokenUsage: number;
  estimatedCostUsd: number;
  errorRate: number;
}

export class ObservabilityService {
  private readonly metricsLog: PipelinePerformanceMetrics[] = [];

  /**
   * Records a snapshot of metric markers.
   */
  public logMetrics(metrics: PipelinePerformanceMetrics): void {
    this.metricsLog.push(metrics);
  }

  /**
   * Retrieves aggregated pipeline durations.
   */
  public getAverageDuration(): number {
    if (this.metricsLog.length === 0) return 0;
    const sum = this.metricsLog.reduce((acc, m) => acc + m.pipelineDurationMs, 0);
    return sum / this.metricsLog.length;
  }

  /**
   * Evaluates OpenAI API billing costs based on token counts.
   */
  public calculateEstimatedCost(promptTokens: number, completionTokens: number): number {
    // text-embedding-3-small: $0.02 / 1M tokens
    // gpt-4o-mini: $0.150 / 1M input, $0.600 / 1M output tokens
    const inputCost = (promptTokens / 1_000_000) * 0.150;
    const outputCost = (completionTokens / 1_000_000) * 0.600;
    return inputCost + outputCost;
  }

  /**
   * Records request-level structured traces.
   */
  public logRequestTrace(requestId: string, path: string, durationMs: number, status: number): void {
    console.log(
      JSON.stringify({
        level: 'info',
        timestamp: new Date().toISOString(),
        requestId,
        path,
        durationMs,
        status,
      })
    );
  }
}

export const observabilityService = new ObservabilityService();
export type { PipelinePerformanceMetrics as Metrics };
