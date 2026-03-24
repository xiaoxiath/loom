/**
 * LLM Client factory
 *
 * Creates LLM client instances based on configuration
 */

import type { LLMClient, LLMConfig, LLMProvider } from './types';
import { OpenAIClient } from './openai-client';
import { ClaudeClient } from './claude-client';
import { LLMError, LLMErrorType } from './types';

/**
 * Create an LLM client instance
 */
export function createLLMClient(config: LLMConfig): LLMClient {
  switch (config.provider) {
    case 'openai':
      return new OpenAIClient(config);

    case 'claude':
      return new ClaudeClient(config);

    default:
      throw new LLMError(
        LLMErrorType.INVALID_REQUEST,
        `Unknown LLM provider: ${(config as any).provider}`
      );
  }
}

/**
 * Create an LLM client from environment variables
 */
export function createLLMClientFromEnv(): LLMClient {
  // Try OpenAI first
  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
    const config: LLMConfig = {
      provider: 'openai',
      apiKey: openaiKey,
    };

    if (process.env.OPENAI_MODEL) config.model = process.env.OPENAI_MODEL;
    if (process.env.OPENAI_TEMPERATURE)
      config.temperature = parseFloat(process.env.OPENAI_TEMPERATURE);
    if (process.env.OPENAI_MAX_TOKENS)
      config.maxTokens = parseInt(process.env.OPENAI_MAX_TOKENS, 10);

    return createLLMClient(config);
  }

  // Try Claude
  const claudeKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
  if (claudeKey) {
    const config: LLMConfig = {
      provider: 'claude',
      apiKey: claudeKey,
    };

    if (process.env.CLAUDE_MODEL) config.model = process.env.CLAUDE_MODEL;
    if (process.env.CLAUDE_TEMPERATURE)
      config.temperature = parseFloat(process.env.CLAUDE_TEMPERATURE);
    if (process.env.CLAUDE_MAX_TOKENS)
      config.maxTokens = parseInt(process.env.CLAUDE_MAX_TOKENS, 10);

    return createLLMClient(config);
  }

  throw new LLMError(
    LLMErrorType.API_KEY_MISSING,
    'No LLM API key found. Set OPENAI_API_KEY or ANTHROPIC_API_KEY environment variable.'
  );
}

/**
 * Options for creating a mock LLM client
 */
export interface MockLLMClientOptions {
  /** The provider to report. Defaults to 'openai'. */
  provider?: LLMProvider;
  /** The model name to report. Defaults to 'mock-model'. */
  model?: string;
}

/**
 * Create a mock LLM client for testing
 */
export function createMockLLMClient(
  responseContent: string = '{}',
  options: MockLLMClientOptions = {}
): LLMClient {
  const provider = options.provider ?? 'openai';
  const model = options.model ?? 'mock-model';

  return {
    async chat() {
      return {
        content: responseContent,
        provider,
        model,
        usage: {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
        },
        finishReason: 'stop',
      };
    },
    getProvider() {
      return provider;
    },
    getModel() {
      return model;
    },
    isConfigured() {
      return true;
    },
  };
}
