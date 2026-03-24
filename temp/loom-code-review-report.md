# Loom 代码深度审查报告

> **项目**: xiaoxiath/loom — AI 驱动的自然语言游戏生成平台  
> **审查日期**: 2026-03-24  
> **审查范围**: 全仓库 12 个包 + Web 应用 + 文档 + 配置  
> **代码量**: ~7600+ 行 TypeScript  

---

## 一、总览

### 1.1 项目架构

```
自然语言 → IntentParser → GameSpec DSL → Planner → Runtime Adapter → Code Generator → Phaser.js 游戏
                                                                          ↑
                                                                     Code Review (可选)
```

Monorepo 结构（pnpm + turborepo）：

| 包名 | 用途 | 状态 |
|------|------|------|
| `@loom/core` | 核心类型定义（GameSpec DSL） | 类型完整，但未被有效消费 |
| `@loom/intent-parser` | 自然语言 → GameSpec | 实现完成，有关键 Bug |
| `@loom/planner` | GameSpec → SceneGraph/EntityGraph/ComponentGraph | 实现完成，测试全部无效 |
| `@loom/runtime-adapter` | Phaser API 绑定生成 | 基础实现，多个适配器空壳 |
| `@loom/code-generator` | GameSpec → Phaser.js 源码 | 实现完成，测试全部无效 |
| `@loom/code-review` | LLM 驱动的代码审查 | **存在致命无限递归 Bug** |
| `@loom/llm-client` | OpenAI/Claude 统一客户端 | 基本可用，Claude 实现不完整 |
| `@loom/orchestrator` | 管道编排 | 实现完成，零测试 |
| `@loom/asset-resolver` | 资源解析与占位符生成 | 基本可用 |
| `@loom/harness` | 评估/测试框架 | **完全不可用**，golden spec 全部违反 Schema |
| `schemas` | JSON Schema 定义 | 存在但无运行时引用 |
| `apps/web` | Next.js 前端 | **构建阻断**，缺失组件导入 |

### 1.2 问题统计

| 严重度 | 数量 | 说明 |
|--------|------|------|
| **CRITICAL** | 5 | 构建阻断、无限递归、测试全部无效 |
| **HIGH** | 15 | 逻辑错误、数据丢失、安全隐患 |
| **MEDIUM** | 22 | 未使用功能、不完整实现、类型安全 |
| **LOW** | 12 | 代码风格、文档不一致 |
| **需要接入** | 8 | 已实现但未被连接的有价值功能 |

---

## 二、CRITICAL 问题（5 个）

### C-01: Code Review 无限递归 — 烧钱炸弹 🔴

**文件**: `packages/code-review/src/reviewer.ts`  
**问题**: `review()` → `fixAndReReview()` → `review()` 调用链中，`review()` 每次调用 `fixAndReReview()` 时都传入 `round: 0`，导致 `round >= this.maxFixRounds` 终止条件永远不满足。当 LLM 输出的修复代码仍有问题时，会**无限循环调用 LLM API**，直到耗尽调用栈或 token 预算。

```
review(code) 
  → fixAndReReview(code, round=0) 
    → review(fixedCode)  // round 被重置
      → fixAndReReview(fixedCode, round=0)  // 永远是 0
        → review(fixedCode2) → ...∞
```

**影响**: 生产环境部署会导致 API 费用失控。

### C-02: Code Review 修复循环总是使用原始代码

**文件**: `packages/code-review/src/reviewer.ts`  
**问题**: `fixAndReReview()` 循环中，每一轮都向 LLM 发送**原始未修改代码**而非上一轮修复后的代码。即使 round 计数器修复后，多轮修复也永远无法收敛，因为 LLM 看到的永远是同一段有问题的代码。

### C-03: Planner 测试全部无效 — 同步调用 async 函数

**文件**: `packages/planner/src/planner.test.ts`  
**问题**: `plan()` 是 `async` 函数返回 `Promise`，但所有测试均以同步方式调用：

```typescript
const result = planner.plan(spec);  // result 是 Promise，不是 PlanResult
expect(result.sceneGraph).toBeDefined();  // 检查 Promise.sceneGraph = undefined
```

