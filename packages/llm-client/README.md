# @loom/llm-client

Unified LLM client for Loom game generation platform.

## Overview

This package provides a unified interface for multiple LLM providers (OpenAI and Claude), with automatic retry logic, error handling, and environment-based configuration.

## Installation

```bash
pnpm install @loom/llm-client
```

## Usage

### Basic Usage

```typescript
import { createLLMClient } from '@loom/llm-client';

// Create OpenAI client
const client = createLLMClient({
  provider: 'openai',
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4o',
});

// Create Claude client
const claudeClient = createLLMClient({
  provider: 'claude',
  apiKey: process.env.ANTHROPIC_API_KEY,
  model: 'claude-sonnet-4-6-20250514',
});

// Send chat message
const response = await client.chat([
  { role: 'system', content: 'You are a helpful assistant.' },
  { role: 'user', content: 'Hello!' },
]);

console.log(response.content);
```

### Environment Variables

Automatically detect and use API keys from environment:

```typescript
import { createLLMClientFromEnv } from '@loom/llm-client';

// Automatically uses OPENAI_API_KEY or ANTHROPIC_API_KEY
const client = createLLMClientFromEnv();
```

Environment variables:
- `OPENAI_API_KEY` - OpenAI API key
- `OPENAI_MODEL` - OpenAI model (default: gpt-4o)
- `OPENAI_TEMPERATURE` - Temperature (default: 0.7)
- `OPENAI_MAX_TOKENS` - Max tokens (default: 4096)
- `ANTHROPIC_API_KEY` or `CLAUDE_API_KEY` - Claude API key
- `CLAUDE_MODEL` - Claude model (default: claude-sonnet-4-6-20250514)
- `CLAUDE_TEMPERATURE` - Temperature (default: 0.7)
- `CLAUDE_MAX_TOKENS` - Max tokens (default: 4096)

### JSON Mode (OpenAI only)

Force structured JSON output:

```typescript
const response = await client.chat(
  [
    {
      role: 'system',
      content: 'You are a JSON generator. Always respond with valid JSON.',
    },
    { role: 'user', content: 'Generate a game config' },
  ],
  {
    jsonMode: { enabled: true, schema: mySchema },
  }
);

const config = JSON.parse(response.content);
```

### Error Handling

```typescript
import { LLMError, LLMErrorType } from '@loom/llm-client';

try {
  const response = await client.chat(messages);
} catch (error) {
  if (error instanceof LLMError) {
    switch (error.type) {
      case LLMErrorType.API_KEY_MISSING:
        console.error('API key not configured');
        break;
      case LLMErrorType.RATE_LIMIT:
        console.error('Rate limit exceeded, please retry');
        break;
      case LLMErrorType.CONTENT_FILTERED:
        console.error('Content filtered by safety system');
        break;
      default:
        console.error('LLM error:', error.message);
    }
  }
}
```

### Mock Client (Testing)

```typescript
import { createMockLLMClient } from '@loom/llm-client';

// Create mock client for testing
const mockClient = createMockLLMClient('{"status": "ok"}');

const response = await mockClient.chat([]);
console.log(response.content); // '{"status": "ok"}'
```

## API

### createLLMClient(config)

Create an LLM client instance.

**Parameters**:
- `config.provider` - 'openai' or 'claude'
- `config.apiKey` - API key (optional if using env vars)
- `config.model` - Model name (optional, uses defaults)
- `config.temperature` - Temperature (optional, default 0.7)
- `config.maxTokens` - Max tokens (optional, default 4096)
- `config.retryAttempts` - Retry attempts (optional, default 3)
- `config.retryDelay` - Retry delay in ms (optional, default 1000)

**Returns**: `LLMClient` instance

### LLMClient.chat(messages, options?)

Send a chat completion request.

**Parameters**:
- `messages` - Array of chat messages
- `options.temperature` - Override temperature
- `options.maxTokens` - Override max tokens
- `options.jsonMode` - JSON mode configuration (OpenAI only)

**Returns**: `Promise<LLMResponse>`

### LLMClient.getProvider()

Get the provider name.

**Returns**: `'openai'` or `'claude'`

### LLMClient.getModel()

Get the model name.

**Returns**: `string`

### LLMClient.isConfigured()

Check if client is configured.

**Returns**: `boolean`

## Features

- ✅ Unified interface for OpenAI and Claude
- ✅ Automatic retry with exponential backoff
- ✅ Comprehensive error handling
- ✅ Environment variable configuration
- ✅ JSON mode support (OpenAI)
- ✅ TypeScript support
- ✅ Mock client for testing

## License

MIT
