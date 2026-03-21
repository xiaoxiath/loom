# Loom 规格文档审核报告

审核日期：2026-03-21
审核范围：docs/ 目录所有规格文档
审核目标：评估开发就绪程度

---

## 📊 总体评估

**开发就绪度：🟡 部分就绪（需要补充关键规格）**

当前规格文档在架构设计和核心概念上表现出色，但缺少实现层面的细节和关键组件的完整规格。可以开始**架构原型开发**，但**生产级开发**需要补充以下内容。

---

## ✅ 优点

### 1. 架构清晰完整
- ✅ 端到端流程完整定义：NL → GameSpec → Graphs → Runtime
- ✅ 关注点分离明确：每个 Agent 职责清晰
- ✅ 中间层抽象合理：GameSpec DSL 作为稳定协议层

### 2. 核心概念一致
- ✅ GameSpec DSL 作为核心数据格式贯穿全系统
- ✅ 组件系统设计清晰，支持组合和依赖
- ✅ Runtime Adapter 抽象层支持多引擎扩展

### 3. 稳定性设计考虑周全
- ✅ JSON Schema 约束生成避免 LLM 不稳定性
- ✅ 模板 + Patch 策略而非全量代码生成
- ✅ 增量更新机制设计

### 4. 可扩展性良好
- ✅ 插件机制（组件、Adapter、规则）
- ✅ 版本控制和迁移策略
- ✅ 扩展字段（extensions）设计

---

## ❌ 关键缺失

### 1. 🔴 缺少 Code Generator 规格（阻塞性）

**问题描述**：
- PRD 提到 Code Generator 模块
- Orchestrator 提到 CodeGenerator 调度
- **但没有独立的 Code Generator Agent 规格**

**需要补充**：
```
Code Generator Agent Spec 应包含：
├ 输入：SceneGraph + EntityGraph + ComponentGraph + AdapterBindings
├ 输出：Phaser 代码结构（scene files, entity files, system files）
├ 模板系统设计
│   ├ 基础模板项目结构
│   ├ 模板变量系统
│   └─ Patch 生成策略
├ 代码组织规范
│   ├ 文件命名约定
│   ├ 目录结构
│   └─ 模块化策略
├ Phaser API 封装层
└ 错误处理和回退策略
```

**影响**：无法实现从 Graph 到可运行代码的关键步骤

---

### 2. 🔴 缺少 Asset Resolution 规格（阻塞性）

**问题描述**：
- GameSpec 引用 assets
- Orchestrator 提到 AssetResolver
- **但没有详细的 Asset Resolution 规格文档**

**需要补充**：
```
Asset Resolution System Spec 应包含：
├ Asset Registry 设计
│   ├ 资源库索引结构（Kenney, itch.io）
│   ├ 资源元数据格式
│   └─ 搜索和匹配算法
├ 资源解析策略
│   ├ 缓存优先级
│   ├ 库资源匹配规则
│   └─ AI 生成触发条件
├ AI 资源生成
│   ├ Stable Diffusion / DALL·E 集成
│   ├ Prompt 生成策略
│   └─ 风格一致性保证
├ 资源管理
│   ├ 存储策略（S3）
│   ├ CDN 分发
│   └─ 版本管理
└ 资源引用解析
    ├ ID → URL 映射
    ├ 资源加载流程
    └─ 失败回退策略
```

**影响**：生成的游戏缺少视觉和音频资源

---

### 3. 🟡 缺少正式 JSON Schema 定义（半阻塞）

**问题描述**：
- GameSpec DSL Spec 只有示例，没有正式的 JSON Schema 文件
- Intent Parser 依赖 Schema 约束生成
- 验证层需要 Schema

**需要补充**：
```
gamespec_json_schema_v1.json
├ $schema, $ref 定义
├ 完整的 type 定义
├ required 字段标注
├ enum 约束
├ 嵌套对象定义
└ 验证规则
```

**建议**：创建 `schemas/` 目录存放所有 JSON Schema