以及：
```typescript
expect(() => planner.plan(spec)).toThrow();  // async 异常不会被同步 catch
```

**影响**: 测试看似通过但实际上没有验证任何逻辑。整个 planner 缺乏有效测试覆盖。

### C-04: Code Generator 测试全部无效 — 同一问题

**文件**: `packages/code-generator/src/generator.test.ts`  
**问题**: 与 C-03 完全相同——所有测试同步调用 `async generate()`，断言对象是 Promise 而非实际结果。

### C-05: Web 应用构建阻断

**文件**: `apps/web/src/app/editor/page.tsx`  
**问题**: 导入了不存在的 `GeneratedFiles` 组件：

```typescript
import { GeneratedFiles } from '@/components/preview/GeneratedFiles';
// 该文件不存在于 apps/web/src/components/preview/ 目录
```

**影响**: `next build` 直接失败，Web 前端不可部署。

---

## 三、HIGH 问题（15 个）

### H-01: gravity=0 被错误处理为 980

**文件**: `packages/code-generator/src/generator.ts`  
**问题**: 使用 `gameSpec.settings.gravity || 980` 而非 `gameSpec.settings.gravity ?? 980`。`gravity: 0`（用于俯视角射击类游戏）会被 `||` 视为 falsy，错误地赋值为 980。

**影响**: 所有不需要重力的游戏类型（top-down shooter 等）物理系统完全错误。

### H-02: Normalizer 分析结果被完全丢弃

**文件**: `packages/intent-parser/src/intent-parser.ts`  
**问题**: `normalizer.ts` 包含约 120 行精心设计的检测逻辑（游戏类型、风格、关键词、语言区域），产出丰富的 `NormalizedInput` 对象。但 `IntentParserAgent` 只使用 `.normalized` 字符串，**完全丢弃**了 `detectedGameType`, `detectedStyle`, `keywords`, `locale` 等分析结果。

**影响**: LLM 收到的 prompt 缺乏结构化上下文，降低了解析准确率。**标记：需要接入**。

### H-03: customRepairRules 空数组覆盖默认修复规则

**文件**: `packages/intent-parser/src/intent-parser.ts`  
**问题**: 构造函数接受 `customRepairRules`，当传入 `[]` 时，覆盖了内置的 `REPAIR_RULES`：

```typescript
this.repairRules = options.customRepairRules ?? REPAIR_RULES;
// [] 不是 nullish，所以 ?? 不会 fallback
```

**影响**: 传入空数组的调用者不会获得任何内置修复，而传入 `undefined` 的会获得全部。行为不一致且反直觉。

### H-04: JSON.parse 无 try-catch（多处）

**文件**: `packages/planner/src/planner.ts:L591`, `packages/intent-parser/src/intent-parser.ts`, `packages/code-review/src/reviewer.ts`  
**问题**: LLM 返回的内容直接 `JSON.parse()`，但 LLM 经常返回非法 JSON（带有 markdown 代码块标记、多余注释等）。虽然某些位置有外层 catch，但错误消息 `${error}` 对 SyntaxError 会产生不可读信息。

### H-05: Collision 适配器 handler 为空

**文件**: `packages/runtime-adapter/src/adapters/collision.ts`  
**问题**: `generateCode()` 生成的碰撞回调函数体为空：

```typescript
this.physics.add.collider(entity, otherEntity, () => {
  // 空函数体
});
```

**影响**: 碰撞检测被注册但不会产生任何效果。这是游戏核心机制的缺失。

### H-06: per-frame 创建 Cursor Keys 对象（内存泄漏）

**文件**: `packages/runtime-adapter/src/adapters/keyboard-input.ts`  
**问题**: `generateCode()` 在 `update()` 方法中生成 `this.input.keyboard.createCursorKeys()`，该方法每帧调用一次（60fps = 每秒创建 60 个对象）。应在 `create()` 中初始化一次。

### H-07: ClaudeClient 未实现 JSON Mode

**文件**: `packages/llm-client/src/claude-client.ts`  
**问题**: `options.jsonMode` 参数被完全忽略。当 Planner 的 `enrichSpecWithLLM` 传入 `jsonMode: { enabled: true }` 时，Claude client 不做任何处理，输出可能不是有效 JSON。

