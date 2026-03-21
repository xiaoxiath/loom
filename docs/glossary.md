# Loom 术语表 (Glossary)

本文档定义 Loom 平台中使用的统一术语和命名规范。

---

## 核心概念

### Agent（代理）
系统中负责特定任务的 AI 驱动模块。

**统一命名**：
- ✅ **Intent Parser Agent** - 自然语言解析代理
- ❌ ~~Prompt Parser~~ (已废弃)

**所有 Agent 列表**：
1. Intent Parser Agent
2. Planner Agent
3. Code Generator Agent
4. Asset Resolver（非 Agent，工具模块）

---

### GameSpec DSL（游戏规格领域特定语言）
平台核心协议，描述游戏结构的中性格式。

**关键术语**：
- **GameSpec** - 完整的游戏规格对象
- **Entity** - 游戏实体（player, enemy, obstacle 等）
- **Component** - 可复用的行为组件
- **System** - 游戏系统（physics, collision 等）
- **Mechanic** - 游戏机制（jump, shoot 等）

---

### Graph（图）
Planner Agent 生成的执行图结构。

**四种 Graph**：
1. **SceneGraph** - 场景层级图
2. **EntityGraph** - 实体关系图
3. **ComponentGraph** - 组件绑定图
4. **SystemGraph** - 系统依赖图

---

### Runtime（运行时）
游戏实际运行的阶段。

**相关术语**：
- **Runtime Adapter** - 组件到引擎 API 的映射层
- **Runtime Bundle** - 生成的可运行游戏包
- **Preview Runtime** - 预览运行时

---

## 模块命名

### 包命名规范

所有包使用 `@loom/` 前缀：

```
@loom/core              # 核心类型
@loom/intent-parser     # Intent Parser Agent
@loom/planner           # Planner Agent
@loom/code-generator    # Code Generator Agent
@loom/runtime-adapter   # Runtime Adapter Layer
@loom/asset-resolver    # Asset Resolution System
@loom/orchestrator      # Runtime Orchestrator
@loom/schemas           # JSON Schemas
```

### 类命名规范

- **Agent**: `{Name}Agent` (e.g., `IntentParserAgent`)
- **System**: `{Name}System` (e.g., `PhysicsSystem`)
- **Component**: `{Name}Component` (e.g., `JumpComponent`)
- **Adapter**: `{Name}Adapter` (e.g., `JumpAdapter`)
- **Graph**: `{Name}Graph` (e.g., `SceneGraph`)

---

## 数据结构

### GameSpec 结构

```
GameSpec
├ meta              # 游戏元信息
├ settings          # 运行时设置
├ scene             # 场景配置
├ entities          # 实体列表
├ systems           # 系统列表
├ mechanics         # 机制列表
├ scoring           # 计分配置
├ ui                # UI 配置
├ assets            # 资源引用
└ extensions        # 扩展字段
```

### Entity 结构

```
Entity
├ id                # 唯一标识
├ type              # 类型 (player, enemy, etc.)
├ sprite            # 精灵资源 ID
├ position          # 位置坐标
├ physics           # 物理配置
└ components        # 组件列表
```

### Component 结构

```
Component
├ type              # 组件类型
├ enabled           # 是否启用
├ config            # 配置参数
├ events            # 事件绑定
└ dependencies      # 依赖组件
```

---

## 流程术语

### Pipeline（流水线）
数据处理的线性流程。

**主要 Pipelines**:
1. **Intent Parser Pipeline** - NL → GameSpec
2. **Planner Pipeline** - GameSpec → Graphs
3. **Code Generator Pipeline** - Graphs → Code
4. **Asset Resolution Pipeline** - References → Files

### Orchestrator（编排器）
协调多个 Agent 和 Pipeline 的调度系统。

**状态**:
- `INIT` - 初始化
- `PARSING` - 解析中
- `PLANNING` - 规划中
- `GENERATING` - 生成中
- `READY` - 就绪
- `FAILED` - 失败

---

## 游戏类型

### Genre（类型）

```
runner       # 跑酷类
platformer   # 平台跳跃类
shooter      # 射击类
puzzle       # 益智类
rpg          # 角色扮演类
strategy     # 策略类
sports       # 体育类
racing       # 竞速类
arcade       # 街机类
```

### Camera（摄像机）

```
side          # 横版
topdown       # 俯视
isometric     # 等距视角
first-person  # 第一人称
third-person  # 第三人称
```

---

## 技术栈

### 前端
- **Next.js** - React 框架
- **React** - UI 库
- **Tailwind** - CSS 框架
- **Zustand** - 状态管理
- **React Flow** - 可视化编辑
- **Monaco Editor** - 代码编辑

