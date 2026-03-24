# Loom 开发任务看板

创建日期：2026-03-21
最后更新：2026-03-24
当前阶段：Phase 1 核心原型 - 大部分完成

---

## 任务状态总览

| 任务 | 状态 | 备注 |
|------|------|------|
| Task #2: 初始化 monorepo | Completed | |
| Task #3: 核心类型定义 | Completed | @loom/core |
| Task #4: JSON Schemas | Completed | @loom/schemas |
| Task #5: 补充规格文档 | Completed | 11 个规格文档 |
| Task #6: 示例 GameSpec | Completed | 3 个示例 |
| Task #7: Planner Agent | Completed | 11/11 tests |
| Task #8: Runtime Adapter | Completed | 6 个适配器 |
| Task #9: Code Generator | Completed | 8 阶段生成 |
| Task #10: 端到端集成 | Completed | 3/3 E2E tests（需浏览器验证） |

---

## Phase 0 - 项目初始化（Completed）

#### Task #2: Initialize monorepo structure
**状态**: Completed
**输出**: 完整的 pnpm monorepo，Turborepo 配置，12 个包

#### Task #3: Create core type definitions
**状态**: Completed
**输出**: @loom/core 包（GameSpec, Graphs, Components, Adapters 类型）

#### Task #4: Define JSON Schemas
**状态**: Completed
**输出**: schemas/ 目录下 6 个 JSON Schema 文件 + 验证工具

#### Task #5: Write missing specification documents
**状态**: Completed
**输出**: Code Generator Spec, Asset Resolution Spec, LLM Integration Guide, Glossary

---

## Phase 1 - 核心原型（大部分完成）

#### Task #6: Create example GameSpec files
**状态**: Completed
**完成日期**: 2026-03-21
**输出**: 3 个完整的 GameSpec 示例（Flappy Bird, Space Runner, Galactic Shooter）

#### Task #7: Implement simplified Planner Agent
**状态**: Completed
**完成日期**: 2026-03-21
**输出**: @loom/planner 包，5 阶段规划，11/11 tests passing

#### Task #8: Implement Runtime Adapter Layer
**状态**: Completed
**输出**: @loom/runtime-adapter 包，6 个核心 Adapters

#### Task #9: Implement basic Code Generator
**状态**: Completed
**输出**: @loom/code-generator 包，Template + Patch 策略

#### Task #10: End-to-end integration test
**状态**: Completed（部分）
**输出**: @loom/orchestrator，3/3 E2E tests passing
**遗留问题**: 生成的游戏代码未在浏览器中验证可玩性

---

## Phase 2 - 待开始

#### Task #11: 浏览器运行时验证
**状态**: Pending
**描述**: 在浏览器中运行生成的 Phaser 游戏，验证可玩性
**优先级**: P0

#### Task #12: Web UI 完善
**状态**: Pending
**描述**: 完善 apps/web，实现 GameSpec 编辑器和游戏预览
**优先级**: P1

#### Task #13: CI/CD 配置
**状态**: Pending
**描述**: GitHub Actions 自动化测试和构建
**优先级**: P2

---

## 额外已完成的包（超出原计划）

以下包在 Phase 1 过程中也已实现：

- **@loom/llm-client** - LLM 客户端（12/12 tests）
- **@loom/intent-parser** - Intent Parser（41/41 tests）
- **@loom/asset-resolver** - 资源解析（8/8 tests）
- **@loom/code-review** - 代码审查 Agent
- **@loom/harness** - 评估框架（3 golden tests）

---

## 任务依赖关系

```
Task #2 (Monorepo)
├── Task #3 (Core Types)
├── Task #4 (JSON Schemas)
└── Task #5 (Specs)

Task #3 + Task #6 (Examples)
└── Task #7 (Planner)

Task #3
└── Task #8 (Runtime Adapters)

Task #7 + Task #8
└── Task #9 (Code Generator)

Task #9
└── Task #10 (Integration Test)

Task #10
├── Task #11 (Browser Validation)
└── Task #12 (Web UI)
```

---

## 里程碑

### Milestone 1: Hello World 原型
- [x] 完成所有 Phase 0 任务
- [x] 完成所有 Phase 1 任务
- [ ] 浏览器运行时验证
- **进度**: ~90%

### Milestone 2: 自然语言输入
- [x] Intent Parser 实现
- [ ] 集成到 Web UI
- **状态**: 部分完成

### Milestone 3: MVP 发布
- **目标**: Week 12
- **状态**: 未开始

---

## 相关文档

- [开发路线图](./DEVELOPMENT_ROADMAP.md)
- [项目状态](./PROJECT_STATUS.md)
- [项目指南](./CLAUDE.md)
- [TODO 清单](./docs/TODO-LIST.md)
