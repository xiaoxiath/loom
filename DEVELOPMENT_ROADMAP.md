# Loom 开发路线图与任务清单

创建日期：2026-03-21
目标：从规格到 MVP 的完整开发计划
策略：原型驱动 + 迭代完善

---

## 🎯 开发阶段总览

```
Phase 0: 项目初始化 (Week 1)
   ↓
Phase 1: 核心原型 - Happy Path (Week 2-3)
   ↓
Phase 2: 规格补充与架构完善 (Week 4)
   ↓
Phase 3: Intent Parser Agent (Week 5-6)
   ↓
Phase 4: Asset Resolution System (Week 7-8)
   ↓
Phase 5: 可视化编辑器 (Week 9-10)
   ↓
Phase 6: 集成与优化 (Week 11-12)
   ↓
MVP Release
```

---

## 📋 Phase 0: 项目初始化 (Week 1)

### 0.1 项目基础设施
- [ ] 初始化 monorepo 结构
  ```
  loom/
  ├ packages/
  │  ├ core/              # 核心库（GameSpec, Graph 定义）
  │  ├ intent-parser/     # Intent Parser Agent
  │  ├ planner/           # Planner Agent
  │  ├ code-generator/    # Code Generator Agent
  │  ├ runtime-adapter/   # Runtime Adapter Layer
  │  ├ asset-resolver/    # Asset Resolution System
  │  └ orchestrator/      # Runtime Orchestrator
  ├ apps/
  │  ├ web/               # 前端应用
  │  └ api/               # 后端 API
  ├ schemas/              # JSON Schema 定义
  ├ templates/            # Phaser 模板项目
  └ docs/                 # 文档
  ```

- [ ] 配置开发环境
  - [ ] TypeScript + strict mode
  - [ ] ESLint + Prettier
  - [ ] Jest 测试框架
  - [ ] Turborepo / Nx 构建
  - [ ] Git hooks (husky + lint-staged)

- [ ] 设置 CI/CD
  - [ ] GitHub Actions
  - [ ] 自动测试
  - [ ] 自动构建
  - [ ] 自动部署（Vercel + Fly.io）

### 0.2 核心类型定义
- [ ] 创建 `@loom/core` 包
- [ ] 定义 GameSpec TypeScript 类型
- [ ] 定义 Graph 类型（SceneGraph, EntityGraph, ComponentGraph, SystemGraph）
- [ ] 定义 Component 类型
- [ ] 定义 Adapter 接口
- [ ] 编写单元测试

### 0.3 JSON Schema 定义
- [ ] 创建 `schemas/` 目录
- [ ] 编写 `gamespec.schema.json`
- [ ] 编写 `component.schema.json`
- [ ] 编写 `sceneGraph.schema.json`
- [ ] 编写 `entityGraph.schema.json`
- [ ] 编写 `componentGraph.schema.json`
- [ ] 编写 `systemGraph.schema.json`
- [ ] 添加 schema 验证工具
- [ ] 生成 TypeScript 类型（json-schema-to-typescript）

### 0.4 文档补充
- [ ] 编写 Code Generator Agent Spec
- [ ] 编写 Asset Resolution System Spec
- [ ] 编写 LLM Integration Guide
- [ ] 创建术语表（Glossary）
- [ ] 更新 README.md

---

## 🧪 Phase 1: 核心原型 - Happy Path (Week 2-3)

**目标**：实现端到端最小可运行原型，跳过复杂功能

### 1.1 硬编码 GameSpec 示例
- [ ] 创建 3 个示例 GameSpec
  - [ ] Flappy Bird 风格（jump + gravity + collision）
  - [ ] 跑酷游戏（run + jump + spawn）
  - [ ] 射击游戏（shoot + destroy）

### 1.2 简化版 Planner Agent
- [ ] 实现 `@loom/planner` 包基础结构
- [ ] 实现基础 SceneGraph 生成
  - [ ] 单场景支持
  - [ ] Camera follow player
- [ ] 实现基础 EntityGraph 生成
  - [ ] Player entity
  - [ ] Enemy/Obstacle entities
- [ ] 实现基础 ComponentGraph 生成
  - [ ] Component 依赖解析（jump → gravity）
  - [ ] Auto-injection 逻辑
- [ ] 实现基础 SystemGraph 生成
  - [ ] Physics system
  - [ ] Collision system
  - [ ] Input system
