/**
 * Test planner with example GameSpecs
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { planner } from '../src/planner';

console.log('🧪 Testing Planner with Example GameSpecs\n');

// Load examples
const examples = [
  '01-flappy-bird.json',
  '02-space-runner.json',
  '03-galactic-shooter.json',
];

for (const example of examples) {
  console.log(`📄 Testing ${example}...\n`);

  try {
    const path = join(__dirname, '../../../examples', example);
    const content = readFileSync(path, 'utf-8');
    const spec = JSON.parse(content);

    const result = planner.plan(spec);

    console.log(`  ✅ SceneGraph: ${result.sceneGraph.scenes.length} scene(s)`);
    console.log(`  ✅ EntityGraph: ${result.entityGraph.nodes.length} entities`);
    console.log(
      `  ✅ ComponentGraph: ${Object.keys(result.componentGraph.entityComponents).length} entity bindings`
    );
    console.log(`  ✅ SystemGraph: ${result.systemGraph.systems.length} systems`);
    console.log(`  ✅ Diagnostics:`);
    console.log(`     - Warnings: ${result.diagnostics.warnings.length}`);
    console.log(`     - AutoFixes: ${result.diagnostics.autoFixes.length}`);
    console.log(`     - Inferred: ${result.diagnostics.inferredNodes.length}`);

    if (result.diagnostics.inferredNodes.length > 0) {
      console.log(`  📝 Inferred nodes:`);
      result.diagnostics.inferredNodes.slice(0, 3).forEach((node) => {
        console.log(`     - ${node}`);
      });
    }

    console.log('\n');
  } catch (error) {
    console.log(`  ❌ Error: ${error}\n`);
  }
}

console.log('✅ All tests completed!');
