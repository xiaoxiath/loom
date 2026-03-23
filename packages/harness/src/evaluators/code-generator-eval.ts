/**
 * Code Generator evaluator
 *
 * Evaluates generated Phaser.js code quality across 4 dimensions
 */

import type { EvalResult } from '../types';
import type { GameSpec } from '@loom/core';

/**
 * Evaluate Code Generator output quality
 *
 * Scoring dimensions:
 * 1. Structure integrity (0.3) - necessary classes/methods/imports exist
 * 2. Spec coverage (0.3) - GameSpec entities/components/systems have corresponding code
 * 3. Runtime safety (0.2) - no obvious runtime errors
 * 4. Code quality (0.2) - type annotations, null-safe, naming conventions
 */
export async function evaluateCodeGenOutput(
  generatedCode: string,
  gameSpec: GameSpec
): Promise<EvalResult> {
  const metrics: Record<string, number> = {};
  const errors: string[] = [];

  // ── Dimension 1: Structure Integrity (0.3) ──
  const structureChecks = [
    { name: 'has-class', test: () => generatedCode.includes('class MainScene') },
    { name: 'extends-scene', test: () => generatedCode.includes('extends Phaser.Scene') },
    { name: 'has-preload', test: () => generatedCode.includes('preload()') },
    { name: 'has-create', test: () => generatedCode.includes('create()') },
    { name: 'has-update', test: () => generatedCode.includes('update(') },
    { name: 'has-import', test: () => generatedCode.includes("import Phaser") || generatedCode.includes("from 'phaser'") },
  ];

  const structureScore = structureChecks.filter(c => c.test()).length / structureChecks.length;
  metrics['structure'] = structureScore;

  for (const check of structureChecks) {
    if (!check.test()) errors.push(`Missing: ${check.name}`);
  }

  // ── Dimension 2: Spec Coverage (0.3) ──
  let specCoverage = 0;
  let specTotal = 0;

  // Check each entity appears in code
  for (const entity of gameSpec.entities) {
    specTotal++;
    const varName = entity.id.replace(/-/g, '_');
    if (generatedCode.includes(varName)) {
      specCoverage++;
    } else {
      errors.push(`Entity "${entity.id}" not found in generated code`);
    }
  }

  // Check collision setup
  const collidableEntities = gameSpec.entities.filter(e => e.physics?.collidable);
  if (collidableEntities.length > 1) {
    specTotal++;
    if (generatedCode.includes('add.collider') || generatedCode.includes('add.overlap')) {
      specCoverage++;
    } else {
      errors.push('No collision setup found despite collidable entities');
    }
  }

  // Check scoring
  if (gameSpec.scoring) {
    specTotal++;
    if (generatedCode.includes('score')) {
      specCoverage++;
    } else {
      errors.push('Scoring not implemented');
    }
  }

  metrics['specCoverage'] = specTotal > 0 ? specCoverage / specTotal : 1;

  // ── Dimension 3: Runtime Safety (0.2) ──
  const safetyChecks = [
    {
      name: 'no-bare-keyboard',
      test: () => !generatedCode.includes('this.input.keyboard.')
        || generatedCode.includes('this.input.keyboard?.')
    },
    {
      name: 'group-used-for-non-player',
      test: () => {
        const hasNonPlayer = gameSpec.entities.some(e => e.type !== 'player');
        return !hasNonPlayer || generatedCode.includes('Group');
      }
    },
    {
      name: 'has-null-checks',
      test: () => {
        // Check for optional chaining or null checks
        return generatedCode.includes('?.')
          || generatedCode.includes('if (')
          || generatedCode.includes('&&');
      }
    },
  ];

  const safetyScore = safetyChecks.filter(c => c.test()).length / safetyChecks.length;
  metrics['safety'] = safetyScore;

  // ── Dimension 4: Code Quality (0.2) ──
  const qualityChecks = [
    { name: 'has-type-annotations', test: () => generatedCode.includes(': Phaser.') },
    { name: 'has-comments', test: () => generatedCode.includes('//') },
    { name: 'uses-const', test: () => generatedCode.includes('const ') },
    { name: 'proper-indentation', test: () => generatedCode.includes('    ') }, // 4-space indent
  ];

  const qualityScore = qualityChecks.filter(c => c.test()).length / qualityChecks.length;
  metrics['quality'] = qualityScore;

  // ── Calculate weighted score ──
  const weightedScore =
    metrics['structure']! * 0.3 +
    metrics['specCoverage']! * 0.3 +
    metrics['safety']! * 0.2 +
    metrics['quality']! * 0.2;

  return {
    name: `code-gen-eval:${gameSpec.meta.title}`,
    passed: weightedScore >= 0.7 && metrics['structure']! === 1.0,
    score: weightedScore,
    metrics,
    errors,
    duration: 0, // Will be set by HarnessRunner
  };
}