**影响**: 使用 Claude 作为 LLM 后端时，所有依赖 JSON 输出的功能（Planner LLM 增强、Intent Parser）都可能失败。

### H-08: ClaudeClient handleError 缺失 LLMError 守卫

**文件**: `packages/llm-client/src/claude-client.ts:L113`  
**问题**: OpenAI client 在 `handleError` 首行检查 `if (error instanceof LLMError) return error`，但 Claude client 缺失此守卫。retry 机制重新抛出已包装的 `LLMError` 会被再次包装，丢失原始错误类型信息。

### H-09: Harness 评估系统完全不可用

**文件**: `packages/harness/` 整个包  
**问题**: 
1. 3 个 golden-spec JSON 文件全部违反 `gamespec.schema.json`（缺少必填字段、类型错误）
2. 评估器使用朴素字符串匹配（`includes()`）而非 AST 分析，计分不准确
3. `baseline.json` 仅包含空壳结构

**影响**: 作为质量保障的最后防线，harness 完全无法提供有效的评估反馈。

### H-10: Schema 在 devDependencies 但需要 runtime 使用

**文件**: `packages/harness/package.json`, `schemas/validate.ts`  
**问题**: `ajv` 被列在 `devDependencies`，但 `validate.ts` 在运行时需要它来做 schema 验证。如果作为库被消费，运行时 `require('ajv')` 会失败。

### H-11: Orchestrator 缺乏运行时 Schema 验证

**文件**: `packages/orchestrator/src/orchestrator.ts`  
**问题**: 数据在管道各阶段传递时没有任何 runtime schema 验证：
- `intentResult.spec as GameSpec` — 强制类型断言
- Planner 输出直接传给 Code Generator — 无中间验证
- 项目有 `schemas/` 目录但从未被引用

### H-12: Orchestrator 只审查 MainScene 文件

**文件**: `packages/orchestrator/src/orchestrator.ts:L126-128`  
**问题**: `codeOutput.files.find(f => f.path.includes('MainScene'))` — 仅对包含 "MainScene" 的文件做 code review，其他生成文件（config.ts, main.ts 等）完全跳过。

### H-13: 文档严重与现实脱节

**文件**: `CLAUDE.md`, `PROJECT_STATUS.md`, `QUICKSTART.md`  
**问题**: 
- `CLAUDE.md` 声明"尚未开始编码"，实际已有 7600+ 行代码
- `PROJECT_STATUS.md` 声称某些功能"100% 完成"但实际存在严重 Bug
- `QUICKSTART.md` 示例使用了不符合 Schema 的值
- 多处引用不存在的基础设施（Fastify backend, `apps/api` 目录）

### H-14: Environment 变量 parseFloat 无 NaN 检查

**文件**: `packages/llm-client/src/factory.ts:L44-47`  
**问题**: `parseFloat(process.env.OPENAI_TEMPERATURE!)` 如果环境变量为非数字字符串（如 `"high"`），返回 `NaN`，静默传给 API。

### H-15: OpenAI content_filter 未处理

**文件**: `packages/llm-client/src/openai-client.ts`  
**问题**: OpenAI 的内容过滤通过 `finish_reason: "content_filter"` 返回，非异常。当前代码不检查此值，被过滤时 `content` 可能为空字符串，调用者无感知。

---

## 四、死代码 & 需要接入的功能

### 4.1 需要接入（有价值但未连接）

