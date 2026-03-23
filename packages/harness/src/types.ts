/**
 * Harness evaluation types
 *
 * Defines structures for evaluation framework
 */

/**
 * Single evaluation result
 */
export interface EvalResult {
  name: string;
  passed: boolean;
  score: number;      // 0-1
  metrics: Record<string, number>;
  errors: string[];
  duration: number;   // milliseconds
}

/**
 * Evaluation suite (collection of results)
 */
export interface EvalSuite {
  name: string;
  results: EvalResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    avgScore: number;
  };
}

/**
 * Evaluation function type
 */
export type EvalFunction = () => Promise<EvalResult>;
