# LLM Integration Guide v1.0（LLM 集成指南）

版本：v1.0
定位：Loom 平台 LLM 调用的统一接口和最佳实践
作用：指导如何在 Loom 中集成和使用 LLM（GPT-4, Claude 3.5 等）

---

# 一、LLM 在 Loom 中的应用场景

Loom 平台在多个阶段使用 LLM：

```
1. Intent Parser Agent
   - 自然语言 → GameSpec
   - 使用 JSON Mode 约束输出

2. Planner Agent (可选)
   - 辅助推理和决策
   - 规则生成

3. Asset Prompt Generator
   - 生成资源描述 Prompt
   - 风格优化

4. Code Review (可选)
   - 生成代码质量检查
   - 优化建议
```

---

# 二、支持的 LLM 提供商

### 1. OpenAI (推荐)

**模型**:
- GPT-4 Turbo (推荐)
- GPT-4
- GPT-3.5 Turbo (经济型)

**特点**:
- ✅ JSON Mode 支持
- ✅ Function Calling
- ✅ 高质量输出
- ✅ 稳定性好
- ❌ 成本较高

**安装**:

```bash
pnpm add openai
```

### 2. Anthropic Claude

**模型**:
- Claude 3.5 Sonnet (推荐)
- Claude 3 Opus
- Claude 3 Haiku (经济型)

**特点**:
- ✅ 超长上下文 (200k tokens)
- ✅ 高质量推理
- ✅ 更安全
- ❌ JSON Mode 不如 OpenAI 成熟

**安装**:

```bash
pnpm add @anthropic-ai/sdk
```

### 3. 本地模型 (可选)

**选项**:
- Ollama
- LocalAI
- LM Studio

**特点**:
- ✅ 成本低
- ✅ 隐私性好
- ❌ 质量较低
- ❌ 需要硬件支持

---

# 三、统一 LLM 接口

### 接口设计

```typescript
interface LLMProvider {
  name: string;
  complete(request: LLMRequest): Promise<LLMResponse>;
  stream?(request: LLMRequest): AsyncIterator<LLMChunk>;
}

interface LLMRequest {
  messages: Message[];
  temperature?: number;
  maxTokens?: number;
  responseFormat?: {
    type: 'text' | 'json_object';
    schema?: object; // JSON Schema
  };
  stop?: string[];
}

interface LLMResponse {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  finishReason: 'stop' | 'length' | 'function_call';
}

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}
```

### OpenAI 实现

```typescript
import OpenAI from 'openai';

export class OpenAIProvider implements LLMProvider {
  name = 'openai';
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async complete(request: LLMRequest): Promise<LLMResponse> {
    const response = await this.client.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: request.messages,
      temperature: request.temperature ?? 0.7,
      max_tokens: request.maxTokens ?? 2000,
      response_format: request.responseFormat?.type === 'json_object'
        ? { type: 'json_object' }
        : undefined,
      stop: request.stop
    });

    return {
      content: response.choices[0].message.content || '',
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0
      },
      model: response.model,
      finishReason: response.choices[0].finish_reason as any
    };
  }
}
```

### Claude 实现

```typescript
import Anthropic from '@anthropic-ai/sdk';

export class ClaudeProvider implements LLMProvider {
  name = 'claude';
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async complete(request: LLMRequest): Promise<LLMResponse> {
    const response = await this.client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: request.maxTokens ?? 2000,
      messages: request.messages.map(m => ({
        role: m.role,
        content: m.content
      })),
      system: request.messages.find(m => m.role === 'system')?.content
    });

    return {
      content: response.content[0].type === 'text' ? response.content[0].text : '',
      usage: {
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens,
        totalTokens: response.usage.input_tokens + response.usage.output_tokens
      },
      model: response.model,
      finishReason: response.stop_reason as any
    };
  }
}
```

### 统一调用

