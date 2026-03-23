# Loom Phase A 计划 — LLM-Native 改造 + MVP 功能补全

> **前置条件**: Sprint 1-4 修复方案已全部完成，管线可 E2E 运行。
> **Phase A 周期**: Week 5-8（4 周）
> **核心目标**: 将 Loom 从 "规则引擎 + 字符串模板" 升级为 "真正的 AI-Native 游戏生成平台"

---

## 1. Phase A 全景

### 1.1 当前状态（Sprint 4 完成后）

```
NL ──LLM──→ GameSpec ──规则引擎──→ Graphs ──字符串模板──→ Phaser 代码
     ↑唯一AI点         硬编码规则         lines.push()拼接
```

**问题**: LLM 仅参与 1/6 环节，项目名为 "AI-native" 但本质是传统脚手架。

### 1.2 Phase A 目标状态

```
NL ──LLM①──→ GameSpec ──LLM②──→ Graphs ──LLM③──→ Phaser 代码 ──LLM④──→ 修复后代码
     Intent      Planner        Code Gen        Code Review
     Parser      Agent          Agent           Agent
       ↓           ↓               ↓               ↓
    (Repair     (规则校验       (模板兜底        (静态分析
     Engine)     + Schema)      降级方案)        辅助)
```

4 处 LLM 参与，每处都有非 LLM 的降级方案。

### 1.3 Sprint 规划

| Sprint | 周期 | 主题 | 交付 |
|--------|------|------|------|
| Sprint A1 | Week 5 | **Code Generator LLM 化** | LLM 生成 Phaser 代码 + 模板降级 |
| Sprint A2 | Week 6 | **Code Review Agent + Planner LLM 化** | 生成代码自动审查修复 + Planner 智能推断 |
| Sprint A3 | Week 7 | **MVP 功能补全** | 碰撞回调、enemy AI、scoring UI、spawner |
| Sprint A4 | Week 8 | **Harness Engineering + 集成测试** | 评估框架、E2E 黄金测试、质量基线 |

---

## 2. Sprint A1 — Code Generator LLM 化 (Week 5)

> **目标**: Code Generator 从字符串拼接升级为 LLM 生成，同时保留模板作为降级方案。

### 2.1 架构设计：双轨生成

```
CodeGeneratorInput
       │
       ▼
  ┌─────────────┐
  │ LLM 可用?    │
  └──┬──────┬───┘
     │Yes   │No
     ▼      ▼
 LLM 生成   模板生成
 (主路径)   (降级路径)
     │        │
     ▼        ▼
  合并输出 ◄──┘
       │
       ▼
  CodeGeneratorOutput
```

**核心原则**: LLM 生成为主，模板为降级兜底。两条路径输出格式完全一致（`GeneratedFile[]`），调用方无感知。

### 2.2 Task A1-1: 定义 Code Generation Prompt 体系

**文件**: `packages/code-generator/src/prompts/`（新建目录）

```
packages/code-generator/src/prompts/
├── index.ts
├── system-prompt.ts        # 系统角色定义
├── scene-generation.ts     # MainScene 生成 prompt
├── config-generation.ts    # GameConfig 生成 prompt
└── examples.ts             # Few-shot 示例
```

**system-prompt.ts** — Code Gen Agent 的核心 prompt:

```typescript
export const CODEGEN_SYSTEM_PROMPT = `You are an expert Phaser.js 3 game developer and code generator.

## Role
Generate production-quality TypeScript code for Phaser 3 games based on structured game specifications.

## Input Format
You will receive:
1. **GameSpec**: Complete game definition (entities, mechanics, settings)
2. **EntityGraph**: Entity relationships (collision, spawn, follow edges)
3. **ComponentGraph**: Entity-to-component bindings
4. **SystemGraph**: Active game systems and their dependencies
5. **AdapterBindings**: Component-to-Phaser API mappings (optional)

## Output Requirements
- Generate a complete, self-contained Phaser.Scene subclass
- Use TypeScript with proper type annotations
- Follow Phaser 3 best practices:
  - Use Arcade Physics (default) or Matter.js when specified
  - Create Groups for non-player entity types
  - Setup collisions based on EntityGraph edges
  - Implement component behaviors in update()
  - Use proper asset loading in preload()
- Include inline comments for complex logic
- Handle edge cases (missing assets, empty groups)

## Code Structure
\`\`\`typescript
export class MainScene extends Phaser.Scene {
  // 1. Property declarations (entities, groups, UI, state)
  // 2. constructor()
  // 3. preload() — asset loading
  // 4. create() — entity creation, physics, collisions, UI
  // 5. update() — input handling, AI, scoring, game logic
  // 6. Private helper methods (collision handlers, spawners, etc.)
}
\`\`\`

## Constraints
- Do NOT use external dependencies beyond Phaser 3
- Do NOT use deprecated Phaser APIs
- Always declare class properties with \`!\` assertion (initialized in create)
- Use \`this.input.keyboard?.createCursorKeys()\` pattern (null-safe)
- Group names follow pattern: \`{entityType}Group\` (e.g., enemyGroup, pickupGroup)
- Scene key: 'MainScene'

## Error Handling
- Wrap asset loading in try-catch when URLs are external
- Check for null/undefined on physics bodies before accessing
- Provide fallback colors/shapes when sprites fail to load
`;

export const CODEGEN_TEMPERATURE = 0.2;  // 低温度保证代码稳定性
export const CODEGEN_MAX_TOKENS = 8000;
```

**scene-generation.ts** — 动态构建生成 prompt:

```typescript
import type {
  GameSpec, EntityGraph, ComponentGraph, SystemGraph
} from '@loom/core';
import type { AdapterBinding } from '@loom/core';
import type { ResolvedAsset } from '@loom/asset-resolver';

export interface SceneGenerationContext {
  gameSpec: GameSpec;
  entityGraph: EntityGraph;
  componentGraph: ComponentGraph;
  systemGraph: SystemGraph;
  adapterBindings?: AdapterBinding[];
  resolvedAssets?: ResolvedAsset[];
}

/**
 * 构建 MainScene 生成的 user prompt
 *
 * 设计原则：
 * 1. 结构化 JSON 输入（LLM 对 JSON 的理解比自然语言描述更准确）
 * 2. 只传必要信息，避免 token 浪费
 * 3. 用 section header 分隔不同数据源
 */
