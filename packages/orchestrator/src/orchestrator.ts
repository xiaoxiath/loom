/**
 * Loom Orchestrator
 *
 * Standard pipeline orchestration:
 * NL → IntentParser → GameSpec → Planner → Graphs
 *   → AssetResolver → AdapterBindings → CodeGenerator → Output
 */

import type { GameSpec, AdapterBinding } from '@loom/core';
import type { IntentParserAgent, IntentParseResult } from '@loom/intent-parser';
import { createPlanner, type PlannerConfig } from '@loom/planner';
import { createCodeGenerator, type CodeGeneratorConfig } from '@loom/code-generator';
import type { CodeGeneratorInput } from '@loom/code-generator';
import { AssetResolver } from '@loom/asset-resolver';
import type { ResolvedAsset } from '@loom/asset-resolver';
import {
  createDefaultRegistry,
  generateAdapterBindings,
} from '@loom/runtime-adapter';
import { CodeReviewAgent } from '@loom/code-review';

import type {
  OrchestratorConfig,
  OrchestratorInput,
  OrchestratorOutput,
  PipelineDiagnostics,
} from './types';

/**
 * Validate that a value looks like a valid GameSpec at runtime.
 * Checks that all required top-level fields exist and have sensible types.
 *
 * Q-10: Replaces unsafe `as GameSpec` cast with runtime verification.
 * H-11: Provides inter-stage schema validation.
 */
function assertGameSpec(value: unknown): asserts value is GameSpec {
  if (typeof value !== 'object' || value === null) {
    throw new Error('GameSpec validation failed: value is not an object');
  }

  const obj = value as Record<string, unknown>;
  const requiredFields: Array<{ key: string; type: string }> = [
    { key: 'meta', type: 'object' },
    { key: 'settings', type: 'object' },
    { key: 'scene', type: 'object' },
    { key: 'entities', type: 'object' },   // Array.isArray checked below
    { key: 'systems', type: 'object' },     // array
    { key: 'mechanics', type: 'object' },   // array
  ];

  const errors: string[] = [];

  for (const { key, type } of requiredFields) {
    if (!(key in obj)) {
      errors.push(`Missing required field "${key}"`);
    } else if (typeof obj[key] !== type) {
      errors.push(`Field "${key}" must be of type ${type}, got ${typeof obj[key]}`);
    }
  }

  if ('entities' in obj && !Array.isArray(obj.entities)) {
    errors.push('Field "entities" must be an array');
  }
  if ('systems' in obj && !Array.isArray(obj.systems)) {
    errors.push('Field "systems" must be an array');
  }
  if ('mechanics' in obj && !Array.isArray(obj.mechanics)) {
    errors.push('Field "mechanics" must be an array');
  }

  // Validate meta sub-fields
  if (typeof obj.meta === 'object' && obj.meta !== null) {
    const meta = obj.meta as Record<string, unknown>;
    if (typeof meta.title !== 'string' || meta.title.length === 0) {
      errors.push('Field "meta.title" must be a non-empty string');
    }
    if (typeof meta.genre !== 'string') {
      errors.push('Field "meta.genre" must be a string');
    }
  }

  if (errors.length > 0) {
    throw new Error(
      `GameSpec validation failed:\n  - ${errors.join('\n  - ')}`
    );
  }
}

/**
 * Orchestrator
 *
 * Central coordinator for the entire game generation pipeline
 */
export class Orchestrator {
  private config: OrchestratorConfig;
  private intentParser?: IntentParserAgent;

  constructor(
    config: OrchestratorConfig = {},
    intentParser?: IntentParserAgent
  ) {
    this.config = {
      enableIntentParser: true,
      enableAssetResolution: true,
      enableAdapterBindings: true,
      ...config,
    };
    if (intentParser) {
      this.intentParser = intentParser;
    }
  }

