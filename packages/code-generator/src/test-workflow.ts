/**
 * Test script demonstrating the complete workflow:
 * GameSpec → Planner → Graphs → Code Generator → Phaser Project
 */

import { planner } from '@loom/planner';
import { codeGenerator } from '@loom/code-generator';
import flappyBird from '../../../examples/01-flappy-bird.json';
import fs from 'fs';
import path from 'path';

const outputDir = path.join(__dirname, '../../../output/flappy-bird');

console.log('🎮 Loom Code Generation Demo\n');

// Step 1: Plan the game
console.log('Step 1: Planning game from GameSpec...');
const planResult = planner.plan(flappyBird);
console.log(`✅ Generated ${planResult.sceneGraph.scenes.length} scene(s)`);
console.log(`✅ Generated ${planResult.entityGraph.nodes.length} entities`);
console.log(`✅ Diagnostics: ${planResult.diagnostics.autoFixes.length} auto-fixes\n`);

// Step 2: Generate code
console.log('Step 2: Generating Phaser code...');
const output = codeGenerator.generate({
  gameSpec: flappyBird,
  sceneGraph: planResult.sceneGraph,
  entityGraph: planResult.entityGraph,
  componentGraph: planResult.componentGraph,
  systemGraph: planResult.systemGraph,
  adapterBindings: [],
});

console.log(`✅ Generated ${output.files.length} files:`);
output.files.forEach(file => {
  console.log(`   - ${file.path} (${file.type})`);
});
console.log();

// Step 3: Write files (in a real scenario)
console.log('Step 3: File output');
console.log(`Output directory: ${outputDir}`);
console.log('Files would be written:');
output.files.forEach(file => {
  console.log(`  ${file.path} (${file.content.length} bytes)`);
});
console.log();

// Step 4: Show diagnostics
console.log('Step 4: Diagnostics');
console.log(`Warnings: ${output.diagnostics.warnings.length}`);
console.log(`Errors: ${output.diagnostics.errors.length}`);
console.log(`Generated: ${output.diagnostics.generatedFiles.length}`);
console.log(`Skipped: ${output.diagnostics.skippedFiles.length}`);
console.log();

// Step 5: Show dependencies
console.log('Step 5: Dependencies');
const deps = Object.entries(output.dependencies);
console.log(`Found ${deps.length} dependencies:`);
deps.forEach(([name, version]) => {
  console.log(`  ${name}@${version}`);
});
console.log();

console.log('✨ Code generation complete!');
console.log('\nNext steps:');
console.log('1. Run: pnpm install');
console.log('2. Run: pnpm dev');
console.log('3. Open browser to play the game!');