export function buildSceneGenerationPrompt(ctx: SceneGenerationContext): string {
  const sections: string[] = [];

  // Section 1: 游戏元信息（精简）
  sections.push(`## Game Metadata
- Title: ${ctx.gameSpec.meta.title}
- Genre: ${ctx.gameSpec.meta.genre}
- Camera: ${ctx.gameSpec.meta.camera}
- Dimension: ${ctx.gameSpec.meta.dimension}`);

  // Section 2: 设置
  sections.push(`## Settings
${JSON.stringify(ctx.gameSpec.settings, null, 2)}`);

  // Section 3: 实体列表（完整，LLM 需要知道所有实体才能生成代码）
  sections.push(`## Entities (${ctx.gameSpec.entities.length} total)
${JSON.stringify(ctx.gameSpec.entities, null, 2)}`);

  // Section 4: EntityGraph（关键关系）
  const collisionEdges = ctx.entityGraph.edges.filter(e => e.type === 'collides');
  const spawnEdges = ctx.entityGraph.edges.filter(e => e.type === 'spawns');
  sections.push(`## Entity Relationships
### Collision Pairs (${collisionEdges.length})
${JSON.stringify(collisionEdges, null, 2)}

### Spawn Relationships (${spawnEdges.length})
${JSON.stringify(spawnEdges, null, 2)}`);

  // Section 5: ComponentGraph（实体组件绑定）
  sections.push(`## Component Bindings
${JSON.stringify(ctx.componentGraph.entityComponents, null, 2)}`);

  // Section 6: SystemGraph（活跃系统）
  const activeSystems = ctx.systemGraph.systems
    .filter(s => s.enabled)
    .map(s => s.type);
  sections.push(`## Active Systems: [${activeSystems.join(', ')}]`);

  // Section 7: 资源映射（如果有）
  if (ctx.resolvedAssets && ctx.resolvedAssets.length > 0) {
    const assetMap = ctx.resolvedAssets.map(a => ({
      id: a.id,
      url: a.resolvedUrl,
      type: a.type,
    }));
    sections.push(`## Resolved Assets
${JSON.stringify(assetMap, null, 2)}`);
  }

  // Section 8: 游戏机制
  sections.push(`## Mechanics: [${ctx.gameSpec.mechanics.join(', ')}]`);

  // Section 9: Scoring
  if (ctx.gameSpec.scoring) {
    sections.push(`## Scoring
${JSON.stringify(ctx.gameSpec.scoring, null, 2)}`);
  }

  // Section 10: UI
  if (ctx.gameSpec.ui) {
    sections.push(`## UI Config
${JSON.stringify(ctx.gameSpec.ui, null, 2)}`);
  }

  // 最终指令
  sections.push(`## Task
Generate a complete MainScene.ts file implementing all the above specifications.
The output must be ONLY the TypeScript code, no markdown fences, no explanations.`);

  return sections.join('\n\n');
}
```

**examples.ts** — Few-shot 示例（选取 1 个精简示例用于 prompt）:

```typescript
export const CODEGEN_FEW_SHOT = `## Example

### Input (simplified)
Entities: player (jump, keyboardInput), obstacle (static), coin (pickup)
Collisions: player↔obstacle, player↔coin
Mechanics: jump, collect
Scoring: collect type, increment 10

### Output
\`\`\`typescript
export class MainScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private obstacleGroup!: Phaser.Physics.Arcade.StaticGroup;
  private pickupGroup!: Phaser.Physics.Arcade.Group;
  private score = 0;
  private scoreText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'MainScene' });
  }

  preload() {
    this.load.image('player_sprite', 'assets/sprites/player_sprite.png');
    this.load.image('obstacle_sprite', 'assets/sprites/obstacle_sprite.png');
    this.load.image('coin_sprite', 'assets/sprites/coin_sprite.png');
  }

  create() {
    // Create groups
    this.obstacleGroup = this.physics.add.staticGroup();
    this.pickupGroup = this.physics.add.group();

    // Create player
    this.player = this.physics.add.sprite(100, 300, 'player_sprite');
    this.player.setCollideWorldBounds(true);

    // Create obstacles
    this.obstacleGroup.create(400, 500, 'obstacle_sprite');

    // Create coins
    this.pickupGroup.create(300, 200, 'coin_sprite');

    // Collisions from EntityGraph
    this.physics.add.collider(this.player, this.obstacleGroup);
    this.physics.add.overlap(
      this.player,
      this.pickupGroup,
      this.handleCollectCoin,
      undefined,
      this
    );

    // UI
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '24px',
      color: '#fff',
    });

    // Camera
    this.cameras.main.startFollow(this.player);
  }

  update() {
    const cursors = this.input.keyboard?.createCursorKeys();
    const spaceKey = this.input.keyboard?.addKey('SPACE');

    if (spaceKey?.isDown && this.player.body?.touching.down) {
      this.player.setVelocityY(-320);
    }
  }

  private handleCollectCoin(
    player: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    coin: Phaser.Types.Physics.Arcade.GameObjectWithBody
  ) {
    (coin as Phaser.Physics.Arcade.Sprite).disableBody(true, true);
    this.score += 10;
    this.scoreText.setText(\`Score: \${this.score}\`);
  }
}
\`\`\``;
```

### 2.3 Task A1-2: 实现 LLM 生成路径

**文件**: `packages/code-generator/src/generator.ts` — 重构

```typescript
import type { LLMClient } from '@loom/llm-client';
import {
  CODEGEN_SYSTEM_PROMPT,
  CODEGEN_TEMPERATURE,
  CODEGEN_MAX_TOKENS,
} from './prompts/system-prompt';
import {
  buildSceneGenerationPrompt,
  type SceneGenerationContext,
} from './prompts/scene-generation';
import { CODEGEN_FEW_SHOT } from './prompts/examples';

export interface CodeGeneratorConfig {
  /** LLM 客户端（可选：不提供则使用模板降级） */
  llmClient?: LLMClient;
  /** 是否启用 few-shot examples */
  useFewShot?: boolean;
  /** LLM 生成失败时是否降级到模板 */
  fallbackToTemplate?: boolean;
}

export class CodeGenerator {
  private llmClient?: LLMClient;
  private useFewShot: boolean;
  private fallbackToTemplate: boolean;
  private diagnostics: GeneratorDiagnostics = { /* ... */ };

  constructor(config: CodeGeneratorConfig = {}) {
    this.llmClient = config.llmClient;
    this.useFewShot = config.useFewShot ?? true;
    this.fallbackToTemplate = config.fallbackToTemplate ?? true;
  }

  /**
   * 生成完整 Phaser 项目
   */
  async generate(
    input: CodeGeneratorInput,
    options: Partial<CodeGeneratorOptions> = {}
  ): Promise<CodeGeneratorOutput> {
    this.resetDiagnostics();

    const {
      gameSpec, sceneGraph, entityGraph,
      componentGraph, systemGraph, resolvedAssets,
    } = input;

    const files: GeneratedFile[] = [];

    // Stage 1-2: 静态文件（不需要 LLM）
    files.push(this.generatePackageJson(gameSpec));
    files.push(this.generateIndexHtml(gameSpec));

    // Stage 3: Game Config（简单，模板足矣）
    files.push(this.generateConfig(gameSpec, systemGraph));

    // Stage 4: Main Scene — 核心差异点：LLM vs 模板
    const mainScene = await this.generateMainScene(
      gameSpec, sceneGraph, entityGraph,
      componentGraph, systemGraph, resolvedAssets
    );
    files.push(mainScene);

    // Stage 5-7: 入口 + 配置文件（不需要 LLM）
    files.push(this.generateMain(gameSpec));
    files.push(this.generateTsConfig());
    files.push(this.generateViteConfig());

    return {
      files,
      dependencies: { phaser: '^3.70.0' },
      entryPoint: 'index.html',
      diagnostics: this.diagnostics,
    };
  }