---

### 4. 🟡 Graph 数据结构未完全定义（半阻塞）

**问题描述**：
Planner 输出四种 Graph，但规格中只有描述性定义，缺少精确的数据结构。

**需要补充**：
```json
// SceneGraph Schema
{
  "scenes": [{
    "id": "string",
    "type": "single | multi",
    "camera": { "follow": "string", "bounds": {} },
    "worldBounds": { "width": "number", "height": "number" }
  }]
}

// EntityGraph Schema
{
  "nodes": [{
    "id": "string",
    "type": "entityType",
    "parentId": "string?",
    "children": ["string"]
  }],
  "edges": [{
    "from": "string",
    "to": "string",
    "type": "spawns | follows | collides"
  }]
}

// ComponentGraph Schema
{
  "entityComponents": {
    "entityId": ["componentType"]
  }
}

// SystemGraph Schema
{
  "systems": ["systemType"],
  "dependencies": [{
    "system": "string",
    "requires": ["string"]
  }]
}
```

---

### 5. 🟡 LLM Prompt Engineering 未定义（半阻塞）

**问题描述**：
系统依赖 LLM 进行多个关键步骤，但没有定义如何与 LLM 交互。

**需要补充**：
```
LLM Integration Spec 或每个 Agent 的 Prompt 工程部分：
├ Intent Parser Prompts
│   ├ System prompt 模板
│   ├ Few-shot examples
│   └ JSON Schema 注入方式
├ Planner Prompts
│   └ 推理规则提示
├ 模型选择
│   ├ 推荐模型（GPT-4, Claude 3.5）
│   ├ 参数配置（temperature, top_p）
│   └─ Fallback 模型
└ 错误处理
    ├ 重试策略
    ├ 降级策略
    └ 输出验证和修复
```

---

### 6. 🟡 Runtime Adapter 实现细节不足（半阻塞）

**问题描述**：
Runtime Adapter 规格概念清晰，但缺少具体实现模式。

**需要补充**：
```typescript
// Adapter 接口定义
interface RuntimeAdapter {
  componentType: string;
  engine: string;
  version: string;

  // 生命周期钩子
  onCreate(entity: Entity, config: any): void;
  onUpdate(entity: Entity, deltaTime: number): void;
  onCollision(entity: Entity, other: Entity): void;
  onDestroy(entity: Entity): void;

  // 依赖声明
  dependencies: string[];
}

// Adapter 注册示例
class AdapterRegistry {
  register(componentType: string, engine: string, adapter: RuntimeAdapter): void;
  resolve(componentType: string, engine: string): RuntimeAdapter;
}

// 具体 Adapter 实现示例
const JumpAdapter: RuntimeAdapter = {
  componentType: 'jump',
  engine: 'phaser',
  onCreate(entity, config) {
    // 具体 Phaser API 调用
  },
  onUpdate(entity, deltaTime) {
    // 跳跃逻辑
  }
};
```

---

## 📋 次要缺失（不阻塞 MVP）

### 7. 🔵 Frontend/Editor 规格
- Prompt 输入面板
- Scene 编辑器
- 参数编辑器
- 预览窗口

### 8. 🔵 Backend API 规格
- RESTful API 设计
- WebSocket 实时通信
- 认证授权

### 9. 🔵 Database Schema
- PostgreSQL 表结构
- 索引设计
- 查询优化

### 10. 🔵 测试策略
- 单元测试规范
- 集成测试策略
- E2E 测试场景

---

## 🔄 一致性问题

### 1. 术语不一致
- **PRD**: "Prompt Parser" vs **Spec**: "Intent Parser Agent"
- **PRD**: "Code生成模块" vs **Orchestrator**: "CodeGenerator"

**建议**：创建术语表，统一命名

### 2. 引用完整性
- Orchestrator 引用了 AssetResolver，但没有对应的独立规格
- PRD 提到 SpecValidatorAgent，但其他文档未提及

---

## 🎯 开发建议