| 编号 | 位置 | 说明 |
|------|------|------|
| **D-01** | `core/components.ts` — 18 个组件子类型 | `JumpComponent`, `GravityComponent` 等 18 个精心定义的组件接口，**零外部消费者**。runtime-adapter 自行定义了独立的 config 接口。应统一为单一类型源。 |
| **D-02** | `core/components.ts` — `ComponentRegistry` / `ComponentDefinition` | 组件注册系统的类型定义。runtime-adapter 的 `AdapterRegistryImpl` 完全独立实现了注册逻辑。应复用此类型。 |
| **D-03** | `core/components.ts` — `ComponentEvents` | 事件系统（`onStart/onUpdate/onCollision/onDestroy`），ECS 架构重要组成部分，但未被使用。 |
| **D-04** | `intent-parser/normalizer.ts` — 分析结果 | `detectedGameType`, `detectedStyle`, `keywords`, `locale` 等字段（见 H-02）。 |
| **D-05** | `intent-parser/repair-engine.ts` — RepairEngine | 完整的 7 条修复规则，但由于 H-03 的问题，可能被意外绕过。 |
| **D-06** | `llm-client/types.ts` — `LLMProvider` 类型 | 定义了但未从 `index.ts` 导出，外部包无法引用。 |
| **D-07** | `llm-client/types.ts` — `JSONModeConfig.schema` | JSON Schema 约束字段，两个 client 都未使用。 |
| **D-08** | `schemas/` — 全部 JSON Schema | 6 个 Schema 文件定义完整，但管道中没有任何运行时验证代码引用它们。 |

### 4.2 纯死代码（可安全删除）

| 编号 | 位置 | 说明 |
|------|------|------|
| **DD-01** | `core/adapters.ts` — `AdapterDebugInfo` | 仅被 re-export，从未消费。 |
| **DD-02** | `core/gamespec.ts` — `Extensions` 类型 | 在 GameSpec 接口中作为字段但无任何包操作它。 |
| **DD-03** | `core/gamespec.ts` — 6 个枚举类型 | `GameGenre`, `CameraType`, `DimensionType`, `SceneType`, `MechanicType`, `ScoringType`，除 `AssetType` 外均未被外部使用。Planner 硬编码字符串字面量。 |
| **DD-04** | `planner/test-examples.ts` | import 不存在的导出 `planner`，文件无法运行。 |
| **DD-05** | `llm-client/utils/retry.ts` — `sleep` 导出 | 仅内部使用但被标记为 export。 |
| **DD-06** | `intent-parser/e2e.test.ts` 和 `integration-test.ts` | 测试文件依赖真实 LLM API key，CI 中无法运行，且存在硬编码 prompt。 |
| **DD-07** | `code-generator/e2e-test.ts` | 同上，依赖真实 API key。 |
| **DD-08** | `harness/e2e-golden-test.ts` | 引用的 golden-spec 文件违反 Schema，测试必然失败。 |
| **DD-09** | `apps/web/public/` — Next.js 默认 SVG | `file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`，脚手架遗留文件。 |

---

## 五、架构问题

### 5.1 核心类型体系"空心化"（系统性问题）

**问题**: `@loom/core` 定义了丰富的组件类型体系（18 个接口），但类型约束链条完全断裂：

```
core 定义: JumpComponent { config: { force: number; maxJumps: number } }
  ↓ (未引用)
planner 使用: 字符串字面量 'jump' 
  ↓ (未引用)
runtime-adapter 定义: 独立的 JumpAdapterConfig { jumpForce: number }  // 字段名都不同！
  ↓ (未引用)
code-generator 使用: 字符串匹配生成 Phaser 代码
```

**影响**: 修改 `JumpComponent.config.force` 的类型不会导致任何其他包编译失败。类型安全名存实亡。

### 5.2 Index Signature 破坏类型安全

**文件**: `core/gamespec.ts` — `Entity`, `SceneConfig`, `PhysicsConfig` 等 5 个接口  
**问题**: 使用 `[key: string]: unknown` 意味着 `entity.foo = "bar"` 编译通过。应改为独立的 `metadata?: Record<string, unknown>` 字段。

### 5.3 Orchestrator 缺乏依赖注入

**文件**: `packages/orchestrator/src/orchestrator.ts`  
**问题**: 硬 import 6 个包，每次 `generate()` 调用都重新实例化所有子系统。无法替换、mock、或复用实例。

### 5.4 Planner 共享可变状态

**文件**: `packages/planner/src/planner.ts`  
**问题**: `this.diagnostics` 是实例级属性。并发调用 `plan()` 时会互相覆盖。应改为局部变量。

### 5.5 GameSpec.systems 字段被完全忽略

**文件**: `packages/planner/src/planner.ts`  
**问题**: `buildSystemGraph()` 完全基于规则推断系统，不读取 `spec.systems`。用户声明 `systems: ['sound']` 会被无视。

### 5.6 Planner 硬编码单场景

