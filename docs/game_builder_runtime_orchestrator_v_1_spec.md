# Game Builder Runtime Orchestrator v1.0（系统调度核心规范）

版本：v1.0
定位：小游戏生成平台的核心执行调度层（Agent Runtime Kernel）
作用：协调 IntentParser → Planner → ComponentResolver → Adapter → Runtime → Preview 的完整执行流程

Runtime Orchestrator 是整个 AI 小游戏生成平台的“操作系统内核”。

---

# 一、设计目标

Runtime Orchestrator 负责：

调度生成流程
管理执行状态
管理依赖关系
处理失败恢复
管理缓存
支持增量更新
支持交互式编辑

设计原则：

可恢复（Recoverable）
可追踪（Traceable）
可扩展（Extensible）
可并行（Parallelizable）
可缓存（Cache-aware）
可中断（Interruptible）

---

# 二、系统位置

系统执行路径：

Natural Language
↓
Runtime Orchestrator
├ IntentParserAgent
├ PlannerAgent
├ ComponentResolver
├ AdapterRegistry
├ CodeGenerator
├ AssetResolver
└ PreviewRuntime
↓
Playable Game

Orchestrator 是调度中心。

---

# 三、核心职责拆解

Runtime Orchestrator 负责以下核心任务：

任务调度
状态管理
阶段执行
错误恢复
缓存命中判断
依赖解析
增量刷新

统一输出对象：

```
BuildSession
{
  sessionId
  state
  spec
  graphs
  assets
  runtime
  diagnostics
}
```

---

# 四、执行阶段模型（Execution Pipeline）

Orchestrator Pipeline：

Stage 1
Prompt Intake

Stage 2
Intent Parsing

Stage 3
Spec Validation

Stage 4
Planning

Stage 5
Component Resolution

Stage 6
Adapter Binding

Stage 7
Code Generation

Stage 8
Asset Resolution

Stage 9
Preview Runtime Boot

输出：

Playable Game

---

# 五、执行状态机设计（Build State Machine）

BuildSession 状态包括：

```
INIT
PARSING
PLANNING
RESOLVING
BINDING
GENERATING
ASSET_LOADING
PREVIEW_READY
FAILED
```

示例：

```
INIT → PARSING → PLANNING → PREVIEW_READY
```

---

# 六、任务调度系统（Task Scheduler）

统一任务结构：

```
BuildTask
{
  id
  stage
  input
  output
  dependencies
  retryPolicy
}
```

支持能力：

串行执行
并行执行
依赖触发执行
失败重试执行

---

# 七、依赖图调度模型（Dependency Graph Scheduling）

任务依赖结构：

```
IntentParser
↓
Planner
↓
ComponentResolver
↓
AdapterBinding
↓
CodeGenerator
```

AssetResolver 可并行执行：

```
Planner
↓
AssetResolver
```

优化目标：

减少等待时间
提升响应速度
支持局部刷新

---

# 八、缓存策略设计（Cache Strategy）

缓存层级包括：

PromptCache
SpecCache
GraphCache
AssetCache
RuntimeBundleCache

示例：

```
Prompt unchanged
→ reuse SpecCache
```

```
Spec unchanged
→ reuse GraphCache
```

---

# 九、增量更新机制（Incremental Rebuild）

支持以下场景：

用户修改参数
用户替换素材
用户新增实体
用户修改组件

更新策略：

```
Diff GameSpec
↓
Invalidate Graph Nodes
↓
Partial Rebuild
```

避免全量重新生成。

---

# 十、错误恢复机制（Recovery Strategy）

失败阶段可能包括：

Intent Parsing
Planning
Component Resolution
Adapter Binding
Runtime Boot

恢复策略：

Retry
Fallback Template
Partial Spec Output
User Clarification

示例：

```
Planner failed
→ fallback minimal sceneGraph
```

---

# 十一、诊断系统（Diagnostics Engine）

统一诊断结构：

```
Diagnostics
{
  stage
  warnings
  errors
  autoFixes
}
```

支持输出：

自动补全记录
依赖推理记录
默认策略记录
失败原因说明

---

# 十二、交互式执行模式（Interactive Mode）

支持实时编辑器更新：

```
User edits component
↓
Trigger partial rebuild
↓
Update PreviewRuntime
```

实现方式：

Node-level invalidation
Graph-level refresh
Runtime hot patch

---

# 十三、AssetResolver 调度机制

AssetResolver 输入：

```
AssetRequests
{
  sprite
  background
  sound
}
```

调度策略：

优先缓存
其次模板库
最后 AI 生成

输出：

ResolvedAssets

---

# 十四、CodeGenerator 调度机制

CodeGenerator 输入：

```
SceneGraph
ComponentGraph
AdapterBindings
```

输出：

```
RuntimeBundle
{
  sceneCode
  entityCode
  systemCode
}
```

生成策略：

Template Patch Generation

避免：

Full project regeneration

---

# 十五、PreviewRuntime 启动机制

PreviewRuntime 启动流程：

```
Load RuntimeBundle
↓
Inject Assets
↓
Initialize Scene
↓
Start Game Loop
```

输出：

Playable Preview

---

# 十六、插件扩展机制（Plugin System）

支持插件扩展：

```
OrchestratorPlugin
{
  stage
  hook
  priority
}
```

示例：

```
Hook into Planning stage
Inject template override
```

---

# 十七、并行执行优化（Parallel Execution Strategy）

可并行阶段：

IntentParser
AssetResolver
TemplateMatcher

优化效果：

减少首帧生成时间
提升用户体验

---

# 十八、Session 生命周期管理

Session 生命周期：

```
Create Session
↓
Attach Prompt
↓
Execute Pipeline
↓
Preview Ready
↓
Persist Snapshot
```

支持：

Undo
Redo
History Restore
Version Compare

---

# 十九、版本控制策略（Versioning Strategy）

支持版本对象：

```
SpecVersion
GraphVersion
RuntimeBundleVersion
```

支持能力：

版本回滚
差异比较
分支编辑
协作合并

---

# 二十、设计总结

Game Builder Runtime Orchestrator v1.0 提供：

统一执行调度能力
多阶段流水线管理能力
缓存优化能力
增量更新能力
错误恢复能力
实时编辑能力
插件扩展能力
并行执行能力

是 AI 小游戏生成平台的核心 Agent Runtime Kernel。

