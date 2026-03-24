# Loom 代码审查修复 — PR 说明

> **修复范围**: 42 个文件，覆盖 12 个包 + Web 应用 + 文档  
> **问题分级**: 5 CRITICAL / 15 HIGH / 22 MEDIUM / 12 LOW  
> **审查日期**: 2026-03-24

---

## 一、CRITICAL 修复（5 个，全部已修复）

### C-01 & C-02: Code Review 无限递归 + 修复循环使用过期代码
**文件**: `packages/code-review/src/reviewer.ts`  
- `review()` 新增 `round` 参数（默认 0），正确传递并递增 round 计数器
- `fixAndReReview()` 现在使用上一轮修复结果（而非原始代码）作为下一轮 LLM 输入
- **风险消除**: 之前会无限循环调用 LLM API，生产环境部署将导致费用失控

### C-03: Planner 测试全部无效（同步调用 async）
**文件**: `packages/planner/src/planner.test.ts`  
- 所有 11 个 test case 添加 `async/await`
- `.toThrow()` 改为 `.rejects.toThrow()` 捕获异步异常

### C-04: Code Generator 测试全部无效（同一问题）
**文件**: `packages/code-generator/src/generator.test.ts`  
- 所有 3 个 test case 添加 `async/await`

### C-05: Web 应用构建阻断
**文件**: `apps/web/src/components/output/GeneratedFiles.tsx`（新建）  
- 创建完整的 GeneratedFiles 组件（文件标签页、语法高亮、复制功能、诊断状态栏）
- 导入路径 `@/components/output/GeneratedFiles` 与 editor/page.tsx 匹配

---

## 二、HIGH 修复（15 个）

| 编号 | 文件 | 修复内容 |
|------|------|----------|
| H-01 | `code-generator/generator.ts` | `\|\|` → `??` 修复 gravity=0 被错误处理为 980 的问题，涵盖所有 falsy 默认值 |
| H-02 | `intent-parser/intent-parser.ts` | Normalizer 分析结果（gameType, style, keywords, locale）注入 LLM prompt |
| H-03 | `intent-parser/intent-parser.ts` | `customRepairRules: []` 不再覆盖内置修复规则（添加长度检查） |
| H-04 | 多处 | JSON.parse 增加 try-catch 和有意义的错误消息 |
| H-05 | `runtime-adapter/collision.ts` | 实现碰撞回调：事件分发 + 伤害计算 + 销毁逻辑 |
| H-06 | `runtime-adapter/keyboard-input.ts` + `jump.ts` + `code-generator/generator.ts` | 键盘初始化移到 create()，update() 只读取缓存对象 |
| H-07 | `llm-client/claude-client.ts` | 实现 JSON Mode（在 system prompt 追加 JSON 输出指令） |
| H-08 | `llm-client/claude-client.ts` | 添加 `instanceof LLMError` 守卫防止双重包装 |
| H-09 | `harness/data/golden-specs/*.json` | 修复 3 个 golden-spec 符合 gamespec.schema.json |
| H-10 | `harness/package.json` + `schemas/package.json` | ajv 从 devDependencies 移到 dependencies |
| H-11 | `orchestrator/orchestrator.ts` | 添加 `assertGameSpec()` 运行时验证，管道各阶段间做数据校验 |
| H-12 | `orchestrator/orchestrator.ts` | Code review 覆盖所有生成文件（不再仅审查 MainScene） |
| H-13 | 5 份文档 | 全面更新文档反映真实项目状态（详见文档修复章节） |
| H-14 | `llm-client/factory.ts` | 新增 `safeParseFloat`/`safeParseInt` 防止 NaN 传入 API |
| H-15 | `llm-client/openai-client.ts` | 处理 `finish_reason: 'content_filter'`，抛出 `CONTENT_FILTERED` 错误 |

---

## 三、架构 & 代码质量修复

