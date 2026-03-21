/**
 * End-to-End Integration Test
 *
 * Tests the complete workflow:
 * GameSpec → Planner → Graphs → Code Generator → Phaser Project
 */

import { planner } from '@loom/planner';
import { codeGenerator } from '@loom/code-generator';
import flappyBird from '../../examples/01-flappy-bird.json';
import spaceRunner from '../../examples/02-space-runner.json';
import galacticShooter from '../../examples/03-galactic-shooter.json';
import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = path.join(__dirname, '../../output');

console.log('🎮 Loom End-to-End Integration Test\n');
console.log('=' .repeat(60));
console.log();

// Test all three examples
const testCases = [
  { name: 'Flappy Bird', spec: flappyBird },
  { name: 'Space Runner', spec: spaceRunner },
  { name: 'Galactic Shooter', spec: galacticShooter },
];

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

for (const testCase of testCases) {
  console.log(`\n📋 Testing: ${testCase.name}`);
  console.log('-'.repeat(60));

  try {
    // Step 1: Plan the game
    console.log('\n✨ Step 1: Planning game from GameSpec...');
    const planResult = planner.plan(testCase.spec);

    console.log(`   ✓ Generated SceneGraph with ${planResult.sceneGraph.scenes.length} scene(s)`);
    console.log(`   ✓ Generated EntityGraph with ${planResult.entityGraph.nodes.length} entities`);
    console.log(`   ✓ Generated ComponentGraph`);
    console.log(`   ✓ Generated SystemGraph with ${planResult.systemGraph.systems.length} systems`);

    if (planResult.diagnostics.warnings.length > 0) {
      console.log(`   ⚠️  Warnings: ${planResult.diagnostics.warnings.length}`);
      planResult.diagnostics.warnings.forEach(w => console.log(`      - ${w}`));
    }

    if (planResult.diagnostics.autoFixes.length > 0) {
      console.log(`   🔧 Auto-fixes: ${planResult.diagnostics.autoFixes.length}`);
      planResult.diagnostics.autoFixes.forEach(f => console.log(`      - ${f}`));
    }

    // Step 2: Generate code
    console.log('\n🏗️  Step 2: Generating Phaser code...');
    const output = codeGenerator.generate({
      gameSpec: testCase.spec,
      sceneGraph: planResult.sceneGraph,
      entityGraph: planResult.entityGraph,
      componentGraph: planResult.componentGraph,
      systemGraph: planResult.systemGraph,
      adapterBindings: [],
    });

    console.log(`   ✓ Generated ${output.files.length} files:`);
    output.files.forEach(file => {
      const size = (file.content.length / 1024).toFixed(2);
      console.log(`      - ${file.path} (${size} KB)`);
    });

    // Step 3: Validate generated code
    console.log('\n🔍 Step 3: Validating generated code...');

    // Check for required files
    const requiredFiles = [
      'package.json',
      'index.html',
      'src/main.ts',
      'src/config.ts',
      'src/scenes/MainScene.ts',
    ];

    const filePaths = output.files.map(f => f.path);
    for (const required of requiredFiles) {
      if (filePaths.includes(required)) {
        console.log(`   ✓ Found ${required}`);
      } else {
        throw new Error(`Missing required file: ${required}`);
      }
    }

    // Check package.json
    const packageJsonFile = output.files.find(f => f.path === 'package.json');
    if (packageJsonFile) {
      const packageJson = JSON.parse(packageJsonFile.content);
      console.log(`   ✓ Package name: ${packageJson.name}`);
      console.log(`   ✓ Phaser version: ${packageJson.dependencies.phaser}`);
    }

    // Check MainScene.ts
    const mainSceneFile = output.files.find(f => f.path === 'src/scenes/MainScene.ts');
    if (mainSceneFile) {
      const hasClass = mainSceneFile.content.includes('class MainScene');
      const hasCreate = mainSceneFile.content.includes('create()');
      const hasUpdate = mainSceneFile.content.includes('update(');

      if (hasClass && hasCreate && hasUpdate) {
        console.log(`   ✓ MainScene has class, create, and update methods`);
      } else {
        throw new Error('MainScene missing required methods');
      }
    }

    // Step 4: Write files to disk (for manual testing)
    const outputDir = path.join(OUTPUT_DIR, testCase.spec.meta.title.toLowerCase().replace(/\s+/g, '-'));

    console.log(`\n💾 Step 4: Writing files to ${outputDir}...`);
    for (const file of output.files) {
      const filePath = path.join(outputDir, file.path);
      const dir = path.dirname(filePath);

      // Create directory if it doesn't exist
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(filePath, file.content);
    }
    console.log(`   ✓ Written ${output.files.length} files`);

    // Step 5: Check dependencies
    console.log('\n📦 Step 5: Checking dependencies...');
    const deps = Object.entries(output.dependencies);
    console.log(`   ✓ Found ${deps.length} dependencies:`);
    deps.forEach(([name, version]) => {
      console.log(`      - ${name}@${version}`);
    });

    console.log(`\n✅ ${testCase.name}: PASSED`);
    passedTests++;
  } catch (error) {
    console.log(`\n❌ ${testCase.name}: FAILED`);
    console.log(`   Error: ${error}`);
    failedTests++;
  }

  totalTests++;
  console.log();
}

// Final summary
console.log('=' .repeat(60));
console.log('\n📊 Test Summary\n');
console.log(`Total Tests:  ${totalTests}`);
console.log(`Passed:       ${passedTests} ✅`);
console.log(`Failed:       ${failedTests} ${failedTests > 0 ? '❌' : ''}`);
console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
console.log();

if (failedTests === 0) {
  console.log('🎉 All tests passed! The Loom pipeline is working correctly.\n');
  console.log('Next steps:');
  console.log('1. cd output/flappy-bird');
  console.log('2. pnpm install');
  console.log('3. pnpm dev');
  console.log('4. Open browser to play the game!\n');
  process.exit(0);
} else {
  console.log('⚠️  Some tests failed. Please check the errors above.\n');
  process.exit(1);
}
