/**
 * E2E Golden Test
 *
 * Runs Orchestrator against golden specs and evaluates output
 */

import { Orchestrator } from '@loom/orchestrator';
import { evaluateCodeGenOutput } from './evaluators/code-generator-eval';
import { HarnessRunner } from './harness';
import type { GameSpec } from '@loom/core';
import * as fs from 'fs';
import * as path from 'path';

const GOLDEN_SPECS_DIR = path.join(__dirname, '../data/golden-specs');
const BASELINE_FILE = path.join(__dirname, '../data/baseline.json');

/**
 * Run E2E golden tests
 *
 * For each golden GameSpec:
 * 1. Generate code via Orchestrator
 * 2. Evaluate with code-gen evaluator
 * 3. Compare against baseline (if exists)
 * 4. Output report
 */
async function runGoldenTests() {
  console.log('\n🧪 Running E2E Golden Tests...\n');

  const orchestrator = new Orchestrator({
    enableAssetResolution: true,
  });

  const specFiles = fs.readdirSync(GOLDEN_SPECS_DIR)
    .filter(f => f.endsWith('.json'));

  console.log(`Found ${specFiles.length} golden specs:\n`);
  specFiles.forEach(f => console.log(`  - ${f}`));
  console.log('');

  const runner = new HarnessRunner();
  const evals: Array<{ name: string; fn: () => Promise<any> }> = [];

  for (const file of specFiles) {
    const specPath = path.join(GOLDEN_SPECS_DIR, file);
    const gameSpec: GameSpec = JSON.parse(
      fs.readFileSync(specPath, 'utf-8')
    );

    evals.push({
      name: gameSpec.meta.title,
      fn: async () => {
        console.log(`\n📋 Testing: ${gameSpec.meta.title}`);

        // Generate
        const output = await orchestrator.generate({ gameSpec });

        // Extract MainScene
        const sceneFile = output.codeOutput.files.find(
          f => f.path.includes('MainScene')
        );

        if (!sceneFile) {
          console.log('  ❌ No MainScene generated\n');
          return {
            name: gameSpec.meta.title,
            passed: false,
            score: 0,
            metrics: {},
            errors: ['No MainScene generated'],
            duration: 0,
          };
        }

        // Evaluate
        const evalResult = await evaluateCodeGenOutput(
          sceneFile.content,
          gameSpec
        );

        console.log(`  ${evalResult.passed ? '✅' : '❌'} Score: ${(evalResult.score * 100).toFixed(1)}%`);
        console.log(
          `     Structure: ${(evalResult.metrics['structure']! * 100).toFixed(0)}%`
          + ` | Spec: ${(evalResult.metrics['specCoverage']! * 100).toFixed(0)}%`
          + ` | Safety: ${(evalResult.metrics['safety']! * 100).toFixed(0)}%`
          + ` | Quality: ${(evalResult.metrics['quality']! * 100).toFixed(0)}%`
        );

        if (evalResult.errors.length > 0) {
          console.log(`     Errors: ${evalResult.errors.slice(0, 3).join('; ')}`);
        }

        return evalResult;
      },
    });
  }

  // Run all evaluations
  const suite = await runner.runSuite('Golden Test Suite', evals);

  // Print report
  runner.printReport(suite);

  // Save baseline
  const baseline = {
    timestamp: new Date().toISOString(),
    avgScore: suite.summary.avgScore,
    passRate: suite.summary.passed / suite.summary.total,
    results: suite.results.map(r => ({
      name: r.name,
      score: r.score,
      passed: r.passed,
    })),
  };

  fs.writeFileSync(BASELINE_FILE, JSON.stringify(baseline, null, 2));
  console.log('💾 Baseline saved to data/baseline.json\n');

  // Exit with error code if any test failed
  if (suite.summary.failed > 0) {
    process.exit(1);
  }
}

// Run tests
runGoldenTests().catch(error => {
  console.error('❌ Test runner error:', error);
  process.exit(1);
});
