/**
 * @loom/llm-client
 *
 * Unified LLM client for Loom game generation platform
 */

// Core types
export type {
  LLMClient,
  LLMConfig,
  ChatMessage,
  LLMResponse,
  JSONModeConfig,
} from './types';

export { LLMError, LLMErrorType, DEFAULT_CONFIGS } from './types';

// Client implementations
export { OpenAIClient } from './openai-client';
export { ClaudeClient } from './claude-client';

// Factory functions
export {
  createLLMClient,
  createLLMClientFromEnv,
  createMockLLMClient,
} from './factory';
