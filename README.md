# Loom - AI Game Generation Platform

**自然语言生成小游戏平台**

Loom 是一个 AI 驱动的游戏生成平台，能够将自然语言描述转换为可运行的 Phaser.js 小游戏。

## 项目状态

**当前阶段**: Phase 1 核心原型 - 大部分完成
**代码量**: ~7,600 行 TypeScript，12 个包，72+ tests passing

## 架构概览

```
自然语言
  |
Intent Parser Agent -> GameSpec DSL
  |
Planner Agent -> SceneGraph + EntityGraph + ComponentGraph + SystemGraph
  |
Runtime Adapter Layer -> Phaser API Bindings
  |
Code Generator -> Phaser.js Game Code
  |
Playable Game
```

## 项目结构

```
loom/
├── packages/
│   ├── core/              # 核心类型定义（GameSpec, Graphs, Components, Adapters）
│   ├── schemas/           # JSON Schema 定义和验证
│   ├── planner/           # GameSpec -> 执行图（11/11 tests）
│   ├── runtime-adapter/   # 运行时适配器（6 个 Phaser.js adapters）
│   ├── code-generator/    # 代码生成（Template + Patch）
│   ├── orchestrator/      # 端到端管线编排（3/3 E2E tests）
│   ├── llm-client/        # LLM 客户端 - OpenAI + Claude（12/12 tests）
│   ├── intent-parser/     # 自然语言 -> GameSpec（41/41 tests）
│   ├── code-review/       # AI 代码审查
│   ├── asset-resolver/    # 资源解析 + 占位符（8/8 tests）
│   └── harness/           # 评估框架（3 golden tests）
├── apps/
│   └── web/               # Next.js 前端
├── schemas/               # 共享 JSON Schema 文件
├── examples/              # 示例 GameSpec JSON 文件
└── docs/                  # 设计规格文档（11 个）
```

## 快速开始

### 前置要求
- Node.js 18+
- pnpm 8+

### 安装和构建

```bash
pnpm install
pnpm build
```

### 运行测试

```bash
pnpm test
```

### 启动 Web 开发服务器

```bash
cd apps/web
pnpm dev
```

详细使用说明请查看 [QUICKSTART.md](./QUICKSTART.md)。

## 文档导航

### 项目管理
- **[CLAUDE.md](./CLAUDE.md)** - 项目概览和架构指南
- **[PROJECT_STATUS.md](./PROJECT_STATUS.md)** - 开发进度总结
- **[TASKS.md](./TASKS.md)** - 任务看板
- **[DEVELOPMENT_ROADMAP.md](./DEVELOPMENT_ROADMAP.md)** - 开发路线图
- **[QUICKSTART.md](./QUICKSTART.md)** - 安装和使用指南

### 规格文档
- **[PRD + TDD](./docs/ai_game_platform_prd_tdd.md)** - 产品需求和技术设计文档
- **[GameSpec DSL Spec](./docs/gamespec_dsl_v_1_spec.md)** - 核心协议层规范
- **[Component Spec](./docs/gamespec_component_spec_v_1.md)** - 组件系统规范
- **[Intent Parser Spec](./docs/intent_parser_agent_v_1_spec.md)** - 自然语言解析规范
- **[Planner Spec](./docs/planner_agent_v_1_spec.md)** - 规划器规范
- **[Runtime Adapter Spec](./docs/runtime_adapter_layer_v_1_spec.md)** - 运行时适配层规范
- **[Orchestrator Spec](./docs/game_builder_runtime_orchestrator_v_1_spec.md)** - 编排器规范
- **[Code Generator Spec](./docs/code_generator_agent_v_1_spec.md)** - 代码生成器规范
- **[Asset Resolution Spec](./docs/asset_resolution_system_v_1_spec.md)** - 资源解析系统规范
- **[LLM Integration Guide](./docs/llm_integration_guide_v_1.md)** - LLM 集成指南
- **[Glossary](./docs/glossary.md)** - 术语表

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | Next.js, React, Tailwind CSS |
| 游戏引擎 | Phaser.js 3 |
| 语言 | TypeScript (strict mode) |
| Monorepo | pnpm workspaces + Turborepo |
| 测试 | Vitest |
| AI/LLM | OpenAI GPT-4o, Claude 3.5 Sonnet |

## 开发路线

1. **Phase 0** (Week 1): 项目初始化 -- **已完成**
2. **Phase 1** (Week 2-3): 核心原型 -- **大部分完成**
3. **Phase 2** (Week 4-6): Web UI + 浏览器验证 -- 进行中
4. **Phase 3** (Week 7-12): MVP 完善和发布 -- 未开始

## 许可证

待定

## 联系方式

- 问题反馈: GitHub Issues
