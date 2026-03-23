/**
 * Harness evaluation runner
 *
 * Core framework for running evaluations
 */

import type { EvalResult, EvalSuite, EvalFunction } from './types';

/**
 * Harness runner - executes evaluations and generates reports
 */
export class HarnessRunner {
  /**
   * Run a single evaluation
   */
  async runEval(name: string, fn: EvalFunction): Promise<EvalResult> {
    const start = Date.now();
    try {
      const result = await fn();
      result.duration = Date.now() - start;
      return result;
    } catch (error: any) {
      return {
        name,
        passed: false,
        score: 0,
        metrics: {},
        errors: [error.message],
        duration: Date.now() - start,
      };
    }
  }

  /**
   * Run an evaluation suite (multiple evaluations)
   */
  async runSuite(
    name: string,
    evals: Array<{ name: string; fn: EvalFunction }>
  ): Promise<EvalSuite> {
    const results: EvalResult[] = [];

    for (const eval_ of evals) {
      const result = await this.runEval(eval_.name, eval_.fn);
      results.push(result);
    }

    const summary = {
      total: results.length,
      passed: results.filter(r => r.passed).length,
      failed: results.filter(r => !r.passed).length,
      avgScore: results.reduce((sum, r) => sum + r.score, 0) / results.length,
    };

    return {
      name,
      results,
      summary,
    };
  }

  /**
   * Print evaluation suite results to console
   */
  printReport(suite: EvalSuite): void {
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`📊 Evaluation Suite: ${suite.name}`);
    console.log(`${'═'.repeat(60)}\n`);

    for (const result of suite.results) {
      const status = result.passed ? '✅' : '❌';
      console.log(`${status} ${result.name}`);
      console.log(`   Score: ${(result.score * 100).toFixed(1)}%`);

      const metricsStr = Object.entries(result.metrics)
        .map(([key, value]) => `${key}: ${(value * 100).toFixed(0)}%`)
        .join(' | ');

      if (metricsStr) {
        console.log(`   ${metricsStr}`);
      }

      if (result.errors.length > 0) {
        console.log(`   Errors: ${result.errors.join('; ')}`);
      }

      console.log(`   Duration: ${result.duration}ms\n`);
    }

    console.log(`${'═'.repeat(60)}`);
    console.log(`📈 Summary:`);
    console.log(`   Total: ${suite.summary.total}`);
    console.log(`   Passed: ${suite.summary.passed}`);
    console.log(`   Failed: ${suite.summary.failed}`);
    console.log(`   Avg Score: ${(suite.summary.avgScore * 100).toFixed(1)}%`);
    console.log(`${'═'.repeat(60)}\n`);
  }
}
