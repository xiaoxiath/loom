# Loom - AI Game Generation Platform

**自然语言生成小游戏平台**

Loom 是一个 AI 驱动的游戏生成平台，能够将自然语言描述转换为可运行的小游戏。

## 🎯 项目状态

**当前阶段**: 规划完成，准备开始开发
**开发就绪度**: 60% - 可以开始原型开发

## 📚 文档导航

### 核心文档
- **[CLAUDE.md](./CLAUDE.md)** - 项目概览和架构指南（给 Claude Code 使用）
- **[DEVELOPMENT_ROADMAP.md](./DEVELOPMENT_ROADMAP.md)** - 完整开发路线图和任务清单
- **[TASKS.md](./TASKS.md)** - 当前任务看板和优先级

### 规格文档
- **[规格审核报告](./docs/spec_review_report.md)** - 文档完整性和开发就绪度评估
- **[PRD + TDD](./docs/ai_game_platform_prd_tdd.md)** - 产品需求和技术设计文档
- **[GameSpec DSL Spec](./docs/gamespec_dsl_v_1_spec.md)** - 核心协议层规范
- **[Component Spec](./docs/gamespec_component_spec_v_1.md)** - 组件系统规范
- **[Intent Parser Spec](./docs/intent_parser_agent_v_1_spec.md)** - 自然语言解析规范
- **[Planner Spec](./docs/planner_agent_v_1_spec.md)** - 规划器规范
- **[Runtime Adapter Spec](./docs/runtime_adapter_layer_v_1_spec.md)** - 运行时适配层规范
- **[Orchestrator Spec](./docs/game_builder_runtime_orchestrator_v_1_spec.md)** - 编排器规范
- **[Code Generator Spec](./docs/code_generator_agent_v_1_spec.md)** - 代码生成器规范 ⭐ NEW
- **[Asset Resolution Spec](./docs/asset_resolution_system_v_1_spec.md)** - 资源解析系统规范 ⭐ NEW
- **[LLM Integration Guide](./docs/llm_integration_guide_v_1.md)** - LLM 集成指南 ⭐ NEW
- **[Glossary](./docs/glossary.md)** - 术语表 ⭐ NEW

## 🏗️ 架构概览

```
自然语言
  ↓
Intent Parser Agent → GameSpec DSL
  ↓
Planner Agent → SceneGraph + EntityGraph + ComponentGraph
  ↓
Runtime Adapter Layer → Phaser API Bindings
  ↓
Code Generator → Phaser.js Game Code
  ↓
Playable Game
```

## 🚀 快速开始

### 前置要求
- Node.js 18+
- pnpm 8+
- TypeScript 5+

### 开发路线

1. **Phase 0** (Week 1): 项目初始化
   - 初始化 monorepo
   - 定义核心类型和 JSON Schema
   - 补充缺失规格

2. **Phase 1** (Week 2-3): 核心原型
   - 简化版 Planner
   - Runtime Adapters
   - Code Generator
   - 端到端集成

3. **Phase 2-6** (Week 4-12): 完整实现
   - Intent Parser (LLM)
   - Asset Resolution
   - Web 编辑器
   - Backend API
   - 部署上线

详细计划请查看 [DEVELOPMENT_ROADMAP.md](./DEVELOPMENT_ROADMAP.md)

## 📋 当前任务

查看 [TASKS.md](./TASKS.md) 了解当前待办事项和优先级。

### 下一步行动
- [ ] Task #2: 初始化 monorepo 结构
- [ ] Task #3: 创建核心类型定义
- [ ] Task #4: 定义 JSON Schemas
- [ ] Task #5: 补充缺失规格文档

## 🎯 MVP 目标

### 核心功能
- ✅ 自然语言输入
- [ ] GameSpec 生成
- [ ] 游戏代码生成
- [ ] 游戏预览
- [ ] 基础编辑
- [ ] 分享功能

### 支持游戏类型
- [ ] 跳跃类 (Jumper)
- [ ] 跑酷类 (Runner)
- [ ] 躲避类 (Dodger)
- [ ] 射击类 (Shooter)

## 🛠️ 技术栈

### 前端
- React / Next.js
- Tailwind CSS
- Zustand
- React Flow
- Monaco Editor

### 后端
- Node.js / Bun
- Fastify
- PostgreSQL (Supabase)
- Redis

### 游戏引擎
- Phaser.js 3

### AI / LLM
- OpenAI GPT-4
- Claude 3.5
- Stable Diffusion / DALL·E

### 基础设施
- Vercel (前端)
- Fly.io (后端)
- Supabase (数据库)
- S3 + CDN (资源)

## 📊 项目进度

- **规格设计**: ✅ 90% 完成
- **原型开发**: ⏳ 0% 待开始
- **MVP 开发**: ⏳ 0% 待开始

### 里程碑

- **Milestone 1** (Week 3): Hello World 原型
- **Milestone 2** (Week 6): 自然语言输入
- **Milestone 3** (Week 12): MVP 发布

## 🤝 贡献指南

当前项目处于初始规划阶段，暂不接受外部贡献。

## 📄 许可证

待定

## 📞 联系方式

- 项目维护者: [待补充]
- 问题反馈: GitHub Issues

---

**Building the future of game creation with AI 🎮✨**
