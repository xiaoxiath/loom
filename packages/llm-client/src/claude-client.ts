/**
 * Claude (Anthropic) LLM Client
 *
 * Implements LLMClient interface for Anthropic's Claude API
 */

import Anthropic from '@anthropic-ai/sdk';
import type { LLMClient, LLMConfig, ChatMessage, LLMResponse } from './types';
import { LLMError, LLMErrorType, DEFAULT_CONFIGS } from './types';
import { retryWithBackoff, isRetryableError } from './utils/retry';

/**
 * Claude LLM Client
 */
export class ClaudeClient implements LLMClient {
  private client: Anthropic | null = null;
  private config: Required<Omit<LLMConfig, 'apiKey'>> & { apiKey?: string };

  constructor(config: LLMConfig) {
    this.config = {
      ...DEFAULT_CONFIGS.claude,
      ...config,
    } as Required<Omit<LLMConfig, 'apiKey'>> & { apiKey?: string };

    if (this.config.apiKey) {
      this.client = new Anthropic({
        apiKey: this.config.apiKey,
      });
    }
  }

  async chat(
    messages: ChatMessage[],
    options?: {
      temperature?: number;
      maxTokens?: number;
      jsonMode?: { enabled: boolean };
    }
  ): Promise<LLMResponse> {
    if (!this.client) {
      throw new LLMError(
        LLMErrorType.API_KEY_MISSING,
        'Claude API key not configured'
      );
    }

    const temperature = options?.temperature ?? this.config.temperature;
    const maxTokens = options?.maxTokens ?? this.config.maxTokens;
    const jsonMode = options?.jsonMode;

    try {
      const response = await retryWithBackoff(
        async () => {
          const systemMessage = messages.find((m) => m.role === 'system');
          const conversationMessages = messages.filter((m) => m.role !== 'system');

          // H-07: When jsonMode is enabled, append JSON output instructions to the
          // system prompt. Claude does not have a native response_format parameter
          // like OpenAI, so we guide it via the system prompt instead.
          let systemContent = systemMessage?.content ?? '';
          if (jsonMode?.enabled) {
            systemContent +=
              '\n\nIMPORTANT: You MUST respond with valid JSON only. '
              + 'Do not include any text, explanation, or markdown formatting outside the JSON object. '
              + 'Your entire response must be a single, valid JSON object.';
          }

          const requestParams: Anthropic.Messages.MessageCreateParams = {
            model: this.config.model,
            max_tokens: maxTokens,
            messages: conversationMessages.map((m) => ({
              role: m.role as 'user' | 'assistant',
              content: m.content,
            })),
            temperature,
          };

          if (systemContent) {
            requestParams.system = systemContent;
          }

          return await this.client!.messages.create(requestParams);
        },
        {
          maxAttempts: this.config.retryAttempts,
          delayMs: this.config.retryDelay,
          isRetryable: isRetryableError,
        }
      );

      // Extract text from content blocks
      const textContent = response.content
        .filter((block) => block.type === 'text')
        .map((block) => (block as Anthropic.Messages.TextBlock).text)
        .join('');

      return {
        content: textContent,
        provider: 'claude',
        model: response.model,
        usage: {
          promptTokens: response.usage.input_tokens,
          completionTokens: response.usage.output_tokens,
          totalTokens: response.usage.input_tokens + response.usage.output_tokens,
        },
        finishReason: response.stop_reason || 'stop',
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  getProvider(): 'claude' {
    return 'claude';
  }

  getModel(): string {
    return this.config.model;
  }

  isConfigured(): boolean {
    return this.client !== null;
  }

  private handleError(error: any): LLMError {
    // H-08: If the error is already an LLMError, return it as-is
    // (matches the guard in openai-client.ts)
    if (error instanceof LLMError) {
      return error;
    }

    // API key error
    if (error.status === 401 || error.message?.includes('api key')) {
      return new LLMError(
        LLMErrorType.API_KEY_MISSING,
        'Invalid Claude API key',
        error
      );
    }

    // Rate limit
    if (error.status === 429) {
      return new LLMError(
        LLMErrorType.RATE_LIMIT,
        'Claude rate limit exceeded',
        error
      );
    }

    // Content filtered
    if (
      error.message?.includes('content_filter') ||
      error.message?.includes('safety')
    ) {
      return new LLMError(
        LLMErrorType.CONTENT_FILTERED,
        'Content filtered by Claude safety system',
        error
      );
    }

    // Invalid request
    if (error.status === 400) {
      return new LLMError(
        LLMErrorType.INVALID_REQUEST,
        `Invalid request to Claude: ${error.message}`,
        error
      );
    }

    // Model not found
    if (error.status === 404) {
      return new LLMError(
        LLMErrorType.MODEL_NOT_FOUND,
        `Model ${this.config.model} not found`,
        error
      );
    }

    // Network errors
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return new LLMError(
        LLMErrorType.NETWORK_ERROR,
        'Network error connecting to Claude',
        error
      );
    }

    if (error.code === 'ETIMEDOUT') {
      return new LLMError(
        LLMErrorType.TIMEOUT,
        'Request to Claude timed out',
        error
      );
    }

    return new LLMError(
      LLMErrorType.UNKNOWN,
      `Claude error: ${error.message}`,
      error
    );
  }
}
