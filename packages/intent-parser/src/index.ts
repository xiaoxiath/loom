/**
 * Intent Parser Package
 *
 * Converts natural language descriptions into structured GameSpec JSON
 */

// Export main class
export { IntentParserAgent } from './intent-parser';

// Export types
export type {
  UserPrompt,
  IntentParseResult,
  IntentParserConfig,
  IntentDiagnostics,
  ValidationResult,
} from './types';

// Export prompts (for advanced usage)
export {
  INTENT_PARSER_SYSTEM_PROMPT,
  FEW_SHOT_EXAMPLES,
  formatFewShotExamples,
  type FewShotExample,
} from './prompts';

// Export normalizer
export { normalizePrompt, type NormalizedPrompt } from './normalizer';

// Export repair engine
export { repairSpec, REPAIR_RULES, type RepairRule } from './repair-engine';
