/**
 * Code generation prompts
 *
 * This module exports all prompt-related utilities for LLM-based code generation
 */

export {
  CODEGEN_SYSTEM_PROMPT,
  CODEGEN_TEMPERATURE,
  CODEGEN_MAX_TOKENS,
} from './system-prompt';

export {
  buildSceneGenerationPrompt,
  type SceneGenerationContext,
} from './scene-generation';

export { CODEGEN_FEW_SHOT } from './examples';
