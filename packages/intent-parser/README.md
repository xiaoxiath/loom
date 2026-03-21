# @loom/intent-parser

Intent Parser for Loom game generation platform. Converts natural language descriptions into structured GameSpec JSON.

## Installation

```bash
pnpm install
```

## Quick Start

```typescript
import { IntentParserAgent } from '@loom/intent-parser';
import { createLLMClientFromEnv } from '@loom/llm-client';

// Configure LLM client (requires OPENAI_API_KEY or ANTHROPIC_API_KEY)
const llmClient = createLLMClientFromEnv();

// Create Intent Parser
const parser = new IntentParserAgent({
  llmClient,
  useExamples: true,
});

// Parse natural language to GameSpec
const result = await parser.parse({
  text: 'Create a Flappy Bird-style game where a bird jumps between pipes',
});

console.log('GameSpec:', result.spec);
console.log('Confidence:', result.confidence);          // 0.92
console.log('Assumptions:', result.assumptions);
console.log('Missing Slots:', result.missingSlots);
```

## Features

### 🌟 Natural Language to GameSpec
- Convert plain English or Chinese descriptions into structured game specifications
- Supports multiple game types: Jumper, Runner, Shooter, Platformer, Puzzle
- Automatic game type detection from description

### 🔧 Prompt Normalization
- Input cleaning and standardization
- Language detection (English/Chinese)
- Keyword extraction
- Game type inference
- Visual style detection

### 🛠️ Semantic Repair Engine
- 9 built-in repair rules
- Automatic dependency fixing
- Missing component detection
- Default value injection

### 📊 Confidence Scoring
- 0.0 - 1.0 confidence score
- Assumption tracking
- Missing slot detection
- Detailed diagnostics

### 🧪 Well Tested
- 50 unit tests (100% pass rate)
- 25 integration test prompts
- > 90% code coverage

## Installation