  /**
   * MainScene 生成 — 双轨策略
   */
  private async generateMainScene(
    gameSpec: GameSpec,
    sceneGraph: SceneGraph,
    entityGraph: EntityGraph,
    componentGraph: ComponentGraph,
    systemGraph: SystemGraph,
    resolvedAssets?: ResolvedAsset[]
  ): Promise<GeneratedFile> {
    const context: SceneGenerationContext = {
      gameSpec, entityGraph, componentGraph,
      systemGraph, resolvedAssets,
    };

    let sceneCode: string;

    // 尝试 LLM 生成
    if (this.llmClient?.isConfigured()) {
      try {
        sceneCode = await this.generateSceneViaLLM(context);
        this.diagnostics.generationMethod = 'llm';
      } catch (error) {
        // LLM 失败，降级到模板
        if (this.fallbackToTemplate) {
          console.warn(
            `LLM generation failed, falling back to template: ${error}`
          );
          sceneCode = this.generateSceneViaTemplate(
            gameSpec, sceneGraph, entityGraph, componentGraph, systemGraph,
            resolvedAssets
          );
          this.diagnostics.generationMethod = 'template-fallback';
          this.diagnostics.warnings.push(
            `LLM generation failed: ${error}. Used template fallback.`
          );
        } else {
          throw error;
        }
      }
    } else {
      // 无 LLM 客户端，直接模板
      sceneCode = this.generateSceneViaTemplate(
        gameSpec, sceneGraph, entityGraph, componentGraph, systemGraph,
        resolvedAssets
      );
      this.diagnostics.generationMethod = 'template';
    }

    this.diagnostics.generatedFiles.push('src/scenes/MainScene.ts');

    return {
      path: 'src/scenes/MainScene.ts',
      content: sceneCode,
      type: 'scene',
    };
  }

  /**
   * LLM 生成路径
   */
  private async generateSceneViaLLM(
    context: SceneGenerationContext
  ): Promise<string> {
    // 构建 system prompt
    let systemContent = CODEGEN_SYSTEM_PROMPT;
    if (this.useFewShot) {
      systemContent += '\n\n' + CODEGEN_FEW_SHOT;
    }

    // 构建 user prompt
    const userContent = buildSceneGenerationPrompt(context);

    // 调用 LLM
    const response = await this.llmClient!.chat(
      [
        { role: 'system', content: systemContent },
        { role: 'user', content: userContent },
      ],
      {
        temperature: CODEGEN_TEMPERATURE,
        maxTokens: CODEGEN_MAX_TOKENS,
        jsonMode: { enabled: false },  // 输出是代码不是 JSON
      }
    );

    // 清理 LLM 输出（可能包含 markdown fence）
    let code = response.content.trim();
    code = this.stripMarkdownFences(code);

    // 基本校验
    if (!code.includes('class MainScene')) {
      throw new Error('LLM output does not contain MainScene class');
    }
    if (!code.includes('extends Phaser.Scene')) {
      throw new Error('LLM output does not extend Phaser.Scene');
    }

    return code;
  }

  /**
   * 清理 markdown code fence
   */
  private stripMarkdownFences(code: string): string {
    // 移除 ```typescript ... ``` 包裹
    const fenceRegex = /^```(?:typescript|ts)?\s*\n?([\s\S]*?)\n?```$/;
    const match = code.match(fenceRegex);
    if (match) {
      return match[1]!.trim();
    }
    return code;
  }

  /**
   * 模板生成路径（原有逻辑，作为降级方案保留）
   *
   * 即 Sprint 1-4 修复后的 lines.push() 实现
   */
  private generateSceneViaTemplate(
    gameSpec: GameSpec,
    _sceneGraph: SceneGraph,
    entityGraph: EntityGraph,
    componentGraph: ComponentGraph,
    systemGraph: SystemGraph,
    resolvedAssets?: ResolvedAsset[]
  ): string {
    // ... 保留原有的 FIX-01/FIX-05 修复后的模板逻辑
    // 此处省略，逻辑与修复方案中的实现一致
    const entityDeclarations = this.generateEntityDeclarations(gameSpec.entities);
    const preloadCode = this.generatePreloadCode(gameSpec, resolvedAssets);
    const createCode = this.generateCreateCode(gameSpec, entityGraph, componentGraph);
    const updateCode = this.generateUpdateCode(gameSpec, componentGraph, systemGraph);

    return `import Phaser from 'phaser';

export class MainScene extends Phaser.Scene {
${entityDeclarations}

  constructor() {
    super({ key: 'MainScene' });
  }

  preload() {
${preloadCode}
  }

  create() {
${createCode}
  }

  update(time: number, delta: number) {
${updateCode}
  }
}
`;
  }

  // ... 其余模板方法保持不变
}
```

### 2.4 Task A1-3: 扩展 GeneratorDiagnostics

```typescript
// packages/code-generator/src/types.ts — 扩展诊断信息

export interface GeneratorDiagnostics {
  warnings: string[];
  errors: string[];
  generatedFiles: string[];
  skippedFiles: string[];
  /** 新增：生成方式 */
  generationMethod?: 'llm' | 'template' | 'template-fallback';
  /** 新增：LLM 调用耗时 */
  llmLatencyMs?: number;
  /** 新增：LLM token 用量 */
  llmTokenUsage?: {
    prompt: number;
    completion: number;
    total: number;
  };
}
```

### 2.5 Task A1-4: 更新 Orchestrator 集成

```typescript
// packages/orchestrator/src/orchestrator.ts — 传递 LLM client 到 CodeGenerator

import { createLLMClient } from '@loom/llm-client';

export class Orchestrator {
  constructor(config: OrchestratorConfig = {}) {
    // ...
    const llmClient = config.llmClient ?? createLLMClient({
      provider: 'openai',
      model: 'gpt-4o',
    });

    this.codeGenerator = new CodeGenerator({
      llmClient,
      useFewShot: true,
      fallbackToTemplate: true,
    });
  }
}
```

### 2.6 Sprint A1 验收标准

- [ ] `CodeGenerator` 支持 `llmClient` 配置项
- [ ] 有 LLM 时：生成的 MainScene.ts 来自 LLM，diagnostics.generationMethod === 'llm'
- [ ] 无 LLM 时：降级到模板生成，diagnostics.generationMethod === 'template'
- [ ] LLM 失败时：自动降级，diagnostics.generationMethod === 'template-fallback'
- [ ] LLM 输出的基本校验：包含 `class MainScene`、`extends Phaser.Scene`
- [ ] 使用 flappy-bird.json 和 galactic-shooter.json 两个示例测试 LLM 生成路径

---

## 3. Sprint A2 — Code Review Agent + Planner LLM 化 (Week 6)

### 3.1 Task A2-1: Code Review Agent

**新建文件**: `packages/code-review/`

```
packages/code-review/
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts
    ├── reviewer.ts
    ├── prompts/
    │   └── review-prompt.ts
    └── types.ts
