/**
 * End-to-End Integration Test
 *
 * Tests the pipeline:
 * Natural Language → Intent Parser → GameSpec → Planner → Graphs
 */

import { IntentParserAgent } from './intent-parser';
import { createMockLLMClient } from '@loom/llm-client';
import { PlannerAgent } from '@loom/planner';
import * as fs from 'fs';
import * as path from 'path';

interface E2ETestResult {
  success: boolean;
  prompt: string;
  gameSpec: any;
  planResult: any;
  errors: string[];
  timing: {
    parsing: number;
    planning: number;
    total: number;
  };
}

async function runE2ETest(prompt: string): Promise<E2ETestResult> {
  const errors: string[] = [];
  const startTime = Date.now();

  try {
    // Step 1: Intent Parsing (Natural Language → GameSpec)
    console.log('\n📝 Step 1: Parsing natural language...');
    const parseStartTime = Date.now();

    const mockGameSpec = {
      meta: {
        title: 'Flappy Bird Clone',
        genre: 'jumper',
        camera: 'side',
        dimension: '2D',
        version: '1.0',
      },
      settings: {
        gravity: 980,
        backgroundColor: '#87CEEB',
        worldWidth: 1920,
        worldHeight: 1080,
      },
      scene: {
        type: 'single',
        cameraFollow: 'player',
        spawn: { x: 200, y: 400 },
      },
      entities: [
        {
          id: 'player',
          type: 'player',
          sprite: 'bird_sprite',
          position: { x: 200, y: 400 },
          physics: { gravity: true, collidable: true },
          components: ['jump', 'health'],
        },
        {
          id: 'pipe_top',
          type: 'obstacle',
          sprite: 'pipe_sprite',
          position: { x: 800, y: 100 },
          physics: { gravity: false, collidable: true },
          components: [],
        },
        {
          id: 'pipe_bottom',
          type: 'obstacle',
          sprite: 'pipe_sprite',
          position: { x: 800, y: 700 },
          physics: { gravity: false, collidable: true },
          components: [],
        },
      ],
      systems: ['physics', 'collision', 'input', 'spawn'],
      mechanics: ['jump', 'gravity', 'collision', 'avoid'],
      scoring: { type: 'distance', increment: 1 },
      ui: { hud: ['score'], startScreen: true, gameOverScreen: true },
      assets: [],
      extensions: {},
    };

    const mockClient = createMockLLMClient(JSON.stringify(mockGameSpec));
    const parser = new IntentParserAgent({
      llmClient: mockClient,
      useExamples: true,
    });

    const parseResult = await parser.parse({ text: prompt });
    const parseTime = Date.now() - parseStartTime;

    console.log(`   ✓ Parsed in ${parseTime}ms`);
    console.log(`   ✓ Confidence: ${parseResult.confidence.toFixed(2)}`);
    console.log(`   ✓ Repairs: ${parseResult.diagnostics.repairCount}`);

    // Step 2: Planning (GameSpec → Graphs)
    console.log('\n📊 Step 2: Planning game structure...');
    const planStartTime = Date.now();

    const planner = new PlannerAgent();
    const planResult = planner.plan(parseResult.spec);
    const planTime = Date.now() - planStartTime;

    console.log(`   ✓ Planned in ${planTime}ms`);
    console.log(`   ✓ Entities: ${planResult.entityGraph.nodes.length}`);
    console.log(`   ✓ Systems: ${planResult.systemGraph.systems.length}`);
    console.log(`   ✓ Auto-fixes: ${planResult.diagnostics.autoFixes.length}`);

    const totalTime = Date.now() - startTime;

    console.log(`\n✅ E2E Test Complete!`);
    console.log(`   Total time: ${totalTime}ms`);

    return {
      success: true,
      prompt,
      gameSpec: parseResult.spec,
      planResult,
      errors,
      timing: {
        parsing: parseTime,
        planning: planTime,
        total: totalTime,
      },
    };
  } catch (error: any) {
    errors.push(error.message);
    console.error(`\n❌ E2E Test Failed: ${error.message}`);

    return {
      success: false,
      prompt,
      gameSpec: null,
      planResult: null,
      errors,
      timing: {
        parsing: 0,
        planning: 0,
        total: Date.now() - startTime,
      },
    };
  }
}

/**
 * Main test runner
 */
async function main() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║     End-to-End Integration Test - Loom Game Platform     ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');

  const testPrompts = [
    'Create a Flappy Bird-style game where a bird jumps between pipes',
    // Add more test prompts as needed
  ];

  const results: E2ETestResult[] = [];

  for (const prompt of testPrompts) {
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`Testing: "${prompt}"`);
    console.log('═'.repeat(60));

    const result = await runE2ETest(prompt);
    results.push(result);
  }

  // Summary
  console.log('\n\n' + '═'.repeat(60));
  console.log('📊 Test Summary');
  console.log('═'.repeat(60));

  const passed = results.filter((r) => r.success).length;
  const failed = results.length - passed;

  console.log(`Total Tests: ${results.length}`);
  console.log(`Passed: ${passed} ✅`);
  console.log(`Failed: ${failed} ${failed > 0 ? '❌' : ''}`);

  if (results.length > 0) {
    const avgTime = results.reduce((sum, r) => sum + r.timing.total, 0) / results.length;
    console.log(`Average Time: ${avgTime.toFixed(0)}ms`);
  }

  console.log('═'.repeat(60));

  // Exit with error code if any tests failed
  if (failed > 0) {
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { runE2ETest };
