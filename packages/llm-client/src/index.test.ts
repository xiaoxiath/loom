/**
 * Tests for LLM Client
 */

import { createLLMClient, LLMError, LLMErrorType } from '../src';
import { OpenAIClient } from '../src/openai-client';
import { ClaudeClient } from '../src/claude-client';

describe('LLM Client Factory', () => {
  it('should create OpenAI client', () => {
    const client = createLLMClient({
      provider: 'openai',
      apiKey: 'test-key',
    });

    expect(client).toBeInstanceOf(OpenAIClient);
    expect(client.getProvider()).toBe('openai');
    expect(client.isConfigured()).toBe(true);
  });

  it('should create Claude client', () => {
    const client = createLLMClient({
      provider: 'claude',
      apiKey: 'test-key',
    });

    expect(client).toBeInstanceOf(ClaudeClient);
    expect(client.getProvider()).toBe('claude');
    expect(client.isConfigured()).toBe(true);
  });

  it('should throw error for unsupported provider', () => {
    expect(() =>
      createLLMClient({
        provider: 'unsupported' as any,
        apiKey: 'test-key',
      })
    ).toThrow();
  });

  it('should create unconfigured client without API key', () => {
    const client = createLLMClient({
      provider: 'openai',
    });

    expect(client.isConfigured()).toBe(false);
  });
});

describe('OpenAI Client', () => {
  it('should use default model when not specified', () => {
    const client = new OpenAIClient({
      provider: 'openai',
      apiKey: 'test-key',
    });

    expect(client.getModel()).toBe('gpt-4o');
  });

  it('should use custom model when specified', () => {
    const client = new OpenAIClient({
      provider: 'openai',
      apiKey: 'test-key',
      model: 'gpt-4',
    });

    expect(client.getModel()).toBe('gpt-4');
  });

  it('should throw error when not configured', async () => {
    const client = new OpenAIClient({
      provider: 'openai',
    });

    await expect(client.chat([])).rejects.toThrow(LLMError);
    await expect(client.chat([])).rejects.toHaveProperty('type', LLMErrorType.API_KEY_MISSING);
  });
});

describe('Claude Client', () => {
  it('should use default model when not specified', () => {
    const client = new ClaudeClient({
      provider: 'claude',
      apiKey: 'test-key',
    });

    expect(client.getModel()).toBe('claude-sonnet-4-6-20250514');
  });

  it('should use custom model when specified', () => {
    const client = new ClaudeClient({
      provider: 'claude',
      apiKey: 'test-key',
      model: 'claude-3-opus-20240229',
    });

    expect(client.getModel()).toBe('claude-3-opus-20240229');
  });

  it('should throw error when not configured', async () => {
    const client = new ClaudeClient({
      provider: 'claude',
    });

    await expect(client.chat([])).rejects.toThrow(LLMError);
    await expect(client.chat([])).rejects.toHaveProperty('type', LLMErrorType.API_KEY_MISSING);
  });
});

describe('LLM Error', () => {
  it('should create error with type and message', () => {
    const error = new LLMError(
      LLMErrorType.RATE_LIMIT,
      'Rate limit exceeded'
    );

    expect(error.type).toBe(LLMErrorType.RATE_LIMIT);
    expect(error.message).toBe('Rate limit exceeded');
    expect(error.name).toBe('LLMError');
  });

  it('should include original error', () => {
    const originalError = new Error('Original');
    const error = new LLMError(
      LLMErrorType.UNKNOWN,
      'Wrapped error',
      originalError
    );

    expect(error.originalError).toBe(originalError);
  });
});