```

**核心逻辑**: `packages/code-review/src/reviewer.ts`

```typescript
import type { LLMClient, ChatMessage } from '@loom/llm-client';
import type { GeneratedFile } from '@loom/code-generator';
import type { GameSpec } from '@loom/core';
import { REVIEW_SYSTEM_PROMPT } from './prompts/review-prompt';

export interface ReviewResult {
  passed: boolean;
  issues: ReviewIssue[];
  suggestions: string[];
  fixedCode?: string;
}

export interface ReviewIssue {
  severity: 'error' | 'warning' | 'info';
  line?: number;
  message: string;
  fix?: string;
}

export interface CodeReviewConfig {
  llmClient: LLMClient;
  /** 是否自动修复发现的问题 */
  autoFix?: boolean;
  /** 最大修复轮次 */
  maxFixRounds?: number;
}

export class CodeReviewAgent {
  private llmClient: LLMClient;
  private autoFix: boolean;
  private maxFixRounds: number;

  constructor(config: CodeReviewConfig) {
    this.llmClient = config.llmClient;
    this.autoFix = config.autoFix ?? true;
    this.maxFixRounds = config.maxFixRounds ?? 2;
  }

  /**
   * 审查生成的代码
   */
  async review(
    sceneFile: GeneratedFile,
    gameSpec: GameSpec
  ): Promise<ReviewResult> {
    const messages: ChatMessage[] = [
      { role: 'system', content: REVIEW_SYSTEM_PROMPT },
      {
        role: 'user',
        content: this.buildReviewPrompt(sceneFile.content, gameSpec),
      },
    ];

    const response = await this.llmClient.chat(messages, {
      temperature: 0.1,
      maxTokens: 4000,
      jsonMode: { enabled: true },
    });

    const result = JSON.parse(response.content) as ReviewResult;

    // 如果有 error 级别问题且开启了 autoFix
    if (
      this.autoFix &&
      result.issues.some(i => i.severity === 'error')
    ) {
      return this.fixAndReReview(sceneFile, gameSpec, result, 0);
    }

    return result;
  }

  /**
   * 修复并重新审查（递归，最多 maxFixRounds 轮）
   */
  private async fixAndReReview(
    originalFile: GeneratedFile,
    gameSpec: GameSpec,
    previousReview: ReviewResult,
    round: number
  ): Promise<ReviewResult> {
    if (round >= this.maxFixRounds) {
      return previousReview; // 达到最大轮次，返回最后一次审查结果
    }

    // 让 LLM 修复代码
    const fixResponse = await this.llmClient.chat(
      [
        {
          role: 'system',
          content:
            'Fix the following Phaser.js code based on the review issues. '
            + 'Output ONLY the fixed TypeScript code, no explanations.',
        },
        {
          role: 'user',
          content: `## Current Code\n\`\`\`typescript\n${originalFile.content}\n\`\`\`\n\n`
            + `## Issues Found\n${JSON.stringify(previousReview.issues, null, 2)}\n\n`
            + 'Fix all error-level issues. Output the complete fixed code.',
        },
      ],
      { temperature: 0.1, maxTokens: 8000 }
    );

    const fixedCode = this.stripMarkdownFences(fixResponse.content);

    // 重新审查修复后的代码
    const fixedFile: GeneratedFile = {
      ...originalFile,
      content: fixedCode,
    };

    const reReview = await this.review(fixedFile, gameSpec);
    reReview.fixedCode = fixedCode;

    return reReview;
  }

  private buildReviewPrompt(code: string, gameSpec: GameSpec): string {
    return `## Code to Review
\`\`\`typescript
${code}
\`\`\`

## Expected Game Specification
- Title: ${gameSpec.meta.title}
- Genre: ${gameSpec.meta.genre}
- Entities: ${gameSpec.entities.map(e => `${e.id}(${e.type})`).join(', ')}
- Mechanics: ${gameSpec.mechanics.join(', ')}
- Systems: ${gameSpec.systems.join(', ')}

## Review Checklist
1. Does the code compile (no undefined variables, missing imports)?
2. Are all entities from the spec created?
3. Are collision relationships set up correctly?
4. Are all mechanics (${gameSpec.mechanics.join(', ')}) implemented?
5. Is input handling implemented for player?
6. Are there runtime errors (null access, missing Groups)?
7. Is the scoring system implemented (if specified)?
8. Does the camera follow the player?

Respond in JSON format:
{
  "passed": boolean,
  "issues": [{ "severity": "error"|"warning"|"info", "line": number|null, "message": string, "fix": string|null }],
  "suggestions": [string]
}`;
  }

  private stripMarkdownFences(code: string): string {
    const fenceRegex = /^```(?:typescript|ts)?\s*\n?([\s\S]*?)\n?```$/;
    const match = code.match(fenceRegex);
    return match ? match[1]!.trim() : code;
  }
}
```

**Review Prompt**: `packages/code-review/src/prompts/review-prompt.ts`

```typescript
export const REVIEW_SYSTEM_PROMPT = `You are a senior Phaser.js code reviewer.

## Task
Review generated Phaser 3 game code for:
1. **Runtime Errors**: Undefined variables, null access, missing Groups
2. **Spec Compliance**: All entities, mechanics, and systems from the GameSpec are implemented
3. **Phaser Best Practices**: Proper lifecycle usage, physics setup, input handling
4. **Logic Bugs**: Incorrect collision handlers, wrong physics config, missing game over conditions

## Severity Levels
- **error**: Will cause runtime crash or game-breaking bug (MUST fix)
- **warning**: May cause incorrect behavior (SHOULD fix)
- **info**: Code quality improvement (NICE to fix)

## Response Format
Always respond in valid JSON matching the ReviewResult schema.

## Common Issues to Check
- this.{var} used before assignment in create()
- Group.add() called on non-Group objects
- Collision callback with wrong parameter types
- Missing score/UI text updates
- Player entity not found but camera.startFollow called
- Gravity set for topdown games
- Missing keyboard input null-check (?.operator)
`;
```

### 3.2 Task A2-2: 集成 Code Review 到 Orchestrator

```typescript
// packages/orchestrator/src/orchestrator.ts — 新增 Stage 6

