# Planner Agent v1.0 架构规范（GameSpec → Graph 编译层）

版本：v1.0
定位：GameSpec DSL → SceneGraph / EntityGraph / ComponentGraph 的自动编译层
作用：将声明式游戏描述转换为可执行运行结构

Planner Agent 是小游戏生成平台的“编译器核心”。

它类似：

TypeScript Compiler
React Reconciler
Unity Scene Builder

---

# 一、Planner Agent 设计目标

Planner Agent 负责完成以下任务：

解析 GameSpec
补全缺失结构
生成 SceneGraph
生成 EntityGraph
生成 ComponentGraph
生成 SystemBindings
校验结构合法性
输出 Runtime-ready Graph

设计原则：

声明式输入
结构化输出
可解释执行路径
支持增量更新
支持回滚
支持调试

---

# 二、Planner Agent 在系统中的位置

系统执行链如下：

Natural Language
↓
Intent Parser
↓
GameSpec DSL
↓
Planner Agent
↓
SceneGraph
↓
EntityGraph
↓
ComponentGraph
↓
Runtime Adapter
↓
Playable Game

Planner Agent 是核心编译节点。

---

# 三、Planner Agent 输入结构

输入对象：

GameSpec

示例：

{
  meta
  scene
  entities
  mechanics
  systems
  scoring
}

Planner Agent 会补全隐式结构，例如：

默认摄像机
默认输入组件
默认物理系统
默认碰撞规则

---

# 四、Planner Agent 输出结构

Planner 输出四类核心结构：

SceneGraph
EntityGraph
ComponentGraph
SystemGraph

统一输出结构：

PlanResult
{
  sceneGraph
  entityGraph
  componentGraph
  systemGraph
  diagnostics
}

---

# 五、SceneGraph 构建规则

SceneGraph 描述游戏场景层级关系

结构如下：

SceneGraph
{
  scenes: []
  camera
  worldBounds
}

示例：

{
  scenes: ["mainScene"],
  camera: {
    follow: "player"
  }
}

自动补全规则：

如果未声明 scene
自动生成 mainScene

如果未声明 camera
自动绑定 player

---

# 六、EntityGraph 构建规则

EntityGraph 描述实体结构关系

结构如下：

EntityGraph
{
  nodes
  edges
}

示例：

nodes:

player
enemySpawner
background

edges:

spawner → enemy
camera → player

自动推导规则：

enemySpawner 存在
自动创建 enemy blueprint

player 存在
自动绑定 cameraFollow

---

# 七、ComponentGraph 构建规则

ComponentGraph 描述组件绑定关系

结构如下：

ComponentGraph
{
  entityComponents
}

示例：

player
├ jump
├ gravity
├ keyboardInput
└ collision

自动补全规则：

jump 存在
自动补 gravity

movement 存在
自动补 input

collision 存在
自动补 physics

---

# 八、SystemGraph 构建规则

SystemGraph 描述运行时系统依赖关系

结构如下：

SystemGraph
{
  physics
  collision
  input
  animation
}

自动补全策略：

存在 gravity
启用 physics

存在 jump
启用 input

存在 enemy
启用 collision

---

# 九、Planner 推理规则引擎

Planner 使用规则推理机制完成结构补全

规则类型：

presence rules
inference rules
dependency rules
default rules

示例：

规则1

if entity.type == player
→ attach cameraFollow

规则2

if component == jump
→ require gravity

规则3

if scoring.type == distance
→ enable updateLoopTimer

---

# 十、Planner Pipeline 设计

Planner 分为五个阶段：

Stage 1
Spec Validation

Stage 2
Structure Completion

Stage 3
Graph Construction

Stage 4
Dependency Resolution

Stage 5
Optimization

执行流程：

GameSpec
↓
validate()
↓
complete()
↓
buildGraphs()
↓
resolveDependencies()
↓
optimize()
↓
PlanResult

---

# 十一、增量规划机制（Incremental Planning）

支持局部更新

示例：

用户修改：

jump.force

Planner 仅更新：

ComponentGraph.player.jump

无需重建 SceneGraph

实现机制：

Graph diff
Node-level recompute
Dependency propagation

---

# 十二、Planner 调试能力

Planner 输出 diagnostics 信息

结构如下：

Diagnostics
{
  warnings
  autoFixes
  inferredNodes
}

示例：

warnings:

missing gravity

autoFixes:

gravity inserted

inferredNodes:

cameraFollow(player)

---

# 十三、Planner 插件扩展机制

Planner 支持规则插件扩展

结构如下：

PlannerRule
{
  match
  transform
  priority
}

示例：

{
  match: "entity.type == boss",
  transform: "attach healthBar",
  priority: 10
}

支持能力：

自定义实体行为
模板系统增强
社区规则共享

---

# 十四、Planner 优化策略

优化目标：

减少运行时组件数量
减少重复系统
减少冗余绑定

示例：

多个 collision
合并为 shared collisionSystem

多个 input
合并为 shared inputSystem

---

# 十五、Planner 输出示例

PlanResult

{
  sceneGraph
  entityGraph
  componentGraph
  systemGraph
  diagnostics
}

用于后续：

Runtime Adapter
Code Generator
Editor Renderer

---

# 十六、Planner 版本控制策略

Planner 支持规则版本管理

结构如下：

PlannerVersion
{
  rulesetVersion
  engineTarget
}

支持能力：

旧项目兼容
规则迁移
自动升级

---

# 十七、设计总结

Planner Agent v1.0 提供：

结构推理能力
自动补全能力
依赖解析能力
Graph 构建能力
增量更新能力
调试输出能力
插件规则扩展能力

是 GameSpec DSL 编译为 Runtime Graph 的核心执行编译层。