```typescript
class LLMClient {
  private providers: Map<string, LLMProvider> = new Map();
  private defaultProvider: string;

  constructor(config: LLMConfig) {
    if (config.openai?.apiKey) {
      this.providers.set('openai', new OpenAIProvider(config.openai.apiKey));
    }
    if (config.claude?.apiKey) {
      this.providers.set('claude', new ClaudeProvider(config.claude.apiKey));
    }
    this.defaultProvider = config.defaultProvider || 'openai';
  }

  async complete(request: LLMRequest, provider?: string): Promise<LLMResponse> {
    const p = this.providers.get(provider || this.defaultProvider);
    if (!p) {
      throw new Error(`Provider not found: ${provider}`);
    }
    return p.complete(request);
  }
}
```

---

# 四、Intent Parser Prompt 工程

### System Prompt

```typescript
const INTENT_PARSER_SYSTEM_PROMPT = `
You are an expert game designer and developer assistant. Your role is to convert natural language game descriptions into structured GameSpec JSON format.

GameSpec is a DSL (Domain Specific Language) for defining 2D games. It includes:
- meta: Game metadata (title, genre, camera, dimension)
- settings: Runtime settings (gravity, world size)
- scene: Scene configuration
- entities: Game entities (player, enemies, obstacles)
- systems: Game systems (physics, collision, input)
- mechanics: Game mechanics (jump, shoot, collect)
- scoring: Scoring system
- ui: UI configuration
- assets: Asset references
- extensions: Plugin extensions

Guidelines:
1. Be creative but reasonable - infer missing details sensibly
2. Use common game patterns (platformer, runner, shooter)
3. Ensure all required fields are present
4. Add appropriate components to entities
5. Include necessary systems and mechanics
6. Keep it simple - start with single scene, single player

Output format: Valid JSON matching the GameSpec schema.
`;
```

### User Prompt Template

```typescript
function createUserPrompt(userInput: string): string {
  return `
Create a GameSpec for the following game:

${userInput}

Requirements:
- Output valid JSON
- Include all required fields
- Use appropriate components and systems
- Keep entities minimal but complete
- Add reasonable default values

Output the GameSpec JSON now:
`;
}
```

### Few-Shot Examples

```typescript
const FEW_SHOT_EXAMPLES = [
  {
    input: "Create a Flappy Bird style game where the player taps to jump and avoids pipes",
    output: {
      meta: {
        title: "Flappy Clone",
        genre: "runner",
        camera: "side",
        dimension: "2D",
        version: "1.0"
      },
      settings: {
        gravity: 980
      },
      scene: {
        type: "single",
        cameraFollow: "player"
      },
      entities: [
        {
          id: "player",
          type: "player",
          sprite: "bird",
          position: { x: 100, y: 300 },
          components: ["jump", "gravity", "collision"]
        },
        {
          id: "pipes",
          type: "obstacle",
          sprite: "pipe",
          components: ["spawn", "move"]
        }
      ],
      systems: ["physics", "collision", "input"],
      mechanics: ["jump", "avoid"],
      scoring: {
        type: "distance",
        increment: 1
      },
      ui: {
        hud: ["score"],
        startScreen: true,
        gameOverScreen: true
      },
      assets: [],
      extensions: {}
    }
  }
];

function buildFewShotPrompt(): Message[] {
  return FEW_SHOT_EXAMPLES.flatMap(example => [
    { role: 'user', content: example.input },
    { role: 'assistant', content: JSON.stringify(example.output, null, 2) }
  ]);
}
```

### JSON Mode 调用

```typescript
async function parseIntent(userInput: string): Promise<GameSpec> {
  const llmClient = new LLMClient(config);

  const messages: Message[] = [
    { role: 'system', content: INTENT_PARSER_SYSTEM_PROMPT },
    ...buildFewShotPrompt(),
    { role: 'user', content: createUserPrompt(userInput) }
  ];

  const response = await llmClient.complete({
    messages,
    temperature: 0.7, // 适当的创造性
    maxTokens: 2000,
    responseFormat: {
      type: 'json_object' // 强制 JSON 输出
    }
  });

  // 解析 JSON
  const gameSpec = JSON.parse(response.content);

  // 验证 Schema
  const valid = validateGameSpec(gameSpec);
  if (!valid) {
    throw new Error('Invalid GameSpec generated');
  }

  return gameSpec;
}
```

---

# 五、Prompt 优化策略

### 1. Temperature 调优

