/**
 * Type definitions for Intent Parser Agent
 */

import type { GameSpec } from '@loom/core';
import type { RepairRule } from './repair-engine';

/**
 * User prompt input
 */
export interface UserPrompt {
  text: string;
  locale?: string;
  platform?: string;
  difficulty?: string;
  targetEngine?: string;
}

/**
 * Intent Parser result
 */
export interface IntentParseResult {
  spec: GameSpec;
  confidence: number;
  assumptions: string[];
  missingSlots: string[];
  diagnostics: IntentDiagnostics;
}

/**
 * Diagnostic information
 */
export interface IntentDiagnostics {
  promptLength: number;
  processingTime: number;
  repairCount: number;
  llmProvider: string;
  llmModel: string;
  tokensUsed?: {
    prompt: number;
    completion: number;
    total: number;
  };
}

/**
 * Intent Parser configuration
 */
export interface IntentParserConfig {
  llmClient: any; // LLMClient from @loom/llm-client
  useExamples?: boolean;
  maxRetries?: number;
  validateOutput?: boolean;
  /** Custom repair rules. When provided and non-empty, replaces built-in rules. */
  customRepairRules?: RepairRule[];
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  warnings: string[];
  errors: string[];
}