async generate(input: OrchestratorInput): Promise<OrchestratorOutput> {
  // ... Stage 1-5 不变 ...

  // ── Stage 6: Code Review (NEW) ──
  let finalCodeOutput = codeOutput;
  let reviewResult;

  if (this.llmClient?.isConfigured()) {
    const reviewer = new CodeReviewAgent({
      llmClient: this.llmClient,
      autoFix: true,
      maxFixRounds: 2,
    });

    const sceneFile = codeOutput.files.find(
      f => f.path.includes('MainScene')
    );

    if (sceneFile) {
      reviewResult = await reviewer.review(sceneFile, gameSpec);

      // 如果有修复后的代码，替换原文件
      if (reviewResult.fixedCode) {
        finalCodeOutput = {
          ...codeOutput,
          files: codeOutput.files.map(f =>
            f.path === sceneFile.path
              ? { ...f, content: reviewResult!.fixedCode! }
              : f
          ),
        };
      }
    }
  }

  return {
    gameSpec,
    codeOutput: finalCodeOutput,
    diagnostics: {
      // ...
      codeReview: reviewResult,  // 新增
    },
  };
}
```

### 3.3 Task A2-3: Planner 引入 LLM 辅助推断

**改造策略**: 不是替换现有规则引擎，而是在规则引擎**之前**加一个 LLM 预处理层，补全规则引擎无法推断的组件。

```typescript
// packages/planner/src/planner.ts — 新增 LLM 辅助方法

import type { LLMClient } from '@loom/llm-client';

export interface PlannerConfig {
  llmClient?: LLMClient;
}

export class PlannerAgent {
  private llmClient?: LLMClient;
  private diagnostics: PlanDiagnostics;

  constructor(config: PlannerConfig = {}) {
    this.llmClient = config.llmClient;
    this.diagnostics = { warnings: [], autoFixes: [], inferredNodes: [] };
  }

  /**
   * 主入口（支持 LLM 增强）
   */
  async plan(gameSpec: GameSpec): Promise<PlanResult> {
    this.diagnostics = { warnings: [], autoFixes: [], inferredNodes: [] };

    // Stage 0 (NEW): LLM 预处理 — 补全组件和系统
    let enrichedSpec = gameSpec;
    if (this.llmClient?.isConfigured()) {
      try {
        enrichedSpec = await this.enrichSpecWithLLM(gameSpec);
      } catch (error) {
        // LLM 失败不阻塞，降级到纯规则
        this.diagnostics.warnings.push(
          `LLM enrichment failed: ${error}. Using rule-based planning only.`
        );
      }
    }

    // Stage 1-5: 原有规则引擎逻辑（不变）
    this.validateSpec(enrichedSpec);
    const completedSpec = this.completeStructure(enrichedSpec);
    const sceneGraph = this.buildSceneGraph(completedSpec);
    const entityGraph = this.buildEntityGraph(completedSpec);
    const componentGraph = this.buildComponentGraph(completedSpec);
    const systemGraph = this.buildSystemGraph(completedSpec);
    this.resolveDependencies(componentGraph, systemGraph);
    this.optimize(sceneGraph, entityGraph, componentGraph, systemGraph);

    return {
      sceneGraph, entityGraph, componentGraph, systemGraph,
      diagnostics: this.diagnostics,
    };
  }

  /**
   * LLM 补全：分析 GameSpec，推断缺失的组件和系统
   *
   * 设计原则：
   * 1. LLM 只做"补全"，不修改已有配置
   * 2. 输出是增量 diff，不是完整 spec
   * 3. 规则引擎仍然做最终校验
   */
  private async enrichSpecWithLLM(spec: GameSpec): Promise<GameSpec> {
    const prompt = `Analyze this GameSpec and suggest missing components/systems.

## GameSpec
${JSON.stringify(spec, null, 2)}

## Task
Based on the game genre "${spec.meta.genre}" and mechanics [${spec.mechanics.join(', ')}]:
1. What components should each entity have that are currently missing?
2. What systems should be active that are currently missing?
3. Are there any implicit mechanics not listed?

Respond in JSON:
{
  "entityComponentAdditions": {
    "<entityId>": ["component1", "component2"]
  },
  "systemAdditions": ["system1", "system2"],
  "mechanicAdditions": ["mechanic1"],
  "reasoning": "brief explanation"
}

Only suggest additions. Do NOT remove existing components/systems.`;

    const response = await this.llmClient!.chat(
      [
        {
          role: 'system',
          content:
            'You are a game design expert. Analyze game specifications '
            + 'and identify missing components for complete gameplay.',
        },
        { role: 'user', content: prompt },
      ],
      {
        temperature: 0.3,
        maxTokens: 2000,
        jsonMode: { enabled: true },
      }
    );

    const suggestions = JSON.parse(response.content);

    // 应用增量补全
    const enriched = structuredClone(spec);

    // 补全实体组件
    if (suggestions.entityComponentAdditions) {
      for (const [entityId, components] of Object.entries(
        suggestions.entityComponentAdditions as Record<string, string[]>
      )) {
        const entity = enriched.entities.find(e => e.id === entityId);
        if (entity) {
          for (const comp of components) {
            if (!entity.components.includes(comp)) {
              entity.components.push(comp);
              this.diagnostics.inferredNodes.push(
                `LLM added component '${comp}' to entity '${entityId}'`
              );
            }
          }
        }
      }
    }

    // 补全系统
    if (suggestions.systemAdditions) {
      for (const sys of suggestions.systemAdditions as string[]) {
        if (!enriched.systems.includes(sys as any)) {
          enriched.systems.push(sys as any);
          this.diagnostics.inferredNodes.push(
            `LLM added system '${sys}'`
          );
        }
      }
    }

    // 补全机制
    if (suggestions.mechanicAdditions) {
      for (const mech of suggestions.mechanicAdditions as string[]) {
        if (!enriched.mechanics.includes(mech as any)) {
          enriched.mechanics.push(mech as any);
          this.diagnostics.inferredNodes.push(
            `LLM added mechanic '${mech}'`
          );
        }
      }
    }

    return enriched;
  }
}
```

### 3.4 Sprint A2 验收标准

- [ ] CodeReviewAgent 能识别缺失变量引用、未声明 Group 等 error 级问题
- [ ] autoFix 开启时，修复后的代码通过第二轮 review（passed === true）
- [ ] PlannerAgent 有 LLM 时能推断出规则引擎遗漏的组件（如 tower-defense 场景）
- [ ] PlannerAgent 无 LLM 时行为与之前完全一致（纯规则引擎）
- [ ] Orchestrator 完整管线包含 review 环节

---

## 4. Sprint A3 — MVP 功能补全 (Week 7)

> **目标**: 补全生成代码中的功能缺口，使生成的游戏可以实际游玩。

### 4.1 Task A3-1: 实现碰撞回调函数

**现状**: FIX-01 修复后，碰撞通过 `this.physics.add.collider(playerRef, enemyGroup)` 设置，但没有回调函数，碰撞后没有任何效果。

**修复**（在模板路径中补全，LLM 路径由 prompt 覆盖）:

```typescript
// generator.ts — generateCreateCode() 中碰撞部分扩展

