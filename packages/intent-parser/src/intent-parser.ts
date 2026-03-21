/**
 * Intent Parser Agent
 *
 * Converts natural language descriptions into structured GameSpec JSON
 */

import type { LLMClient, ChatMessage, LLMResponse } from '@loom/llm-client';
import type {
  UserPrompt,
  IntentParseResult,
  IntentParserConfig,
  IntentDiagnostics,
  ValidationResult,
} from './types';
import { INTENT_PARSER_SYSTEM_PROMPT } from './prompts/system-prompt';
import {
  FEW_SHOT_EXAMPLES,
  formatFewShotExamples,
} from './prompts/examples';
import { normalizePrompt, type NormalizedPrompt } from './normalizer';
import { repairSpec, type RepairRule } from './repair-engine';

/**
 * Intent Parser Agent
 *
 * Converts natural language to GameSpec using LLM with constrained decoding
 */
export class IntentParserAgent {
  private llmClient: LLMClient;
  private useExamples: boolean;
  private customRepairRules: RepairRule[];

  constructor(config: IntentParserConfig) {
    this.llmClient = config.llmClient;
    this.useExamples = config.useExamples ?? true;
    this.customRepairRules = [];
    // Store config options for future use
    // maxRetries: config.maxRetries ?? 3;
    // validateOutput: config.validateOutput ?? true;
  }

  /**
   * Add custom repair rule
   */
  addRepairRule(rule: RepairRule): void {
    this.customRepairRules.push(rule);
  }

  /**
   * Parse natural language prompt into GameSpec
   */
  async parse(prompt: UserPrompt): Promise<IntentParseResult> {
    const startTime = Date.now();

    // Stage 1: Normalize prompt
    const normalizedPrompt = normalizePrompt(prompt.text);

    // Stage 2: Build messages for LLM
    const messages = this.buildMessages(normalizedPrompt);

    // Stage 3: Call LLM with JSON mode
    const response = await this.callLLM(messages);

    // Stage 4: Parse response
    let spec = this.parseResponse(response.content);

    // Stage 5: Semantic repair
    const { spec: repairedSpec, repairs } = repairSpec(spec, this.customRepairRules);
    spec = repairedSpec;

    // Stage 6: Validate spec
    const validation = this.validateSpec(spec);

    // Stage 7: Calculate confidence
    const confidence = this.calculateConfidence(spec, validation);

    // Stage 8: Extract assumptions and missing slots
    const assumptions = this.extractAssumptions(spec);
    const missingSlots = this.extractMissingSlots(spec);

    // Build diagnostics
    const diagnostics: IntentDiagnostics = {
      promptLength: prompt.text.length,
      processingTime: Date.now() - startTime,
      repairCount: repairs.length,
      llmProvider: response.provider,
      llmModel: response.model,
      ...(response.usage && {
        tokensUsed: {
          prompt: response.usage.promptTokens,
          completion: response.usage.completionTokens,
          total: response.usage.totalTokens,
        },
      }),
    };

    return {
      spec,
      confidence,
      assumptions,
      missingSlots,
      diagnostics,
    };
  }

  /**
   * Build messages array for LLM
   */
  private buildMessages(prompt: NormalizedPrompt): ChatMessage[] {
    const messages: ChatMessage[] = [];

    // System message
    let systemContent = INTENT_PARSER_SYSTEM_PROMPT;

    // Add few-shot examples if enabled
    if (this.useExamples) {
      systemContent += '\n\n## Examples\n\n';
      systemContent += formatFewShotExamples(FEW_SHOT_EXAMPLES);
    }

    messages.push({
      role: 'system',
      content: systemContent,
    });

    // User message - use normalized prompt
    messages.push({
      role: 'user',
      content: prompt.normalized,
    });

    return messages;
  }

  /**
   * Call LLM with JSON mode
   */
  private async callLLM(messages: ChatMessage[]): Promise<LLMResponse> {
    if (!this.llmClient.isConfigured()) {
      throw new Error('LLM client is not configured. Please set API keys.');
    }

    const response = await this.llmClient.chat(messages, {
      jsonMode: { enabled: true },
      temperature: 0.7,
      maxTokens: 4000,
    });

    return response;
  }

  /**
   * Parse LLM response into GameSpec
   */
  private parseResponse(content: string): any {
    try {
      const spec = JSON.parse(content);
      return spec;
    } catch (error) {
      throw new Error(`Failed to parse LLM response as JSON: ${error}`);
    }
  }

  /**
   * Validate GameSpec
   */
  private validateSpec(spec: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required fields
    if (!spec.meta) errors.push('Missing required field: meta');
    if (!spec.settings) errors.push('Missing required field: settings');
    if (!spec.scene) errors.push('Missing required field: scene');
    if (!spec.entities) errors.push('Missing required field: entities');
    if (!spec.systems) errors.push('Missing required field: systems');
    if (!spec.mechanics) errors.push('Missing required field: mechanics');

    // Check for player entity
    if (spec.entities && Array.isArray(spec.entities)) {
      const hasPlayer = spec.entities.some((e: any) => e.type === 'player');
      if (!hasPlayer) errors.push('No player entity found');
    }

    // Check component dependencies
    if (spec.entities && Array.isArray(spec.entities)) {
      for (const entity of spec.entities) {
        if (entity.components && entity.components.includes('jump')) {
          if (!spec.settings?.gravity) {
            warnings.push('Jump component requires gravity in settings');
          }
          if (!spec.mechanics?.includes('gravity')) {
            warnings.push('Jump component requires gravity in mechanics');
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(
    spec: any,
    validation: ValidationResult
  ): number {
    let confidence = 1.0;

    // Reduce confidence for each error
    confidence -= validation.errors.length * 0.2;

    // Reduce confidence for each warning
    confidence -= validation.warnings.length * 0.05;

    // Check for missing optional fields
    if (!spec.scoring) confidence -= 0.05;
    if (!spec.ui) confidence -= 0.05;
    if (!spec.assets || spec.assets.length === 0) confidence -= 0.05;

    // Clamp to 0-1
    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * Extract assumptions made during parsing
   */
  private extractAssumptions(spec: any): string[] {
    const assumptions: string[] = [];

    // Check for auto-filled fields
    if (spec.scene?.cameraFollow === 'player') {
      assumptions.push('cameraFollow(player)');
    }

    if (spec.scoring?.type === 'distance') {
      assumptions.push('defaultScoring(distance)');
    }

    if (!spec.assets || spec.assets.length === 0) {
      assumptions.push('placeholderAssets()');
    }

    return assumptions;
  }

  /**
   * Extract missing information slots
   */
  private extractMissingSlots(spec: any): string[] {
    const missing: string[] = [];

    if (!spec.scoring) {
      missing.push('scoring');
    }

    if (!spec.assets || spec.assets.length === 0) {
      missing.push('assets');
    }

    if (!spec.ui?.hud || spec.ui.hud.length === 0) {
      missing.push('ui.hud');
    }

    return missing;
  }
}
