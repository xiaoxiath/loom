/**
 * OpenAI Client
 *
 * Implements LLMClient interface for OpenAI API
 */

import OpenAI from 'openai';
import type {
  LLMClient,
  LLMConfig,
  ChatMessage,
  LLMResponse,
  JSONModeConfig,
} from './types';
import { LLMError, LLMErrorType, DEFAULT_CONFIGS } from './types';

export class OpenAIClient implements LLMClient {
  private client: OpenAI | null = null;
  private config: Required<Omit<LLMConfig, 'apiKey'>> & { apiKey?: string };

  constructor(config: LLMConfig) {
    this.config = {
      ...DEFAULT_CONFIGS.openai,
      ...config,
    } as Required<Omit<LLMConfig, 'apiKey'>> & { apiKey?: string };

    if (this.config.apiKey) {
      this.client = new OpenAI({
        apiKey: this.config.apiKey,
      });
    }
  }

  async chat(
    messages: ChatMessage[],
    options?: {
      temperature?: number;
      maxTokens?: number;
      jsonMode?: JSONModeConfig;
    }
  ): Promise<LLMResponse> {
    if (!this.client) {
      throw new LLMError(
        LLMErrorType.API_KEY_MISSING,
        'OpenAI API key not configured'
      );
    }

    const temperature = options?.temperature ?? this.config.temperature;
    const maxTokens = options?.maxTokens ?? this.config.maxTokens;
    const jsonMode = options?.jsonMode;

    try {
      const response = await this.retryOperation(async () => {
        const requestParams: OpenAI.Chat.ChatCompletionCreateParams = {
          model: this.config.model,
          messages: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          temperature,
          max_tokens: maxTokens,
        };

        // Enable JSON mode
        if (jsonMode?.enabled) {
          requestParams.response_format = { type: 'json_object' };
        }

        return await this.client!.chat.completions.create(requestParams);
      });

      const choice = response.choices[0];
      if (!choice || !choice.message) {
        throw new LLMError(
          LLMErrorType.INVALID_REQUEST,
          'No response from OpenAI'
        );
      }

      return {
        content: choice.message.content || '',
        provider: 'openai',
        model: this.config.model,
        ...(response.usage && {
          usage: {
            promptTokens: response.usage.prompt_tokens,
            completionTokens: response.usage.completion_tokens,
            totalTokens: response.usage.total_tokens,
          },
        }),
        finishReason: choice.finish_reason,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  getProvider(): 'openai' {
    return 'openai';
  }

  getModel(): string {
    return this.config.model;
  }

  isConfigured(): boolean {
    return this.client !== null;
  }

  /**
   * Retry operation with exponential backoff
   */
  private async retryOperation<T>(
    operation: () => Promise<T>,
    attempt: number = 1
  ): Promise<T> {
    try {
      return await operation();
    } catch (error: any) {
      if (attempt >= this.config.retryAttempts) {
        throw error;
      }

      // Check if error is retryable
      if (this.isRetryableError(error)) {
        const delay = this.config.retryDelay * Math.pow(2, attempt - 1);
        await this.sleep(delay);
        return this.retryOperation(operation, attempt + 1);
      }

      throw error;
    }
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: any): boolean {
    if (error.status === 429) return true; // Rate limit
    if (error.status >= 500) return true; // Server error
    if (error.code === 'ECONNRESET') return true; // Network error
    if (error.code === 'ETIMEDOUT') return true; // Timeout
    return false;
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Handle and transform errors
   */
  private handleError(error: any): LLMError {
    if (error instanceof LLMError) {
      return error;
    }

    if (error.status === 401) {
      return new LLMError(
        LLMErrorType.API_KEY_MISSING,
        'Invalid OpenAI API key',
        error
      );
    }

    if (error.status === 429) {
      return new LLMError(
        LLMErrorType.RATE_LIMIT,
        'OpenAI rate limit exceeded',
        error
      );
    }

    if (error.status === 404) {
      return new LLMError(
        LLMErrorType.MODEL_NOT_FOUND,
        `Model ${this.config.model} not found`,
        error
      );
    }

    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return new LLMError(
        LLMErrorType.NETWORK_ERROR,
        'Network error connecting to OpenAI',
        error
      );
    }

    if (error.code === 'ETIMEDOUT') {
      return new LLMError(
        LLMErrorType.TIMEOUT,
        'Request to OpenAI timed out',
        error
      );
    }

    return new LLMError(
      LLMErrorType.UNKNOWN,
      `OpenAI error: ${error.message}`,
      error
    );
  }
}