**文件**: `packages/planner/src/planner.ts:L226-249`  
**问题**: 即使 `SceneConfig.type` 为 `'multi'`，也只生成一个 `main` 场景。多场景支持声明但未实现。

### 5.7 两个 LLM Client 高度重复

**文件**: `packages/llm-client/src/openai-client.ts` & `claude-client.ts`  
**问题**: `handleError`、构造函数、config 合并逻辑几乎相同。应抽取 `BaseLLMClient` 抽象类。

### 5.8 跨包引用 Schema 使用相对路径

**文件**: `schemas/validate.ts`  
**问题**: 使用 `../../schemas/` 形式的相对路径引用，在不同目录深度的包中会断裂。

### 5.9 intent-parser 作为 peerDependency 传染类型

**文件**: `packages/orchestrator/package.json`  
**问题**: `intent-parser` 是 peerDependency，但其类型被用在 `PipelineDiagnostics` 中。消费 orchestrator 类型的人被迫安装 intent-parser。

---

## 六、Prompt 工程问题

### P-01: System Prompt 未约束输出格式

**文件**: `packages/intent-parser/src/prompts/system-prompt.ts`  
**问题**: 指示 LLM "输出 JSON"，但未提供 JSON Schema 约束或结构化格式要求。LLM 可能返回 markdown 代码块包裹的 JSON（如 ` ```json ... ``` `），导致 `JSON.parse` 失败。

### P-02: Few-shot 示例与 GameSpec Schema 不一致

**文件**: `packages/intent-parser/src/prompts/examples.ts`  
**问题**: 示例中的字段名称和结构与 `@loom/core` 的 `GameSpec` 接口存在差异，可能引导 LLM 产出不符合 Schema 的 JSON。

### P-03: Code Generator Prompt 过于复杂

**文件**: `packages/code-generator/src/prompts/system-prompt.ts`  
**问题**: 单个 system prompt 超过 3000 tokens，包含完整的 Phaser API 用法指南。过长的 prompt 会降低 LLM 的指令遵循率，应拆分为 system prompt + 动态注入的 context。

### P-04: Code Review Prompt 缺乏评分标准

**文件**: `packages/code-review/src/prompts/review-prompt.ts`  
**问题**: 让 LLM 评判代码质量但未给出量化评分标准（如 0-10 分），导致 "has issues" 的判断完全依赖 LLM 的主观感知，review 结果不可复现。

---

## 七、代码质量问题

| 编号 | 文件 | 问题 |
|------|------|------|
| Q-01 | `planner.ts:L456` | `if (spec.scoring)` — `scoring` 是必填字段，条件恒为 true |
| Q-02 | `planner.ts:L265` | `EntityNode.children` 永远为空数组，缺少回填逻辑 |
| Q-03 | `planner.ts:L532` | 系统排序使用依赖数量排序而非拓扑排序，可能乱序 |
| Q-04 | `planner.ts:L480` | `resolveDependencies` 参数 `_componentGraph` 未使用 |
| Q-05 | `openai-client.ts:L99` | `finish_reason: null` 赋值给 `string \| undefined` 类型 |
| Q-06 | `factory.ts:L78` | `createMockLLMClient` 硬编码 provider 为 'openai' |
| Q-07 | `components.ts:L37` | `JumpComponent.dependencies` 用 tuple 硬编码 `['gravity']` |
| Q-08 | `llm-client/package.json` | 声明了 `@loom/core` 依赖但未使用 |
| Q-09 | `orchestrator.ts:L117-139` | Code review 耗时未记入 diagnostics |
| Q-10 | `orchestrator.ts:L64` | `intentResult.spec as GameSpec` 强制断言无运行时验证 |
| Q-11 | `runtime-adapter` | `health.ts` 和 `destroy-on-collision.ts` 仅输出注释，无实际代码生成 |
| Q-12 | `asset-resolver/resolver.ts` | 占位符 SVG 使用硬编码颜色映射，无法扩展 |

---

## 八、配置与依赖问题

