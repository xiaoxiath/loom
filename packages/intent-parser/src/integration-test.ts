/**
 * Integration Test Script
 *
 * End-to-end testing: Natural Language → GameSpec
 */

import { IntentParserAgent } from '../src/intent-parser';
import { createLLMClientFromEnv, LLMError, LLMErrorType } from '@loom/llm-client';
import { TEST_PROMPTS, type TestPrompt } from './test-dataset';
import * as fs from 'fs';
import * as path from 'path';

interface TestResult {
  prompt: TestPrompt;
  success: boolean;
  confidence: number;
  repairCount: number;
  processingTime: number;
  error?: string;
  spec?: any;
}

interface TestReport {
  timestamp: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  averageConfidence: number;
  averageProcessingTime: number;
  totalRepairs: number;
  results: TestResult[];
  summary: {
    byGameType: Record<string, { total: number; passed: number; avgConfidence: number }>;
    byDifficulty: Record<string, { total: number; passed: number; avgConfidence: number }>;
  };
}

/**
 * Run integration tests
 */
async function runTests(
  prompts: TestPrompt[],
  options: { verbose?: boolean; saveResults?: boolean } = {}
): Promise<TestReport> {
  const { verbose = false, saveResults = true } = options;

  console.log('🚀 Starting Integration Tests...\n');
  console.log(`Total prompts: ${prompts.length}\n`);

  // Check LLM client configuration
  let llmClient;
  try {
    llmClient = createLLMClientFromEnv();
    console.log(`✅ LLM Client configured: ${llmClient.getProvider()} (${llmClient.getModel()})\n`);
  } catch (error) {
    console.error('❌ LLM Client not configured. Please set API keys:');
    console.error('   - OPENAI_API_KEY or');
    console.error('   - ANTHROPIC_API_KEY\n');
    process.exit(1);
  }

  const parser = new IntentParserAgent({
    llmClient,
    useExamples: true,
  });

  const results: TestResult[] = [];
  const startTime = Date.now();

  // Run tests
  for (let i = 0; i < prompts.length; i++) {
    const prompt = prompts[i];
    console.log(`[${i + 1}/${prompts.length}] Testing: ${prompt.id}`);
    console.log(`  Prompt: "${prompt.text}"`);

    try {
      const result = await parser.parse({ text: prompt.text });

      const success = result.confidence >= 0.7 && result.spec.meta?.genre === prompt.expectedGameType;

      const testResult: TestResult = {
        prompt,
        success,
        confidence: result.confidence,
        repairCount: result.diagnostics.repairCount,
        processingTime: result.diagnostics.processingTime,
        spec: result.spec,
      };

      results.push(testResult);

      if (success) {
        console.log(`  ✅ PASSED (confidence: ${result.confidence.toFixed(2)}, repairs: ${result.diagnostics.repairCount})`);
      } else {
        console.log(`  ❌ FAILED (confidence: ${result.confidence.toFixed(2)}, expected: ${prompt.expectedGameType}, got: ${result.spec.meta?.genre})`);
      }

      if (verbose) {
        console.log(`  Assumptions: ${result.assumptions.join(', ')}`);
        console.log(`  Missing slots: ${result.missingSlots.join(', ')}`);
      }
    } catch (error: any) {
      const testResult: TestResult = {
        prompt,
        success: false,
        confidence: 0,
        repairCount: 0,
        processingTime: 0,
        error: error.message,
      };

      results.push(testResult);

      console.log(`  ❌ ERROR: ${error.message}`);
    }

    console.log('');
  }

  const totalTime = Date.now() - startTime;

  // Calculate statistics
  const passedTests = results.filter((r) => r.success).length;
  const failedTests = results.length - passedTests;
  const averageConfidence =
    results.reduce((sum, r) => sum + r.confidence, 0) / results.length;
  const averageProcessingTime =
    results.reduce((sum, r) => sum + r.processingTime, 0) / results.length;
  const totalRepairs = results.reduce((sum, r) => sum + r.repairCount, 0);

  // Group by game type
  const byGameType: Record<string, { total: number; passed: number; avgConfidence: number }> = {};
  for (const result of results) {
    const type = result.prompt.expectedGameType;
    if (!byGameType[type]) {
      byGameType[type] = { total: 0, passed: 0, avgConfidence: 0 };
    }
    byGameType[type].total++;
    if (result.success) byGameType[type].passed++;
    byGameType[type].avgConfidence += result.confidence;
  }
  for (const type in byGameType) {
    byGameType[type].avgConfidence /= byGameType[type].total;
  }

  // Group by difficulty
  const byDifficulty: Record<string, { total: number; passed: number; avgConfidence: number }> = {};
  for (const result of results) {
    const difficulty = result.prompt.difficulty;
    if (!byDifficulty[difficulty]) {
      byDifficulty[difficulty] = { total: 0, passed: 0, avgConfidence: 0 };
    }
    byDifficulty[difficulty].total++;
    if (result.success) byDifficulty[difficulty].passed++;
    byDifficulty[difficulty].avgConfidence += result.confidence;
  }
  for (const difficulty in byDifficulty) {
    byDifficulty[difficulty].avgConfidence /= byDifficulty[difficulty].total;
  }

  // Build report
  const report: TestReport = {
    timestamp: new Date().toISOString(),
    totalTests: results.length,
    passedTests,
    failedTests,
    averageConfidence,
    averageProcessingTime,
    totalRepairs,
    results,
    summary: { byGameType, byDifficulty },
  };

  // Print summary
  console.log('═'.repeat(60));
  console.log('📊 Test Summary');
  console.log('═'.repeat(60));
  console.log(`Total Tests:        ${report.totalTests}`);
  console.log(`Passed:             ${report.passedTests} (${((report.passedTests / report.totalTests) * 100).toFixed(1)}%)`);
  console.log(`Failed:             ${report.failedTests}`);
  console.log(`Average Confidence: ${report.averageConfidence.toFixed(2)}`);
  console.log(`Average Time:       ${report.averageProcessingTime.toFixed(0)}ms`);
  console.log(`Total Repairs:      ${report.totalRepairs}`);
  console.log(`Total Time:         ${(totalTime / 1000).toFixed(1)}s`);
  console.log('');

  console.log('By Game Type:');
  for (const type in report.summary.byGameType) {
    const stats = report.summary.byGameType[type];
    console.log(`  ${type.padEnd(10)} ${stats.passed}/${stats.total} passed, avg confidence: ${stats.avgConfidence.toFixed(2)}`);
  }
  console.log('');

  console.log('By Difficulty:');
  for (const difficulty in report.summary.byDifficulty) {
    const stats = report.summary.byDifficulty[difficulty];
    console.log(`  ${difficulty.padEnd(10)} ${stats.passed}/${stats.total} passed, avg confidence: ${stats.avgConfidence.toFixed(2)}`);
  }
  console.log('═'.repeat(60));

  // Save results
  if (saveResults) {
    const reportsDir = path.join(__dirname, '../../reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const reportPath = path.join(reportsDir, `integration-test-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Report saved to: ${reportPath}`);
  }

  return report;
}

/**
 * Main entry point
 */
async function main() {
  const args = process.argv.slice(2);
  const testSubset = args[0] || 'all';

  let prompts: TestPrompt[];

  switch (testSubset) {
    case 'easy':
      prompts = TEST_PROMPTS.filter((p) => p.difficulty === 'easy');
      break;
    case 'jumper':
      prompts = TEST_PROMPTS.filter((p) => p.expectedGameType === 'jumper');
      break;
    case 'runner':
      prompts = TEST_PROMPTS.filter((p) => p.expectedGameType === 'runner');
      break;
    case 'shooter':
      prompts = TEST_PROMPTS.filter((p) => p.expectedGameType === 'shooter');
      break;
    case 'quick':
      prompts = TEST_PROMPTS.slice(0, 5);
      break;
    default:
      prompts = TEST_PROMPTS;
  }

  const report = await runTests(prompts, { verbose: true });

  // Exit with error code if too many failures
  if (report.passedTests / report.totalTests < 0.7) {
    console.error('\n❌ Too many test failures (< 70% pass rate)');
    process.exit(1);
  }

  console.log('\n✅ Integration tests completed successfully!');
}

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { runTests };