```typescript
// 创造性任务：0.7 - 0.9
const CREATIVE_TEMPERATURE = 0.7;

// 严格遵循规则：0.3 - 0.5
const STRICT_TEMPERATURE = 0.3;

// 代码生成：0.5
const CODE_TEMPERATURE = 0.5;
```

### 2. 迭代优化

```typescript
async function iterativeRefinement(
  gameSpec: GameSpec,
  iterations: number = 2
): Promise<GameSpec> {
  let current = gameSpec;

  for (let i = 0; i < iterations; i++) {
    const validation = validateGameSpec(current);

    if (validation.errors.length > 0) {
      // 让 LLM 修复错误
      const fixed = await llmClient.complete({
        messages: [
          {
            role: 'system',
            content: 'Fix the GameSpec errors while maintaining the game design intent.'
          },
          {
            role: 'user',
            content: `
GameSpec:
${JSON.stringify(current, null, 2)}

Errors:
${validation.errors.join('\n')}

Fix these errors and output the corrected GameSpec JSON:
`
          }
        ],
        responseFormat: { type: 'json_object' }
      });

      current = JSON.parse(fixed.content);
    }
  }

  return current;
}
```

### 3. Chain-of-Thought

```typescript
const COT_PROMPT = `
Think step by step:
1. Analyze the user's game description
2. Identify the core game mechanics
3. Determine required entities and their behaviors
4. List necessary systems and components
5. Define scoring and UI elements
6. Generate the complete GameSpec JSON

User description: {{USER_INPUT}}

Step-by-step reasoning:
`;
```

---

# 六、错误处理和降级

### 错误类型

1. **JSON 解析失败**
2. **Schema 验证失败**
3. **LLM API 错误**
4. **超时**

### 重试策略

```typescript
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await sleep(delay * Math.pow(2, i)); // 指数退避
    }
  }
  throw new Error('Max retries exceeded');
}
```

### 降级策略

```typescript
async function parseWithFallback(userInput: string): Promise<GameSpec> {
  try {
    // 尝试 GPT-4
    return await parseIntent(userInput, 'openai');
  } catch (error) {
    console.error('GPT-4 failed, trying Claude...');

    try {
      // 降级到 Claude
      return await parseIntent(userInput, 'claude');
    } catch (error) {
      console.error('Claude failed, using template...');

      // 最终降级：使用模板
      return getTemplateGameSpec('runner');
    }
  }
}
```

---

# 七、成本优化

### Token 计算

```typescript
function estimateTokens(text: string): number {
  // 粗略估算：4 字符 ≈ 1 token
  return Math.ceil(text.length / 4);
}

function calculateCost(tokens: number, model: string): number {
  const pricing = {
    'gpt-4-turbo': { input: 0.01 / 1000, output: 0.03 / 1000 },
    'gpt-3.5-turbo': { input: 0.0005 / 1000, output: 0.0015 / 1000 },
    'claude-3-sonnet': { input: 0.003 / 1000, output: 0.015 / 1000 }
  };

  return tokens * pricing[model].input;
}
```

### 缓存策略

```typescript
class PromptCache {
  private cache = new Map<string, LLMResponse>();

  async getOrFetch(prompt: string, llmFn: () => Promise<LLMResponse>): Promise<LLMResponse> {
    const hash = createHash('sha256').update(prompt).digest('hex');

    if (this.cache.has(hash)) {
      return this.cache.get(hash)!;
    }

    const response = await llmFn();
    this.cache.set(hash, response);
    return response;
  }
}
```

### 批量处理

```typescript
async function batchProcess(
  inputs: string[],
  batchSize: number = 10
): Promise<GameSpec[]> {
  const results: GameSpec[] = [];

  for (let i = 0; i < inputs.length; i += batchSize) {
    const batch = inputs.slice(i, i + batchSize);
    const specs = await Promise.all(
      batch.map(input => parseIntent(input))
    );
    results.push(...specs);
  }

  return results;
}
```

---

# 八、测试和质量保证

### 单元测试

```typescript
describe('Intent Parser', () => {
  it('should parse simple platformer', async () => {
    const input = 'Create a Mario-style platformer';
    const spec = await parseIntent(input);

    expect(spec.meta.genre).toBe('platformer');
    expect(spec.entities).toContainEqual(
      expect.objectContaining({ type: 'player' })
    );
  });

  it('should handle invalid input gracefully', async () => {
    const input = 'xyz';
    await expect(parseIntent(input)).rejects.toThrow();
  });
});
```

