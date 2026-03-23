/**
 * Orchestrator types
 */

import type { GameSpec } from '@loom/core';
import type { IntentParseResult } from '@loom/intent-parser';
import type { CodeGeneratorOutput } from '@loom/code-generator';
import type { LLMClient } from '@loom/llm-client';
import type { ReviewResult } from '@loom/code-review';

/**
 * Orchestrator configuration
 */
export interface OrchestratorConfig {
  /** Enable Intent Parser (skip NL parsing when no LLM) */
  enableIntentParser?: boolean;
  /** Enable Asset Resolution */
  enableAssetResolution?: boolean;
  /** Enable Adapter Binding generation */
  enableAdapterBindings?: boolean;
  /** LLM client for code generation */
  llmClient?: LLMClient;
  /** Whether to enable LLM-based code generation */
  enableLLMCodeGen?: boolean;
  /** Whether to enable code review */
  enableCodeReview?: boolean;
}

/**
 * Orchestrator input (choose one)
 */
export interface OrchestratorInput {
  /** Natural language input (full pipeline) */
  prompt?: string;
  /** Direct GameSpec input (skip Intent Parser) */
  gameSpec?: GameSpec;
}

/**
 * Orchestrator output
 */
export interface OrchestratorOutput {
  /** Final GameSpec */
  gameSpec: GameSpec;
  /** Generated code output */
  codeOutput: CodeGeneratorOutput;
  /** Pipeline diagnostics */
  diagnostics: PipelineDiagnostics;
}

/**
 * Pipeline diagnostics
 */
export interface PipelineDiagnostics {
  /** Intent parsing result (if prompt was used) */
  intentParsing?: IntentParseResult;
  /** Planning time in milliseconds */
  planningTimeMs: number;
  /** Asset resolution time in milliseconds */
  assetResolutionTimeMs: number;
  /** Code generation time in milliseconds */
  codeGenerationTimeMs: number;
  /** Code review time in milliseconds */
  codeReviewTimeMs?: number;
  /** Total pipeline time in milliseconds */
  totalTimeMs: number;
  /** Code review result (if enabled) */
  codeReview?: ReviewResult;
}

// Re-export for convenience
export type { CodeGeneratorOutput } from '@loom/code-generator';