- [ ] 编写单元测试

### 1.3 基础 Runtime Adapter Layer
- [ ] 实现 `@loom/runtime-adapter` 包
- [ ] 定义 Adapter 接口
- [ ] 实现 AdapterRegistry
- [ ] 实现核心 Adapters（Phaser）
  - [ ] JumpAdapter
  - [ ] GravityAdapter
  - [ ] KeyboardInputAdapter
  - [ ] CollisionAdapter
  - [ ] HealthAdapter
  - [ ] DestroyOnCollisionAdapter
- [ ] 编写单元测试

### 1.4 简单 Code Generator
- [ ] 实现 `@loom/code-generator` 包
- [ ] 创建 Phaser 模板项目
  ```
  templates/phaser-basic/
  ├ src/
  │  ├ scenes/
  │  │  └ MainScene.ts
  │  ├ entities/
  │  │  └ Player.ts
  │  ├ systems/
  │  │  ├ PhysicsSystem.ts
  │  │  └ CollisionSystem.ts
  │  └ config.ts
  ├ index.html
  └ package.json
  ```
- [ ] 实现模板变量替换
- [ ] 实现基于 Graph 的代码生成
  - [ ] Scene file 生成
  - [ ] Entity files 生成
  - [ ] System files 生成
  - [ ] Config file 生成
- [ ] 实现文件输出
- [ ] 测试生成的代码可运行

### 1.5 最小化 Orchestrator
- [ ] 实现 `@loom/orchestrator` 包基础结构
- [ ] 实现 BuildSession 管理
- [ ] 实现基础 Pipeline 执行
  ```
  GameSpec → Planner → AdapterBinding → CodeGenerator → Bundle
  ```
- [ ] 实现状态机（INIT → PLANNING → GENERATING → READY）
- [ ] 跳过缓存、错误恢复等复杂功能

### 1.6 集成测试
- [ ] 端到端测试：GameSpec → 可运行游戏
- [ ] 验证生成的游戏可在浏览器运行
- [ ] 手动测试游戏玩法
- [ ] 修复集成问题

### 1.7 占位符 Assets
- [ ] 创建占位符 sprites（简单几何图形）
- [ ] 占位符音效（静音或简单 beep）
- [ ] Asset 路径映射

---

## 📝 Phase 2: 规格补充与架构完善 (Week 4)

### 2.1 基于原型经验更新规格
- [ ] 更新 Code Generator Spec（基于实际实现）
- [ ] 更新 Runtime Adapter Spec（补充实现细节）
- [ ] 更新 Planner Spec（补充实际规则）

### 2.2 编写 Asset Resolution Spec
- [ ] Asset Registry 设计
- [ ] 资源匹配算法
- [ ] AI 生成集成方案
- [ ] 缓存策略

### 2.3 架构优化
- [ ] 重构原型代码，提升可维护性
- [ ] 优化类型定义
- [ ] 完善错误处理
- [ ] 添加日志系统

### 2.4 测试覆盖
- [ ] 提升单元测试覆盖率到 80%
- [ ] 添加集成测试
- [ ] 性能基准测试

---

## 🤖 Phase 3: Intent Parser Agent (Week 5-6)

### 3.1 LLM 集成基础设施
- [ ] 实现 `@loom/llm-client` 包
- [ ] 支持 OpenAI API
- [ ] 支持 Claude API
- [ ] 实现 fallback 机制
- [ ] 实现重试逻辑
- [ ] 实现速率限制

### 3.2 Prompt Engineering
- [ ] 设计 Intent Parser System Prompt
- [ ] 编写 Few-shot Examples
  - [ ] Jumper game example
  - [ ] Shooter game example
  - [ ] Runner game example
- [ ] JSON Schema 注入方式
- [ ] 测试 Prompt 效果

### 3.3 Intent Parser Agent 实现
- [ ] 实现 `@loom/intent-parser` 包
- [ ] Prompt Normalization
- [ ] Intent Extraction
- [ ] Slot Filling
- [ ] Schema Constrained Decoding（使用 LLM JSON mode）
- [ ] Semantic Repair Engine
  - [ ] 实现 Repair Rules
  - [ ] 自动补全逻辑
- [ ] Default Injection
- [ ] Validation
- [ ] Confidence Scoring
- [ ] 交互式澄清机制

