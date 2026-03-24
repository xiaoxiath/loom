# Loom 项目 TODO 清单

> **注意**: 任务看板的权威来源是 [TASKS.md](../TASKS.md)。本文件提供按类别分组的补充视图。
> 如果两者存在冲突，以 TASKS.md 为准。

**最后同步日期**: 2026-03-24

---

## 已完成

### 核心管线（全部完成，72+ tests passing）
- [x] Monorepo 架构（pnpm + Turborepo）
- [x] 核心类型系统（@loom/core）
- [x] JSON Schema 定义（@loom/schemas）
- [x] Planner Agent（@loom/planner, 11/11 tests）
- [x] Runtime Adapter Layer（@loom/runtime-adapter, 6 adapters）
- [x] Code Generator（@loom/code-generator, 8 阶段）
- [x] LLM Client（@loom/llm-client, 12/12 tests）
- [x] Intent Parser Agent（@loom/intent-parser, 41/41 tests）
- [x] Asset Resolver（@loom/asset-resolver, 8/8 tests）
- [x] E2E Orchestrator（@loom/orchestrator, 3/3 tests）
- [x] 评估框架（@loom/harness, 3 golden tests）
- [x] 资源库系统（14 SVG placeholders）
- [x] 示例 GameSpec 文件（3 个）
- [x] 规格文档（11 个）

---

## 高优先级

### 1. 浏览器运行时验证
- [ ] 在浏览器中测试生成的 Phaser 游戏
- [ ] 验证游戏可玩性
- [ ] 修复 Phaser 游戏中的运行时 bug

### 2. Web UI 完善（apps/web）
- [ ] GameSpec 编辑器（Monaco Editor 集成）
- [ ] 游戏预览区域
- [ ] 自然语言输入框 + 生成按钮
- [ ] 下载生成代码

---

## 中优先级

### 3. Orchestrator 增强
- [ ] 会话管理
- [ ] 版本控制
- [ ] 增量更新
- [ ] 状态持久化

### 4. 错误处理和 UX
- [ ] 友好的错误消息
- [ ] 交互式澄清（用户输入不明确时）
- [ ] 进度反馈
- [ ] 调试工具

### 5. CI/CD
- [ ] GitHub Actions 配置
- [ ] 自动化测试
- [ ] 自动化构建

---

## 低优先级

### 6. 扩展功能
- [ ] 更多游戏类型（RPG, 解谜, 策略, 卡牌）
- [ ] 多场景游戏
- [ ] 多引擎支持（Godot, Unity）

### 7. 性能优化
- [ ] 缓存机制（Prompt -> Spec）
- [ ] 并行处理
- [ ] 增量生成

### 8. 资源增强
- [ ] Kenney 资源集成
- [ ] AI 生成资源（长期）

### 9. 开发者工具
- [ ] 可视化编辑器
- [ ] GameSpec 调试器
- [ ] 性能分析工具

---

## 按维度分组

| 维度 | 完成度 | 下一步 |
|------|--------|--------|
| 核心管线 | 100% | 浏览器验证 |
| 测试覆盖 | 72+ tests | 运行时测试 |
| 资源系统 | 90% | Kenney 集成 |
| 用户界面 | 脚手架 | Web UI 完善 |
| 基础设施 | 50% | CI/CD |
| 文档 | 90% | API 文档 |
