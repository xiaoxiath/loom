/**
 * Loom Orchestrator
 *
 * Standard pipeline orchestration:
 * NL → IntentParser → GameSpec → Planner → Graphs
 *   → AssetResolver → AdapterBindings → CodeGenerator → Output
 */

import type { GameSpec, AdapterBinding } from '@loom/core';
import type { IntentParserAgent, IntentParseResult } from '@loom/intent-parser';
import { createPlanner } from '@loom/planner';
import { createCodeGenerator } from '@loom/code-generator';
import type { CodeGeneratorInput } from '@loom/code-generator';
import { AssetResolver } from '@loom/asset-resolver';
import type { ResolvedAsset } from '@loom/asset-resolver';
import {
  createDefaultRegistry,
  generateAdapterBindings,
} from '@loom/runtime-adapter';

import type {
  OrchestratorConfig,
  OrchestratorInput,
  OrchestratorOutput,
  PipelineDiagnostics,
} from './types';

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
      gameSpec = intentResult.spec as GameSpec;
    } else if (input.gameSpec) {
      gameSpec = input.gameSpec;
    } else {
      throw new Error(
        'Either prompt (with IntentParser configured) or gameSpec must be provided'
      );
    }

    // ── Stage 2: Planning ──
    const planStart = Date.now();
    const planner = createPlanner();
    const planResult = planner.plan(gameSpec);
    const planTime = Date.now() - planStart;

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
    const codeGenerator = createCodeGenerator();
    const codeInput: CodeGeneratorInput = {
      gameSpec,
      sceneGraph: planResult.sceneGraph,
      entityGraph: planResult.entityGraph,
      componentGraph: planResult.componentGraph,
      systemGraph: planResult.systemGraph,
      adapterBindings,
      ...(resolvedAssets && { resolvedAssets }),
    };
    const codeOutput = codeGenerator.generate(codeInput);
    const codeTime = Date.now() - codeStart;

    // ── Build Diagnostics ──
    const diagnostics: PipelineDiagnostics = {
      planningTimeMs: planTime,
      assetResolutionTimeMs: assetTime,
      codeGenerationTimeMs: codeTime,
      totalTimeMs: Date.now() - totalStart,
    };

    // Add intent result if available
    if (intentResult) {
      diagnostics.intentParsing = intentResult;
    }

    return {
      gameSpec,
      codeOutput,
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