### 3.4 测试与优化
- [ ] 准备测试数据集（50+ prompts）
- [ ] 测试生成质量
- [ ] 优化 Prompt
- [ ] 测量准确率和稳定性

---

## 🎨 Phase 4: Asset Resolution System (Week 7-8)

### 4.1 Asset Registry
- [ ] 实现 `@loom/asset-resolver` 包
- [ ] 集成 Kenney 资源库
  - [ ] 下载和索引资源
  - [ ] 建立元数据索引
- [ ] 资源分类和标签系统
- [ ] 搜索引擎

### 4.2 资源匹配算法
- [ ] 基于 GameSpec 的资源需求分析
- [ ] 风格匹配（像素风、卡通、写实）
- [ ] 主题匹配（太空、森林、城市）
- [ ] 相似度计算

### 4.3 AI 生成集成
- [ ] Stable Diffusion API 集成
- [ ] DALL·E API 集成（备选）
- [ ] Prompt 生成策略
- [ ] 风格一致性保证
- [ ] 资源后处理（resize, optimize）

### 4.4 资源管理
- [ ] S3 存储集成
- [ ] CDN 分发
- [ ] 缓存策略
- [ ] 版本管理

### 4.5 集成测试
- [ ] 测试资源解析流程
- [ ] 测试 AI 生成质量
- [ ] 性能测试

---

## 🖥️ Phase 5: 可视化编辑器 (Week 9-10)

### 5.1 Web 前端基础
- [ ] 初始化 Next.js 项目（`apps/web`）
- [ ] 配置 Tailwind CSS
- [ ] 状态管理（Zustand）
- [ ] 路由设计

### 5.2 Prompt 输入面板
- [ ] 自然语言输入框
- [ ] 示例 Prompt 展示
- [ ] 生成进度展示
- [ ] 错误提示

### 5.3 GameSpec 编辑器
- [ ] JSON 编辑器（Monaco Editor）
- [ ] 可视化表单编辑器
- [ ] 实时预览
- [ ] 版本历史

### 5.4 Scene 可视化编辑
- [ ] 集成 React Flow
- [ ] Entity 节点可视化
- [ ] Component 绑定可视化
- [ ] 拖拽编辑

### 5.5 游戏预览窗口
- [ ] iframe 沙箱
- [ ] Phaser 游戏嵌入
- [ ] 实时刷新
- [ ] 调试工具

### 5.6 分享功能
- [ ] 生成分享链接
- [ ] 导出源码
- [ ] 导出可执行文件（可选）

---

## 🔌 Phase 6: Backend API & 集成 (Week 11-12)

### 6.1 Backend API
- [ ] 初始化 Fastify 项目（`apps/api`）
- [ ] RESTful API 设计
  ```
  POST /api/generate          # 生成游戏
  GET  /api/projects/:id      # 获取项目
  PUT  /api/projects/:id      # 更新项目
  POST /api/preview/:id       # 预览游戏
  GET  /api/assets/search     # 搜索资源
  ```
- [ ] WebSocket 实时通信
- [ ] 认证授权（Supabase Auth）
- [ ] 文件上传

### 6.2 数据库
- [ ] Supabase PostgreSQL 设置
- [ ] 表结构设计
  ```sql
  users
  projects
  gamespecs
  assets
  versions
  ```
- [ ] 迁移脚本
- [ ] 索引优化

### 6.3 完整集成
- [ ] 前后端联调
- [ ] 端到端测试
  - [ ] 用户输入 Prompt
  - [ ] 生成 GameSpec
  - [ ] 编辑 GameSpec
  - [ ] 生成游戏
  - [ ] 预览游戏
  - [ ] 分享游戏
- [ ] 性能优化
- [ ] 错误处理完善

### 6.4 部署
- [ ] 前端部署到 Vercel
- [ ] 后端部署到 Fly.io
- [ ] 数据库部署到 Supabase
- [ ] CDN 配置
- [ ] 域名配置

### 6.5 监控与日志
- [ ] 错误监控（Sentry）
- [ ] 性能监控
- [ ] 日志收集
- [ ] 告警配置

---

## 🎯 MVP 功能清单

### 核心功能（必须）
- [x] 自然语言输入
- [ ] GameSpec 生成
- [ ] 游戏代码生成
- [ ] 游戏预览
- [ ] 基础编辑功能
- [ ] 分享链接