// 基于 EntityGraph 边的类型设置不同碰撞行为
for (const edge of collisionEdges) {
  // ... 前面的 pair 去重逻辑不变 ...

  const fromEntity = gameSpec.entities.find(e => e.id === edge.from);
  const toEntity = gameSpec.entities.find(e => e.id === edge.to);
  if (!fromEntity || !toEntity) continue;

  const fromRef = /* Group 或单体引用 */;
  const toRef = /* Group 或单体引用 */;

  // 根据实体类型决定碰撞行为
  const isPickup = fromEntity.type === 'pickup' || toEntity.type === 'pickup';
  const isEnemy = fromEntity.type === 'enemy' || toEntity.type === 'enemy';
  const isObstacle = fromEntity.type === 'obstacle' || toEntity.type === 'obstacle';

  if (isPickup) {
    // pickup 用 overlap（穿透 + 收集）
    lines.push(
      `    this.physics.add.overlap(${fromRef}, ${toRef}, `
      + `this.handleCollect, undefined, this);`
    );
  } else if (isEnemy) {
    // enemy 用 collider + 伤害回调
    lines.push(
      `    this.physics.add.collider(${fromRef}, ${toRef}, `
      + `this.handlePlayerHit, undefined, this);`
    );
  } else {
    // 其他（obstacle 等）用 collider 无回调
    lines.push(`    this.physics.add.collider(${fromRef}, ${toRef});`);
  }
}

// 生成回调方法
private generateCollisionHandlers(gameSpec: GameSpec): string {
  const lines: string[] = [];

  const hasEnemies = gameSpec.entities.some(e => e.type === 'enemy');
  const hasPickups = gameSpec.entities.some(e => e.type === 'pickup');

  if (hasEnemies) {
    lines.push(`
  private handlePlayerHit(
    player: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    enemy: Phaser.Types.Physics.Arcade.GameObjectWithBody
  ) {
    // 闪烁效果
    const playerSprite = player as Phaser.Physics.Arcade.Sprite;
    playerSprite.setTint(0xff0000);
    this.time.delayedCall(200, () => playerSprite.clearTint());

    // TODO: 扣血逻辑（基于 health component）
  }`);
  }

  if (hasPickups) {
    lines.push(`
  private handleCollect(
    player: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    item: Phaser.Types.Physics.Arcade.GameObjectWithBody
  ) {
    const pickup = item as Phaser.Physics.Arcade.Sprite;
    pickup.disableBody(true, true);
    this.score += ${gameSpec.scoring?.increment ?? 10};
    if (this.scoreText) {
      this.scoreText.setText(\`Score: \${this.score}\`);
    }
  }`);
  }

  return lines.join('\n');
}
```

### 4.2 Task A3-2: 实现 Scoring UI 代码生成

```typescript
// generator.ts — 新增 score 相关声明和逻辑

// generateEntityDeclarations() 中新增：
if (gameSpec.scoring) {
  declarations.push('  private score = 0;');
  declarations.push('  private scoreText!: Phaser.GameObjects.Text;');
}

// generateCreateCode() 末尾新增：
if (gameSpec.scoring) {
  lines.push('');
  lines.push('    // Scoring UI');
  lines.push('    this.scoreText = this.add.text(16, 16, \'Score: 0\', {');
  lines.push('      fontSize: \'24px\',');
  lines.push('      color: \'#ffffff\',');
  lines.push('    });');
  lines.push('    this.scoreText.setScrollFactor(0); // 固定在屏幕上');
}

// generateUpdateCode() 中新增 distance scoring：
if (gameSpec.scoring?.type === 'distance') {
  lines.push('');
  lines.push('    // Distance scoring');
  lines.push(`    this.score += delta * ${(gameSpec.scoring.increment ?? 1) / 100};`);
  lines.push('    if (this.scoreText) {');
  lines.push('      this.scoreText.setText(`Score: ${Math.floor(this.score)}`);');
  lines.push('    }');
}
```

### 4.3 Task A3-3: 实现 Enemy AI（Patrol + FollowTarget）

```typescript
// generator.ts — generateUpdateCode() 中新增 AI 逻辑

// 遍历所有非 player 实体的组件
for (const entity of gameSpec.entities) {
  if (entity.type === 'player') continue;
  const components = componentGraph.entityComponents[entity.id] || [];
  const varName = this.getEntityVarName(entity.id);

  // Patrol 组件 — 简单水平巡逻
  if (components.includes('patrol')) {
    lines.push('');
    lines.push(`    // ${entity.id} patrol AI`);
    lines.push(`    if (this.${varName}.body) {`);
    lines.push(`      if (this.${varName}.x <= 100) {`);
    lines.push(`        this.${varName}.setVelocityX(80);`);
    lines.push(`      } else if (this.${varName}.x >= 700) {`);
    lines.push(`        this.${varName}.setVelocityX(-80);`);
    lines.push('      }');
    lines.push('    }');
  }

  // FollowTarget 组件 — 追踪 player
  if (components.includes('followTarget')) {
    const playerVar = this.getEntityVarName(
      gameSpec.entities.find(e => e.type === 'player')?.id ?? 'player'
    );
    lines.push('');
    lines.push(`    // ${entity.id} follow target AI`);
    lines.push(`    this.physics.moveToObject(`);
    lines.push(`      this.${varName}, this.${playerVar}, 60`);
    lines.push('    );');
  }
}
```

### 4.4 Task A3-4: 实现 Spawner 代码生成

```typescript
// generator.ts — create() 中新增 spawner 定时器

const spawners = gameSpec.entities.filter(e => e.type === 'spawner');
if (spawners.length > 0) {
  lines.push('');
  lines.push('    // Spawner timers');
  for (const spawner of spawners) {
    const spawnEdges = entityGraph.edges.filter(
      e => e.from === spawner.id && e.type === 'spawns'
    );
    for (const edge of spawnEdges) {
      const targetEntity = gameSpec.entities.find(e => e.id === edge.to);
      if (!targetEntity) continue;

      lines.push(`    this.time.addEvent({`);
      lines.push(`      delay: 2000,`);
      lines.push(`      callback: () => {`);
      lines.push(`        const spawned = this.physics.add.sprite(`);
      lines.push(`          Phaser.Math.Between(100, 700),`);
      lines.push(`          0,`);
      lines.push(`          '${targetEntity.sprite || 'placeholder'}'`);
      lines.push(`        );`);
      lines.push(`        this.${targetEntity.type}Group.add(spawned);`);
      lines.push(`      },`);
      lines.push(`      loop: true,`);
      lines.push(`    });`);
    }
  }
}
```

### 4.5 Sprint A3 验收标准

- [ ] player 碰 enemy → 闪烁红色（伤害反馈）
- [ ] player 碰 pickup → pickup 消失 + 分数增加
- [ ] 分数显示在左上角，固定屏幕不随相机滚动
- [ ] distance 类型计分随时间增长
- [ ] 含 patrol 组件的 enemy 左右巡逻
- [ ] 含 followTarget 组件的 enemy 追踪 player
- [ ] spawner 实体定时生成新 enemy/pickup

---

## 5. Sprint A4 — Harness Engineering + 质量保障 (Week 8)

### 5.1 Task A4-1: 评估 Harness 框架

```
packages/harness/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts
│   ├── harness.ts           # 核心评估框架
│   ├── evaluators/
│   │   ├── intent-parser-eval.ts
│   │   ├── planner-eval.ts
│   │   ├── code-generator-eval.ts
│   │   └── review-eval.ts
│   ├── datasets/
│   │   ├── golden-specs.ts    # 黄金 GameSpec 数据集
│   │   └── golden-outputs.ts  # 期望输出
│   └── reporters/
│       ├── console-reporter.ts
│       └── json-reporter.ts
└── data/
    ├── golden-specs/
    │   ├── flappy-bird.json
    │   ├── space-runner.json
    │   └── galactic-shooter.json
    └── golden-outputs/
        ├── flappy-bird-scene.ts
        ├── space-runner-scene.ts
        └── galactic-shooter-scene.ts