### 后端
- **Fastify** - Node.js 框架
- **Prisma** - ORM
- **PostgreSQL** - 数据库
- **Redis** - 缓存

### 游戏引擎
- **Phaser 3** - 2D 游戏引擎

### AI/LLM
- **OpenAI** - GPT-4, DALL·E
- **Anthropic** - Claude 3.5
- **Stable Diffusion** - 图片生成

### 基础设施
- **Vercel** - 前端托管
- **Fly.io** - 后端托管
- **Supabase** - BaaS（数据库、认证、存储）

---

## 组件类型

### Movement（移动）

```
jump         # 跳跃
run          # 跑动
fly          # 飞行
dash         # 冲刺
follow       # 跟随
patrol       # 巡逻
```

### Physics（物理）

```
gravity      # 重力
collision    # 碰撞
bounce       # 弹跳
friction     # 摩擦
```

### Combat（战斗）

```
shoot        # 射击
melee        # 近战
```

### Input（输入）

```
keyboardInput    # 键盘输入
mouseInput       # 鼠标输入
touchInput       # 触摸输入
```

### Lifecycle（生命周期）

```
health               # 生命值
destroyOnCollision   # 碰撞销毁
timeToLive           # 存活时间
respawn              # 重生
```

### AI

```
patrol           # 巡逻
followTarget     # 跟随目标
attackNearest    # 攻击最近
wander           # 漫游
```

---

## 资源类型

```
sprite        # 精灵图片
background    # 背景图
music         # 背景音乐
sound         # 音效
ui            # UI 元素
particle      # 粒子效果
font          # 字体
```

---

## 常用缩写

| 缩写 | 全称 | 说明 |
|------|------|------|
| DSL | Domain Specific Language | 领域特定语言 |
| NL | Natural Language | 自然语言 |
| LLM | Large Language Model | 大语言模型 |
| MVP | Minimum Viable Product | 最小可行产品 |
| API | Application Programming Interface | 应用程序接口 |
| UI | User Interface | 用户界面 |
| HUD | Heads-Up Display | 平视显示器 |
| JSON | JavaScript Object Notation | JavaScript 对象表示法 |
| ORM | Object-Relational Mapping | 对象关系映射 |
| CDN | Content Delivery Network | 内容分发网络 |
| TTL | Time To Live | 存活时间 |
| PRD | Product Requirements Document | 产品需求文档 |
| TDD | Technical Design Document | 技术设计文档 |

---

## 命名约定

### 文件命名
- **规范**: `kebab-case`
- **示例**: `intent-parser.ts`, `game-spec.ts`

### 类命名
- **规范**: `PascalCase`
- **示例**: `IntentParserAgent`, `GameSpec`

### 变量命名
- **规范**: `camelCase`
- **示例**: `gameSpec`, `entityGraph`

### 常量命名
- **规范**: `UPPER_SNAKE_CASE`
- **示例**: `MAX_ENTITIES`, `DEFAULT_GRAVITY`

### 接口命名
- **规范**: `PascalCase` + 描述性后缀
- **示例**: `GameSpec`, `EntityConfig`, `AdapterRegistry`

---

## 统一动词

### 生成相关

- **Parse** - 解析（NL → GameSpec）
- **Plan** - 规划（GameSpec → Graphs）
- **Generate** - 生成（Graphs → Code）
- **Resolve** - 解析（References → Assets）
- **Compile** - 编译（Source → Bundle）

### 运行相关

- **Build** - 构建
- **Run** - 运行
- **Preview** - 预览
- **Deploy** - 部署

### 操作相关

- **Create** - 创建
- **Update** - 更新
- **Delete** - 删除
- **Validate** - 验证
- **Optimize** - 优化

---

## 版本命名

### 语义化版本

```
MAJOR.MINOR.PATCH

示例: 1.0.0, 1.1.0, 1.1.1
```

- **MAJOR** - 破坏性变更
- **MINOR** - 新功能，向后兼容
- **PATCH** - Bug 修复

### 规格版本

```
v1.0, v1.1, v2.0

示例: GameSpec DSL v1.0
```

---

## 错误类型

### 错误级别

```
ERROR     # 错误，必须处理
WARNING   # 警告，可选处理
INFO      # 信息，记录日志
DEBUG     # 调试，开发环境
```

### 错误来源

```
PARSING_ERROR        # Intent Parser 错误
VALIDATION_ERROR     # Schema 验证错误
GENERATION_ERROR     # Code Generator 错误
RUNTIME_ERROR        # 运行时错误
ASSET_ERROR          # Asset Resolution 错误
```

---

## 最后更新

- **日期**: 2026-03-21
- **版本**: v1.0
- **维护者**: Loom Team

**保持术语一致性，是项目可维护性的基础。**