### 方案 A：立即开始原型开发（推荐）

**适用场景**：快速验证架构可行性

**步骤**：
1. **Week 1-2**: 实现最小可运行原型
   - 硬编码 GameSpec（跳过 Intent Parser）
   - 简化 Planner（只处理单场景）
   - 手写 Adapter（只实现 jump, gravity）
   - 简单的 Code Generator（字符串模板）
   - 使用占位符 assets

2. **Week 3-4**: 补充关键规格
   - 根据原型经验编写 Code Generator Spec
   - 编写 Asset Resolution Spec
   - 定义 JSON Schema

3. **Week 5-8**: 完整实现

**优点**：
- 快速验证架构设计
- 发现规格中的实际问题
- 迭代改进规格

**风险**：
- 可能需要重构

---

### 方案 B：补全规格后开发

**适用场景**：团队规模较大，需要严格规范

**步骤**：
1. **Week 1**: 补充关键规格
   - Code Generator Agent Spec
   - Asset Resolution System Spec
   - JSON Schema 定义
   - Graph 数据结构定义
   - LLM Integration Guide

2. **Week 2**: 技术预研
   - Phaser.js 模板项目
   - LLM API 集成测试
   - Asset 管理方案

3. **Week 3-6**: MVP 开发

**优点**：
- 规格完整，减少后期返工
- 适合多人协作

**风险**：
- 延迟实际编码
- 规格可能与实现脱节

---

## 📝 必须补充的规格清单（优先级排序）

### P0 - 阻塞性（必须立即补充）
1. **Code Generator Agent Specification**
   - 输入/输出格式
   - 模板系统设计
   - Phaser 代码组织

2. **Asset Resolution System Specification**
   - 资源库设计
   - 解析策略
   - AI 生成集成

3. **GameSpec JSON Schema v1.0**
   - 正式 JSON Schema 文件
   - 验证规则

### P1 - 重要（MVP 前补充）
4. **Graph 数据结构定义**
   - SceneGraph Schema
   - EntityGraph Schema
   - ComponentGraph Schema
   - SystemGraph Schema

5. **LLM Integration Guide**
   - Prompt 模板
   - 模型配置
   - 错误处理

6. **Runtime Adapter 实现指南**
   - Adapter 接口定义
   - 注册机制
   - 示例实现

### P2 - 次要（后续补充）
7. Frontend/Editor Spec
8. Backend API Spec
9. Database Schema
10. Test Strategy

---

## 🚀 最终建议

### 当前状态评估：
- ✅ **架构设计**: 优秀（90%）
- ⚠️ **实现细节**: 不足（40%）
- ❌ **工程就绪**: 部分就绪（60%）

### 推荐路径：**方案 A（原型驱动）**

**理由**：
1. 核心架构设计已经足够清晰
2. 通过原型可以快速发现规格缺陷
3. 规格与实现相互迭代更高效
4. 降低过度设计风险

**行动计划**：
1. **立即开始**：实现端到端最小原型（硬编码 GameSpec → 简化 Planner → 基础 Code Generator → Phaser 运行）
2. **并行补充**：在原型开发中补充 Code Generator 和 Asset Resolution 规格
3. **迭代完善**：基于原型经验完善其他规格

### 开发就绪判断：
- ✅ 可以开始架构原型和 POC
- ⚠️ 生产级开发需要补充 P0 规格
- 📅 预计 2-4 周可达到完整开发就绪状态

---

## 📌 总结

Loom 的规格文档在**架构层面**表现出色，核心概念清晰，系统设计合理。但在**实现层面**存在明显缺口，特别是 Code Generator 和 Asset Resolution 两个关键模块缺少详细规格。

**建议采用原型驱动方式**：立即开始最小可运行原型的开发，在实现过程中补充和完善规格。这样既能快速验证架构设计，又能确保规格与实际实现一致。

团队现在具备了**开始原型开发**的所有必要信息，但要进行生产级开发还需要补充上述 P0 级别的规格文档。