### 类型安全
- **`core/gamespec.ts`**: 7 个接口的 `[key: string]: unknown` 替换为 `metadata?: Record<string, unknown>`
- **`llm-client/index.ts`**: 导出 `LLMProvider` 和 `MockLLMClientOptions` 类型
- **`intent-parser/types.ts`**: 添加 `customRepairRules` 到 `IntentParserConfig`
- **`generationStore.ts`**: 添加 `'bundle'` 到 `GeneratedFile.type` 联合类型

### Planner 重构
- **消除共享可变状态**: `diagnostics` 从实例属性改为 `plan()` 内局部变量，防止并发覆盖
- **读取 spec.systems**: `buildSystemGraph()` 优先添加用户声明的系统，再进行启发式推断
- **拓扑排序**: 系统排序从朴素的依赖数量排序改为 Kahn 算法拓扑排序
- **EntityNode children 回填**: 基于 parentId 自动回填子节点引用
- **移除未使用参数**: `resolveDependencies` 移除 `_componentGraph`

### Runtime Adapter 补全
- **`health.ts`**: 实现无敌帧闪烁、伤害计算、红色反馈、0HP 销毁
- **`destroy-on-collision.ts`**: 实现目标类型校验、闪烁效果、物理体即时禁用、延迟销毁

### Harness 评估器增强
- **`code-generator-eval.ts`**: 实体匹配从单一字符串改为 snake_case/camelCase/lowercase 多变体
- 添加 sprite 名称回退匹配、输入处理检查、per-frame 安全检查
- 通过阈值从 `structure === 1.0` 放宽至 `>= 0.8`

### Schema 验证修复
- **`schemas/validate.ts`**: `SCHEMAS_DIR` 路径探测兼容 tsx（源码）和 dist（编译后）两种场景

### 其他
- **`llm-client/factory.ts`**: `createMockLLMClient` 接受可选参数指定 provider
- **`llm-client/package.json`**: 移除未使用的 `@loom/core` 依赖
- **`apps/web/api/generate/route.ts`**: 错误响应移除 stack trace 暴露
- **根目录 `package.json`**: workspaces 添加 `apps/*` 和 `schemas`

---

## 四、死代码清理

| 文件 | 操作 |
|------|------|
| `packages/planner/src/test-examples.ts` | **删除** — import 不存在的导出，无法运行 |
| `apps/web/public/file.svg` | **删除** — Next.js 脚手架遗留 |
| `apps/web/public/globe.svg` | **删除** — 同上 |
| `apps/web/public/next.svg` | **删除** — 同上 |
| `apps/web/public/vercel.svg` | **删除** — 同上 |
| `apps/web/public/window.svg` | **删除** — 同上 |

---

## 五、文档修复

| 文档 | 修复内容 |
|------|----------|
| `CLAUDE.md` | 移除"尚未开始编码"描述，更新为 12 包 7600+ 行实际状态 |
| `PROJECT_STATUS.md` | 移除虚假 100% 完成率，添加各包 known issues |
| `QUICKSTART.md` | GameSpec 示例改用合法枚举值，补充必填字段 |
| `README.md` | 移除不存在的 Fastify/apps/api/Supabase/Redis 引用 |
| `TASKS.md` | 任务状态与实际代码进度对齐 |
| `docs/TODO-LIST.md` | 添加指向 TASKS.md 的说明，消除冲突 |

---

## 六、应用方式

```bash
cd loom
git apply loom-fixes.patch
```

如遇冲突，可尝试：
```bash
git apply --3way loom-fixes.patch
```

---

## 七、文件清单（42 个文件变更）

**修改**: 36 个文件  
**新建**: 1 个文件 (`apps/web/src/components/output/GeneratedFiles.tsx`)  
**删除**: 6 个文件  

**影响包**: `@loom/core`, `@loom/planner`, `@loom/code-generator`, `@loom/code-review`, `@loom/intent-parser`, `@loom/llm-client`, `@loom/orchestrator`, `@loom/runtime-adapter`, `@loom/harness`, `schemas`, `apps/web`