### 质量指标

```typescript
interface QualityMetrics {
  successRate: number; // 成功率
  averageTokens: number; // 平均 token 数
  averageLatency: number; // 平均延迟 (ms)
  validationPassRate: number; // Schema 验证通过率
}
```

### A/B 测试

```typescript
async function abTestPrompt(
  promptA: string,
  promptB: string,
  testCases: string[]
): Promise<void> {
  const resultsA = await Promise.all(
    testCases.map(input => complete({ messages: [{ role: 'user', content: promptA + input }] }))
  );

  const resultsB = await Promise.all(
    testCases.map(input => complete({ messages: [{ role: 'user', content: promptB + input }] }))
  );

  // 比较质量、成本、速度等
  compareResults(resultsA, resultsB);
}
```

---

# 九、安全和隐私

### Prompt Injection 防护

```typescript
function sanitizeInput(input: string): string {
  // 移除潜在的注入攻击
  return input
    .replace(/[<>]/g, '') // 移除 HTML 标签
    .replace(/\{\{.*?\}\}/g, '') // 移除模板语法
    .slice(0, 1000); // 限制长度
}
```

### 敏感信息过滤

```typescript
function filterSensitiveInfo(output: string): string {
  // 过滤 API keys, tokens 等
  return output.replace(/(?:api[_-]?key|token|password)['":\s]*['"]?([^'",\s]+)/gi, '[REDACTED]');
}
```

---

# 十、监控和日志

### 结构化日志

```typescript
interface LLMLog {
  timestamp: Date;
  provider: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  latency: number;
  success: boolean;
  error?: string;
}

function logLLMCall(log: LLMLog) {
  console.log(JSON.stringify(log));
}
```

### 性能监控

```typescript
import { Histogram, Counter } from 'prom-client';

const llmLatency = new Histogram({
  name: 'llm_latency_seconds',
  help: 'LLM API call latency',
  labelNames: ['provider', 'model']
});

const llmTokens = new Counter({
  name: 'llm_tokens_total',
  help: 'Total tokens used',
  labelNames: ['provider', 'model']
});
```

---

# 十一、配置示例

```typescript
const llmConfig = {
  defaultProvider: 'openai',

  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4-turbo-preview',
    temperature: 0.7,
    maxTokens: 2000
  },

  claude: {
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: 'claude-3-5-sonnet-20241022',
    temperature: 0.7,
    maxTokens: 2000
  },

  retry: {
    maxAttempts: 3,
    backoffMultiplier: 2
  },

  cache: {
    enabled: true,
    ttl: 3600, // 1 hour
    maxSize: 1000
  },

  monitoring: {
    enabled: true,
    logLevel: 'info'
  }
};
```

---

# 十二、最佳实践总结

### ✅ DO

1. **使用 JSON Mode** - 强制结构化输出
2. **Few-shot Learning** - 提供示例提升质量
3. **Schema Validation** - 始终验证输出
4. **错误处理** - 实现重试和降级
5. **监控成本** - 跟踪 token 使用
6. **缓存结果** - 避免重复调用
7. **测试驱动** - 建立测试套件
8. **迭代优化** - 持续改进 prompt

### ❌ DON'T

1. **不要信任未验证的输出** - 始终验证
2. **不要硬编码 API keys** - 使用环境变量
3. **不要忽略成本** - 监控和控制
4. **不要过度复杂化** - 保持简单
5. **不要跳过错误处理** - 健壮性优先

---

# 十三、实现清单

### MVP 阶段

- [x] OpenAI 集成
- [x] JSON Mode 支持
- [x] 基础 Prompt 模板
- [x] Schema 验证
- [x] 错误处理

### 后续阶段

- [ ] Claude 集成
- [ ] 高级 Prompt 工程
- [ ] 缓存系统
- [ ] 成本优化
- [ ] 监控仪表板
- [ ] A/B 测试框架

---

**LLM 集成是 Loom 的核心能力，务必保证稳定性和可靠性。**