  /**
   * Execute the complete game generation pipeline
   */
  async generate(input: OrchestratorInput): Promise<OrchestratorOutput> {
    const totalStart = Date.now();
    let gameSpec: GameSpec;
    let intentResult: IntentParseResult | undefined;

    // ── Stage 1: Intent Parsing ──
    if (input.prompt && this.intentParser && this.config.enableIntentParser) {
      intentResult = await this.intentParser.parse({ text: input.prompt });

      // Q-10: Runtime validation instead of bare `as GameSpec` cast
      assertGameSpec(intentResult.spec);
      gameSpec = intentResult.spec;
    } else if (input.gameSpec) {
      gameSpec = input.gameSpec;
    } else {
      throw new Error(
        'Either prompt (with IntentParser configured) or gameSpec must be provided'
      );
    }

    // H-11: Validate GameSpec before passing to planner
    assertGameSpec(gameSpec);

    // ── Stage 2: Planning ──
    const planStart = Date.now();
    const plannerConfig: PlannerConfig = {};
    if (this.config.llmClient) {
      plannerConfig.llmClient = this.config.llmClient;
    }
    const planner = createPlanner(plannerConfig);
    const planResult = await planner.plan(gameSpec);
    const planTime = Date.now() - planStart;

    // H-11: Validate planner output has required graph fields
    if (!planResult.sceneGraph || !planResult.entityGraph || !planResult.componentGraph || !planResult.systemGraph) {
      throw new Error(
        'Planner output validation failed: missing one or more required graphs '
          + '(sceneGraph, entityGraph, componentGraph, systemGraph)'
      );
    }

    // ── Stage 3: Asset Resolution (optional) ──
    const assetStart = Date.now();
    let resolvedAssets: ResolvedAsset[] | undefined;
    if (this.config.enableAssetResolution !== false) {
      const assetResolver = new AssetResolver();
      const assetResult = await assetResolver.resolveFromGameSpec(gameSpec);
      resolvedAssets = assetResult.resolved;
    }
    const assetTime = Date.now() - assetStart;

    // ── Stage 4: Adapter Binding ──
    let adapterBindings: AdapterBinding[] = [];
    if (this.config.enableAdapterBindings !== false) {
      const registry = createDefaultRegistry();
      adapterBindings = generateAdapterBindings(
        planResult.componentGraph,
        gameSpec,
        registry
      );
    }

    // ── Stage 5: Code Generation ──
    const codeStart = Date.now();
    const codeGeneratorConfig: CodeGeneratorConfig = {
      useFewShot: true,
      fallbackToTemplate: true,
    };
    if (this.config.enableLLMCodeGen !== false && this.config.llmClient) {
      codeGeneratorConfig.llmClient = this.config.llmClient;
    }
    const codeGenerator = createCodeGenerator(codeGeneratorConfig);
    const codeInput: CodeGeneratorInput = {
      gameSpec,
      sceneGraph: planResult.sceneGraph,
      entityGraph: planResult.entityGraph,
      componentGraph: planResult.componentGraph,
      systemGraph: planResult.systemGraph,
      adapterBindings,
      ...(resolvedAssets && { resolvedAssets }),
    };
    const codeOutput = await codeGenerator.generate(codeInput);
    const codeTime = Date.now() - codeStart;

    // H-11: Validate code generator output
    if (!codeOutput.files || !Array.isArray(codeOutput.files) || codeOutput.files.length === 0) {
      throw new Error('Code generation validation failed: no files were generated');
    }

    // ── Stage 6: Code Review (NEW) ──
    // Q-09: Track code review time in diagnostics
    const reviewStart = Date.now();
    let finalCodeOutput = codeOutput;
    let reviewResult;

    if (this.config.llmClient && this.config.enableCodeReview !== false) {
      const reviewer = new CodeReviewAgent(this.config.llmClient, {
        autoFix: true,
        maxFixRounds: 2,
      });

      // H-12: Review ALL generated files, not just MainScene
      const reviewedFiles = [...codeOutput.files];

      for (let i = 0; i < codeOutput.files.length; i++) {
        const file = codeOutput.files[i]!;
        const fileReview = await reviewer.review(file, gameSpec);

        // Keep the last review result for diagnostics (or accumulate)
        reviewResult = fileReview;

        // If there's fixed code, replace the original file
        if (fileReview.fixedCode) {
          reviewedFiles[i] = { ...file, content: fileReview.fixedCode };
        }
      }

      finalCodeOutput = {
        ...codeOutput,
        files: reviewedFiles,
      };
    }

    // Q-09: Record code review elapsed time
    const reviewTime = Date.now() - reviewStart;

    // ── Build Diagnostics ──
    const diagnostics: PipelineDiagnostics = {
      planningTimeMs: planTime,
      assetResolutionTimeMs: assetTime,
      codeGenerationTimeMs: codeTime,
      codeReviewTimeMs: reviewTime,
      totalTimeMs: Date.now() - totalStart,
    };

    // Add intent result if available
    if (intentResult) {
      diagnostics.intentParsing = intentResult;
    }

    // Add code review result if available
    if (reviewResult) {
      diagnostics.codeReview = reviewResult;
    }

    return {
      gameSpec,
      codeOutput: finalCodeOutput,
      diagnostics,
    };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<OrchestratorConfig>): void {
    this.config = {
      ...this.config,
      ...newConfig,
    };
  }

  /**
   * Get current configuration
   */
  getConfig(): OrchestratorConfig {
    return { ...this.config };
  }
}

/**
 * Factory function to create Orchestrator instance
 */
export function createOrchestrator(
  config?: OrchestratorConfig,
  intentParser?: IntentParserAgent
): Orchestrator {
  return new Orchestrator(config, intentParser);
}