| 编号 | 文件 | 问题 |
|------|------|------|
| CF-01 | `apps/web/package.json` | Web 应用类型字段缺少 `'bundle'` 选项，与 code-generator 输出不匹配 |
| CF-02 | 根目录 `package.json` | 缺少 `engines` 字段约束 Node.js / pnpm 版本 |
| CF-03 | `turbo.json` | `build` 任务依赖关系可能导致并行构建时 core 包还未编译完成就被消费 |
| CF-04 | `.eslintrc.js` | 根目录 ESLint 配置存在但各包有独立 config，lint 规则可能不一致 |
| CF-05 | `assets/asset-manifest.json` | manifest 引用的某些资源文件路径与实际目录不匹配 |

---

## 九、文档一致性审计

| 文档 | 问题 |
|------|------|
| `CLAUDE.md` | 声明"纯规格阶段，无代码"，但仓库已有 7600+ 行实现代码 |
| `PROJECT_STATUS.md` | 多个功能标记 "100% 完成" 但存在严重 Bug（planner、code-generator） |
| `QUICKSTART.md` | 示例中的 `genre: 'platformer'` 不在 `GameGenre` 枚举中 |
| `README.md` | 引用不存在的 `apps/api` 目录和 Fastify 后端 |
| `README_MONOREPO.md` | 与 `README.md` 大量内容重叠 |
| `DEVELOPMENT_ROADMAP.md` | 将已完成工作仍标记为 "Week 1 TODO" |
| `TASKS.md` | 任务状态与实际代码进度不一致 |
| `PhaseA.md` | 与 `DEVELOPMENT_ROADMAP.md` 存在功能范围冲突 |
| `docs/TODO-LIST.md` | 与 `TASKS.md` 存在重叠和冲突 |

---

## 十、优先修复建议

### P0 — 立即修复（阻断性/破坏性）

1. **修复 Code Review 无限递归**（C-01, C-02）：正确传递 round 计数器，使用上一轮修复结果
2. **修复所有测试的 async/await**（C-03, C-04）：为所有测试添加 `await`，确保测试真正验证逻辑
3. **创建缺失的 GeneratedFiles 组件**（C-05）：或移除 editor page 中的引用

### P1 — 本周修复（核心功能缺陷）

4. **修复 gravity || 980 → gravity ?? 980**（H-01）
5. **接入 Normalizer 分析结果到 LLM prompt**（H-02, D-04）
6. **修复 collision adapter 空回调**（H-05）
7. **修复 keyboard-input per-frame 创建**（H-06）
8. **Claude client 实现 JSON mode**（H-07）
9. **Orchestrator 添加运行时 Schema 验证**（H-11）
10. **修复 golden-spec 使其符合 Schema**（H-09）

### P2 — 本月完成（架构优化）

11. **统一组件类型系统**：让 runtime-adapter 和 code-generator 引用 core 的组件类型
12. **引入运行时 Schema 验证**：在管道各阶段之间使用 `schemas/` 做数据校验
13. **Orchestrator 依赖注入化**：通过构造函数注入所有子系统
14. **抽取 LLM Client 基类**：消除 OpenAI/Claude client 的代码重复
15. **清理文档**：统一项目状态描述，删除过时信息

### P3 — 长期治理

16. 补充 Orchestrator 单元测试
17. 重构 Planner 支持多场景
18. 拆分 Code Generator system prompt
19. 建立 CI 流水线确保 golden spec 与 schema 同步
20. 消除 core 包 index signature 的类型安全隐患

---

## 十一、总结

Loom 项目在**规格设计层面**表现出色——GameSpec DSL、组件系统、多 Agent 管道的概念设计合理且前瞻性强。但在**实现层面**存在严重的断裂：

1. **类型安全形同虚设**：core 包的精心类型定义未被消费链有效引用
2. **测试体系全面失效**：async/await 误用导致 planner 和 code-generator 的测试都是假绿
3. **致命运行时 Bug**：code-review 的无限递归如果到达生产环境会造成不可预估的损失
4. **文档严重滞后**：多份文档仍描述"规划阶段"，与已有 7600 行代码的现实不符
5. **质量保障缺位**：harness 评估系统、JSON Schema 验证均未真正生效

建议优先处理 P0 级别的 5 个 CRITICAL 问题，随后系统性地修复类型断裂和测试失效问题。架构层面的重构可以与功能开发并行推进。