```

**核心评估逻辑**: `packages/harness/src/harness.ts`

```typescript
export interface EvalResult {
  name: string;
  passed: boolean;
  score: number;      // 0-1
  metrics: Record<string, number>;
  errors: string[];
  duration: number;
}

export interface EvalSuite {
  name: string;
  results: EvalResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    avgScore: number;
  };
}

/**
 * 评估运行器
 */
export class HarnessRunner {
  /**
   * 运行单个评估
   */
  async runEval(
    name: string,
    fn: () => Promise<EvalResult>
  ): Promise<EvalResult> {
    const start = Date.now();
    try {
      const result = await fn();
      result.duration = Date.now() - start;
      return result;
    } catch (error: any) {
      return {
        name,
        passed: false,
        score: 0,
        metrics: {},
        errors: [error.message],
        duration: Date.now() - start,
      };
    }
  }

  /**
   * 运行评估套件
   */
  async runSuite(
    name: string,
    evals: Array<{ name: string; fn: () => Promise<EvalResult> }>
  ): Promise<EvalSuite> {
    const results: EvalResult[] = [];

    for (const eval_ of evals) {
      const result = await this.runEval(eval_.name, eval_.fn);
      results.push(result);
    }

    return {
      name,
      results,
      summary: {
        total: results.length,
        passed: results.filter(r => r.passed).length,
        failed: results.filter(r => !r.passed).length,
        avgScore:
          results.reduce((sum, r) => sum + r.score, 0) / results.length,
      },
    };
  }
}
```

### 5.2 Task A4-2: Code Generator 评估器

```typescript
// packages/harness/src/evaluators/code-generator-eval.ts

import type { EvalResult } from '../harness';
import type { GameSpec } from '@loom/core';

/**
 * 评估 Code Generator 输出质量
 *
 * 评分维度:
 * 1. 结构完整性 (0.3) — 必要的类/方法/导入是否存在
 * 2. Spec 覆盖率 (0.3) — GameSpec 中的实体/组件/系统是否都有对应代码
 * 3. 运行时安全性 (0.2) — 是否有明显的运行时错误
 * 4. 代码质量 (0.2) — 类型标注、null-safe、命名规范
 */
export async function evaluateCodeGenOutput(
  generatedCode: string,
  gameSpec: GameSpec
): Promise<EvalResult> {
  const metrics: Record<string, number> = {};
  const errors: string[] = [];

  // ── 维度 1: 结构完整性 (0.3) ──
  const structureChecks = [
    { name: 'has-class', test: () => generatedCode.includes('class MainScene') },
    { name: 'extends-scene', test: () => generatedCode.includes('extends Phaser.Scene') },
    { name: 'has-preload', test: () => generatedCode.includes('preload()') },
    { name: 'has-create', test: () => generatedCode.includes('create()') },
    { name: 'has-update', test: () => generatedCode.includes('update(') },
    { name: 'has-import', test: () => generatedCode.includes("import Phaser") || generatedCode.includes("from 'phaser'") },
  ];

  const structureScore = structureChecks.filter(c => c.test()).length / structureChecks.length;
  metrics['structure'] = structureScore;

  for (const check of structureChecks) {
    if (!check.test()) errors.push(`Missing: ${check.name}`);
  }

  // ── 维度 2: Spec 覆盖率 (0.3) ──
  let specCoverage = 0;
  let specTotal = 0;

  // 检查每个实体是否在代码中出现
  for (const entity of gameSpec.entities) {
    specTotal++;
    const varName = entity.id.replace(/-/g, '_');
    if (generatedCode.includes(varName)) {
      specCoverage++;
    } else {
      errors.push(`Entity "${entity.id}" not found in generated code`);
    }
  }

  // 检查碰撞设置
  const collidableEntities = gameSpec.entities.filter(e => e.physics?.collidable);
  if (collidableEntities.length > 1) {
    specTotal++;
    if (generatedCode.includes('add.collider') || generatedCode.includes('add.overlap')) {
      specCoverage++;
    } else {
      errors.push('No collision setup found despite collidable entities');
    }
  }

  // 检查 scoring
  if (gameSpec.scoring) {
    specTotal++;
    if (generatedCode.includes('score')) {
      specCoverage++;
    } else {
      errors.push('Scoring not implemented');
    }
  }

  metrics['specCoverage'] = specTotal > 0 ? specCoverage / specTotal : 1;

  // ── 维度 3: 运行时安全性 (0.2) ──
  const safetyChecks = [
    { name: 'no-bare-keyboard', test: () => !generatedCode.includes('this.input.keyboard.') || generatedCode.includes('this.input.keyboard?.') },
    { name: 'group-used-for-non-player', test: () => {
      const hasNonPlayer = gameSpec.entities.some(e => e.type !== 'player');
      return !hasNonPlayer || generatedCode.includes('Group');
    }},
    { name: 'no-undefined-this', test: () => {
      // 简单启发式：检查 this.xxx 是否都在属性声明中出现
      return true; // 需要 AST 分析才能准确判断
    }},
  ];

  metrics['safety'] = safetyChecks.filter(c => c.test()).length / safetyChecks.length;

  // ── 维度 4: 代码质量 (0.2) ──
  const qualityChecks = [
    { name: 'has-type-annotations', test: () => generatedCode.includes(': Phaser.') },
    { name: 'has-comments', test: () => generatedCode.includes('//') },
    { name: 'uses-const', test: () => generatedCode.includes('const ') },
  ];

  metrics['quality'] = qualityChecks.filter(c => c.test()).length / qualityChecks.length;

  // ── 综合评分 ──
  const weightedScore =
    metrics['structure']! * 0.3 +
    metrics['specCoverage']! * 0.3 +
    metrics['safety']! * 0.2 +
    metrics['quality']! * 0.2;

  return {
    name: `code-gen-eval:${gameSpec.meta.title}`,
    passed: weightedScore >= 0.7 && metrics['structure']! === 1.0,
    score: weightedScore,
    metrics,
    errors,
    duration: 0,
  };
}
```

### 5.3 Task A4-3: E2E 黄金测试

```typescript
// packages/harness/src/e2e-golden-test.ts

