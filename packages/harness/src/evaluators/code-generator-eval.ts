/**
 * Code Generator evaluator
 *
 * Evaluates generated Phaser.js code quality across 4 dimensions
 */

import type { EvalResult } from '../types';
import type { GameSpec } from '@loom/core';

/**
 * Normalize an entity ID into likely code variable names.
 * Handles dash-separated IDs (e.g., "pipe-top" -> ["pipe_top", "pipeTop", "pipetop"]).
 */
function entityIdVariants(entityId: string): string[] {
  const variants: string[] = [entityId];

  // snake_case: replace dashes with underscores
  const snakeCase = entityId.replace(/-/g, '_');
  variants.push(snakeCase);

  // camelCase: pipe-top -> pipeTop
  const camelCase = entityId.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
  variants.push(camelCase);

  // lowercase concatenated: pipe-top -> pipetop
  variants.push(entityId.replace(/-/g, '').toLowerCase());

  return [...new Set(variants)];
}

/**
 * Check if any variant of an entity ID appears in the code.
 */
function entityFoundInCode(entityId: string, code: string): boolean {
  const variants = entityIdVariants(entityId);
  return variants.some(v => code.includes(v));
}

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
    { name: 'has-preload', test: () => /preload\s*\(/.test(generatedCode) },
    { name: 'has-create', test: () => /create\s*\(/.test(generatedCode) },
    { name: 'has-update', test: () => /update\s*\(/.test(generatedCode) },
    {
      name: 'has-import-or-reference',
      test: () =>
        generatedCode.includes("import Phaser") ||
        generatedCode.includes("from 'phaser'") ||
        generatedCode.includes('Phaser.Scene') ||
        generatedCode.includes('Phaser.Physics'),
    },
  ];

  const structureScore = structureChecks.filter(c => c.test()).length / structureChecks.length;
  metrics['structure'] = structureScore;

  for (const check of structureChecks) {
    if (!check.test()) errors.push(`Missing: ${check.name}`);
  }

  // ── Dimension 2: Spec Coverage (0.3) ──
  let specCoverage = 0;
  let specTotal = 0;

  // Check each entity appears in code (using flexible matching)
  for (const entity of gameSpec.entities) {
    specTotal++;
    if (entityFoundInCode(entity.id, generatedCode)) {
      specCoverage++;
    } else {
      // Also check if the sprite name appears (some generators use sprite key)
      if (entity.sprite && generatedCode.includes(entity.sprite)) {
        specCoverage++;
      } else {
        errors.push(`Entity "${entity.id}" not found in generated code`);
      }
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
    if (generatedCode.includes('score') || generatedCode.includes('Score')) {
      specCoverage++;
    } else {
      errors.push('Scoring not implemented');
    }
  }

  // Check input handling
  const hasInputEntities = gameSpec.entities.some(e =>
    e.components.includes('keyboardInput')
  );
  if (hasInputEntities) {
    specTotal++;
    if (
      generatedCode.includes('keyboard') ||
      generatedCode.includes('cursors') ||
      generatedCode.includes('input')
    ) {
      specCoverage++;
    } else {
      errors.push('No keyboard input handling found');
    }
  }

  metrics['specCoverage'] = specTotal > 0 ? specCoverage / specTotal : 1;

  // ── Dimension 3: Runtime Safety (0.2) ──
  const safetyChecks = [
    {
      name: 'no-bare-keyboard',
      test: () =>
        !generatedCode.includes('this.input.keyboard.')
        || generatedCode.includes('this.input.keyboard?.')
        || generatedCode.includes('this.input.keyboard!')
    },
    {
      name: 'group-used-for-non-player',
      test: () => {
        const hasNonPlayer = gameSpec.entities.some(e => e.type !== 'player');
        return !hasNonPlayer
          || generatedCode.includes('Group')
          || generatedCode.includes('group');
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
    {
      name: 'no-per-frame-key-creation',
      test: () => {
        // Ensure createCursorKeys is not called inside update()
        const updateMatch = generatedCode.match(/update\s*\([^)]*\)\s*\{([\s\S]*?)(?=\n  \w|\n\})/);
        if (!updateMatch) return true;
        const updateBody = updateMatch[1] || '';
        // It's OK if createCursorKeys appears but is guarded by a cache check
        return !updateBody.includes('createCursorKeys') || updateBody.includes('this.cursors');
      }
    },
  ];

  const safetyScore = safetyChecks.filter(c => c.test()).length / safetyChecks.length;
  metrics['safety'] = safetyScore;

  // ── Dimension 4: Code Quality (0.2) ──
  const qualityChecks = [
    {
      name: 'has-type-annotations',
      test: () =>
        generatedCode.includes(': Phaser.')
        || generatedCode.includes(': number')
        || generatedCode.includes(': string')
    },
    { name: 'has-comments', test: () => generatedCode.includes('//') },
    { name: 'uses-const-or-let', test: () => generatedCode.includes('const ') || generatedCode.includes('let ') },
    {
      name: 'proper-indentation',
      test: () => generatedCode.includes('    ') || generatedCode.includes('\t')
    },
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
    passed: weightedScore >= 0.7 && metrics['structure']! >= 0.8,
    score: weightedScore,
    metrics,
    errors,
    duration: 0, // Will be set by HarnessRunner
  };
}