### 游戏类型支持（必须）
- [ ] 跳跃类（Jumper）
- [ ] 跑酷类（Runner）
- [ ] 躲避类（Dodger）
- [ ] 射击类（Shooter）

### 组件支持（必须）
- [ ] Movement: jump, run
- [ ] Physics: gravity, collision
- [ ] Input: keyboard
- [ ] Lifecycle: health, destroy
- [ ] Scoring: distance, kill

### 次要功能（可选）
- [ ] 高级编辑器
- [ ] 多场景支持
- [ ] 多人游戏
- [ ] 3D 游戏
- [ ] Unity 导出

---

## 📊 里程碑与验收标准

### Milestone 1: Hello World (End of Week 3)
**目标**：端到端原型可运行
- [ ] 硬编码 GameSpec 能生成可运行的 Phaser 游戏
- [ ] 游戏包含 player, gravity, jump, collision
- [ ] 可在浏览器中手动测试

**验收**：演示视频 + 可运行的游戏链接

### Milestone 2: Natural Language Input (End of Week 6)
**目标**：支持自然语言生成游戏
- [ ] Intent Parser 集成完成
- [ ] 用户输入自然语言可生成游戏
- [ ] 生成成功率 > 70%

**验收**：10 个测试 Prompt，7 个以上生成成功

### Milestone 3: Complete MVP (End of Week 12)
**目标**：MVP 发布
- [ ] 所有核心功能完成
- [ ] 前后端集成完成
- [ ] 部署到生产环境
- [ ] 用户可用

**验收**：完整的产品演示 + 用户测试

---

## 🔧 技术债务与优化

### 持续进行
- [ ] 代码审查
- [ ] 性能优化
- [ ] 测试覆盖率提升
- [ ] 文档更新
- [ ] 依赖更新

### Phase 7: Post-MVP
- [ ] 多场景支持
- [ ] 高级组件系统
- [ ] 模板市场
- [ ] 社区功能
- [ ] 3D 游戏支持
- [ ] Unity 导出

---

## 📝 开发规范

### Git 工作流
- [ ] 使用 Git Flow
- [ ] Feature branches
- [ ] PR 审查
- [ ] Conventional Commits

### 代码规范
- [ ] TypeScript strict mode
- [ ] ESLint + Prettier
- [ ] 单元测试覆盖率 > 80%
- [ ] 集成测试覆盖关键路径

### 文档规范
- [ ] API 文档（OpenAPI）
- [ ] 组件文档（Storybook）
- [ ] 架构决策记录（ADR）
- [ ] 更新 README

---

## 🚨 风险与缓解

### 风险 1: LLM 生成不稳定
**缓解**：
- JSON Schema constrained decoding
- Few-shot examples
- Fallback templates
- 人工审查机制

### 风险 2: 生成的代码质量低
**缓解**：
- 模板驱动生成
- 代码审查
- 自动化测试
- 持续优化模板

### 风险 3: 性能问题
**缓解**：
- 缓存策略
- 增量生成
- 性能监控
- 优化算法

### 风险 4: 资源管理复杂
**缓解**：
- 使用成熟资源库
- AI 生成作为备选
- 缓存和 CDN

---

## 📚 学习资源

### 必读
- [ ] Phaser 3 官方文档
- [ ] OpenAI JSON Mode 文档
- [ ] Claude API 文档
- [ ] JSON Schema 规范

### 推荐
- [ ] Game Programming Patterns
- [ ] Entity Component System 架构
- [ ] LLM Prompt Engineering 指南

---

## 📅 每周检查清单

### Weekly Review
- [ ] 进度回顾
- [ ] 阻塞问题讨论
- [ ] 下周计划
- [ ] 技术债务清理

### Weekly Demo
- [ ] 演示本周完成的功能
- [ ] 收集反馈
- [ ] 记录改进点

---

## ✅ 如何使用此 TODO List

1. **按 Phase 顺序执行**：不要跳跃，每个 Phase 都有依赖关系
2. **每周检查**：每周五回顾进度，调整计划
3. **灵活调整**：根据实际情况调整任务优先级
4. **记录问题**：遇到阻塞立即记录并寻求帮助
5. **持续更新**：完成的任务立即勾选，新增任务及时添加

---

**下一步行动**：开始 Phase 0 - 项目初始化 🚀