import { Orchestrator } from '@loom/orchestrator';
import { evaluateCodeGenOutput } from './evaluators/code-generator-eval';
import type { GameSpec } from '@loom/core';
import * as fs from 'fs';
import * as path from 'path';

const GOLDEN_SPECS_DIR = path.join(__dirname, '../data/golden-specs');

/**
 * 运行 E2E 黄金测试
 *
 * 对每个 golden GameSpec:
 * 1. 通过 Orchestrator 生成代码
 * 2. 用评估器打分
 * 3. 对比上一次基线分数（如有）
 * 4. 输出报告
 */
async function runGoldenTests() {
  const orchestrator = new Orchestrator({
    enableAssetResolution: true,
  });

  const specFiles = fs.readdirSync(GOLDEN_SPECS_DIR)
    .filter(f => f.endsWith('.json'));

  console.log(`\n🧪 Running ${specFiles.length} golden tests...\n`);

  const results = [];

  for (const file of specFiles) {
    const specPath = path.join(GOLDEN_SPECS_DIR, file);
    const gameSpec: GameSpec = JSON.parse(
      fs.readFileSync(specPath, 'utf-8')
    );

    console.log(`📋 Testing: ${gameSpec.meta.title}`);

    // 生成
    const output = await orchestrator.generate({ gameSpec });

    // 提取 MainScene
    const sceneFile = output.codeOutput.files.find(
      f => f.path.includes('MainScene')
    );

    if (!sceneFile) {
      console.log('  ❌ No MainScene generated\n');
      continue;
    }

    // 评估
    const evalResult = await evaluateCodeGenOutput(
      sceneFile.content,
      gameSpec
    );

    results.push(evalResult);

    // 输出
    const status = evalResult.passed ? '✅' : '❌';
    console.log(
      `  ${status} Score: ${(evalResult.score * 100).toFixed(1)}%`
    );
    console.log(
      `     Structure: ${(evalResult.metrics['structure']! * 100).toFixed(0)}%`
      + ` | Spec Coverage: ${(evalResult.metrics['specCoverage']! * 100).toFixed(0)}%`
      + ` | Safety: ${(evalResult.metrics['safety']! * 100).toFixed(0)}%`
      + ` | Quality: ${(evalResult.metrics['quality']! * 100).toFixed(0)}%`
    );

    if (evalResult.errors.length > 0) {
      console.log(`     Errors: ${evalResult.errors.join('; ')}`);
    }
    console.log('');
  }

  // 总结
  const avgScore = results.reduce((s, r) => s + r.score, 0) / results.length;
  const passRate = results.filter(r => r.passed).length / results.length;

  console.log('═'.repeat(60));
  console.log(
    `📊 Summary: ${results.length} tests | `
    + `Pass rate: ${(passRate * 100).toFixed(0)}% | `
    + `Avg score: ${(avgScore * 100).toFixed(1)}%`
  );
  console.log('═'.repeat(60));

  // 保存基线
  const baseline = {
    timestamp: new Date().toISOString(),
    avgScore,
    passRate,
    results: results.map(r => ({
      name: r.name,
      score: r.score,
      passed: r.passed,
    })),
  };

  fs.writeFileSync(
    path.join(__dirname, '../data/baseline.json'),
    JSON.stringify(baseline, null, 2)
  );

  console.log('\n💾 Baseline saved to data/baseline.json');
}

runGoldenTests().catch(console.error);
```

### 5.4 Sprint A4 验收标准

- [ ] Harness 框架可对 3 个黄金 GameSpec 自动评估
- [ ] 模板生成路径: 3 个 golden test 全部 passed（score >= 0.7）
- [ ] LLM 生成路径: 3 个 golden test 评分 >= 模板生成路径
- [ ] 基线数据自动保存，供后续迭代对比
- [ ] `pnpm run eval` 可一键运行全部评估

---

## 6. Phase A 完成后能力矩阵

| 能力 | Sprint 4 完成后 | Phase A 完成后 | 提升 |
|------|-----------------|---------------|------|
| LLM 参与环节 | 1/6 (Intent Parser) | 4/6 (+Planner, CodeGen, Review) | **+300%** |
| 代码生成方式 | 字符串拼接模板 | LLM 生成 + 模板降级 | 质的飞跃 |
| 碰撞行为 | 无回调（碰了无反应） | 完整回调（伤害/收集） | 可游玩 |
| 计分系统 | 不存在 | 完整 UI + 多种计分类型 | 可游玩 |
| Enemy AI | 不存在 | patrol + followTarget | 可游玩 |
| Spawner | 不存在 | 定时生成实体 | 可游玩 |
| 质量保障 | 无 | Harness 评估 + 黄金测试 | 可度量 |
| 代码审查 | 无 | Code Review Agent (LLM) | 自动修复 |

### Phase A 之后的定位

```
Phase A 之前: "规则引擎脚手架，生成模板代码，不可运行"
Phase A 之后: "AI-Native 游戏生成器，LLM 驱动代码生成，可实际游玩，质量可度量"
```

---

## 7. 风险与缓解

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|---------|
| LLM 生成代码质量不稳定 | 高 | 中 | 模板降级 + Code Review Agent 自动修复 + 低温度 |
| LLM 调用延迟过高（>10s） | 中 | 中 | 异步生成 + 缓存相似 GameSpec 的输出 |
| LLM API 成本 | 中 | 低 | 仅 MainScene 用 LLM，其他文件用模板；Planner 的 LLM 调用可选 |
| Prompt 需要多轮迭代 | 高 | 低 | Harness 评估框架可量化每轮迭代的效果 |
| Few-shot 示例覆盖度不足 | 中 | 中 | 逐步扩充 golden-specs 数据集 |

---

## 8. 依赖关系总图

```
Sprint A1 (Code Gen LLM)
    │
    ├─── A1-1: Prompt 体系 ─── 独立
    ├─── A1-2: LLM 生成路径 ←── A1-1
    ├─── A1-3: 扩展 Diagnostics ─── 独立
    └─── A1-4: Orchestrator 集成 ←── A1-2

Sprint A2 (Review + Planner LLM)
    │
    ├─── A2-1: CodeReviewAgent ←── A1-2 (需要 LLM 生成的代码来审查)
    ├─── A2-2: 集成到 Orchestrator ←── A2-1
    └─── A2-3: Planner LLM 化 ─── 独立

Sprint A3 (功能补全)
    │
    ├─── A3-1: 碰撞回调 ─── 独立
    ├─── A3-2: Scoring UI ─── 独立
    ├─── A3-3: Enemy AI ─── 独立
    └─── A3-4: Spawner ─── 独立

Sprint A4 (Harness)
    │
    ├─── A4-1: Harness 框架 ─── 独立
    ├─── A4-2: CodeGen 评估器 ←── A4-1
    └─── A4-3: E2E 黄金测试 ←── A4-2, Sprint A1-A3 全部完成
```
