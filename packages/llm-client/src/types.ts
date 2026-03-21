/**
 * LLM Client types
 *
 * Unified interface for multiple LLM providers
 */

/**
 * Supported LLM providers
 */
export type LLMProvider = 'openai' | 'claude';

/**
 * LLM configuration
 */
export interface LLMConfig {
  provider: LLMProvider;
  apiKey?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

/**
 * Chat message
 */
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * LLM response
 */
export interface LLMResponse {
  content: string;
  provider: LLMProvider;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason?: string;
}

/**
 * JSON mode configuration
 */
export interface JSONModeConfig {
  enabled: boolean;
  schema?: object;
}

/**
 * LLM Client interface
 */
export interface LLMClient {
  /**
   * Send a chat completion request
   */
  chat(
    messages: ChatMessage[],
    options?: {
      temperature?: number;
      maxTokens?: number;
      jsonMode?: JSONModeConfig;
    }
  ): Promise<LLMResponse>;

  /**
   * Get provider name
   */
  getProvider(): LLMProvider;

  /**
   * Get model name
   */
  getModel(): string;

  /**
   * Check if client is configured
   */
  isConfigured(): boolean;
}

/**
 * LLM Error types
 */
export enum LLMErrorType {
  API_KEY_MISSING = 'API_KEY_MISSING',
  RATE_LIMIT = 'RATE_LIMIT',
  INVALID_REQUEST = 'INVALID_REQUEST',
  MODEL_NOT_FOUND = 'MODEL_NOT_FOUND',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  CONTENT_FILTERED = 'CONTENT_FILTERED',
  UNKNOWN = 'UNKNOWN',
}

/**
 * LLM Error
 */
export class LLMError extends Error {
  constructor(
    public type: LLMErrorType,
    message: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'LLMError';
  }
}

/**
 * Default configurations
 */
export const DEFAULT_CONFIGS = {
  openai: {
    model: 'gpt-4o',
    temperature: 0.7,
    maxTokens: 4096,
    retryAttempts: 3,
    retryDelay: 1000,
  },
  claude: {
    model: 'claude-sonnet-4-6-20250514',
    temperature: 0.7,
    maxTokens: 4096,
    retryAttempts: 3,
    retryDelay: 1000,
  },
};
