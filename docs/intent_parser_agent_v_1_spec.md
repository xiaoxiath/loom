# Intent Parser Agent v1.0 规范（Natural Language → GameSpec 编译器）

版本：v1.0
定位：自然语言 → GameSpec DSL 的结构化编译层
作用：将用户自然语言描述稳定转换为可验证的 GameSpec（JSON Schema 约束）

Intent Parser Agent 是整个平台“生成稳定性”的第一道关卡。

---

# 一、设计目标

Intent Parser Agent 负责：

- 解析用户自然语言意图
- 生成结构化 GameSpec（JSON）
- 进行 Schema 约束生成（constrained decoding）
- 自动补全默认字段
- 执行语义修复（repair）
- 输出可进入 Planner 的 Spec

设计原则：

- 结构优先（Structure-first）
- 可验证（Schema-valid）
- 可解释（Explainable）
- 可修复（Repairable）
- 可迭代（Interactive refinement）

---

# 二、系统位置

系统执行链：

Natural Language
↓
Intent Parser Agent
↓
GameSpec DSL
↓
Planner Agent
↓
Runtime Graphs

Intent Parser 是 Spec Compiler。

---

# 三、输入输出定义

输入：

```
UserPrompt
{
  text
  locale?
  platform?
  difficulty?
  targetEngine?
}
```

输出：

```
IntentParseResult
{
  spec
  confidence
  assumptions
  missingSlots
  diagnostics
}
```

字段说明：

字段 | 类型 | 说明
---|---|---
spec | GameSpec | 输出结构
confidence | number | 解析置信度（0-1）
assumptions | array | 自动推断内容
missingSlots | array | 缺失信息槽位
diagnostics | object | 调试信息

---

# 四、解析流程总览（Pipeline）

Intent Parser Pipeline：

Stage 1
Prompt Normalization

Stage 2
Intent Extraction

Stage 3
Slot Filling

Stage 4
Schema Constrained Decoding

Stage 5
Semantic Repair

Stage 6
Default Injection

Stage 7
Validation

输出：

GameSpec

---

# 五、Prompt Normalization（输入标准化）

目标：

统一自然语言表达
消除歧义
补充上下文

处理内容：

- 多语言归一化（locale）
- 同义词归并（runner≈endless runner）
- 模板识别（类似 Flappy Bird）
- 风格识别（像素风 / 太空风）

示例：

输入：

```
做一个像 Flappy Bird 的小游戏
```

输出：

```
{
  genre: "endless_runner",
  mechanics: ["jump", "collision", "score_distance"]
}
```

---

# 六、Intent Extraction（意图抽取）

抽取核心字段：

```
Genre
Camera
Dimension
Mechanics
Entities
Scoring
UI
AssetsStyle
```

示例：

```
生成一个坦克大战小游戏
```

抽取：

```
Genre: shooter
Camera: topdown
Entities: tank, enemy
Mechanics: shoot
```

实现方式：

- LLM few-shot
- 分类器辅助
- 规则增强

---

# 七、Slot Filling（槽位填充）

Slot Schema：

```
RequiredSlots
{
  genre
  player
  scene
}
```

OptionalSlots

```
{
  scoring
  ui
  assets
}
```

示例：

输入：

```
做一个跳跃小游戏
```

系统补全：

```
player inserted
scene inserted
cameraFollow inserted
```

---

# 八、Schema Constrained Decoding

使用 JSON Schema 约束生成：

目标：

确保输出结构合法
避免 hallucination
提高稳定性

示例：

```
GameSpec.schema.json
```

支持：

- enum 限制
- required 字段
- 类型校验
- 嵌套结构校验

推荐实现：

- OpenAI Structured Output
- Claude JSON mode

---

# 九、Semantic Repair（语义修复层）

修复以下问题：

字段冲突
缺失依赖
非法组合
重复实体

示例：

```
jump without gravity
```

修复：

```
auto insert gravity
```

实现方式：

Repair Rules Engine

结构：

```
RepairRule
{
  match
  fix
}
```

示例：

```
match: component == jump
fix: add gravity
```

---

# 十、Default Injection（默认值注入）

默认策略示例：

```
no camera
→ follow player
```

```
no scoring
→ distance scoring
```

```
no assets
→ default asset pack
```

实现方式：

Default Strategy Table

---

# 十一、Validation（Spec 校验层）

校验类型：

Schema Validation
Dependency Validation
Semantic Validation
Reference Validation

输出：

```
ValidationResult
{
  valid
  warnings
  errors
}
```

---

# 十二、置信度系统（Confidence Scoring）

置信度计算来源：

Slot completeness
Schema validity
Repair count
Ambiguity level

示例：

```
confidence = 0.82
```

用于：

提示用户补充信息
触发交互澄清
触发 fallback parser

---

# 十三、交互式澄清机制（Interactive Clarification）

当 missingSlots 存在：

触发澄清问题

示例：

```
是否需要敌人？
是否需要计分系统？
```

策略：

progressive clarification

---

# 十四、Fallback Repair Pipeline

当结构生成失败：

进入 fallback pipeline

策略：

Template Retrieval
Few-shot Retry
Rule-based Patch
Partial Spec Output

---

# 十五、Intent Parser 插件机制

支持插件扩展：

```
IntentPlugin
{
  match
  transform
  priority
}
```

示例：

```
match: "像马里奥"
transform: platformer template
```

---

# 十六、Planner 接口输出格式

输出必须满足：

```
PlannerInput
{
  GameSpec
  assumptions
  diagnostics
}
```

---

# 十七、性能优化策略

优化方向：

缓存 Prompt → Spec
缓存模板匹配
缓存风格映射

推荐实现：

SpecCache
PromptEmbeddingIndex

---

# 十八、安全策略

防止：

Prompt Injection
非法代码生成
资源越权访问

实现方式：

Input Sanitization
Schema Guard
Policy Filter

---

# 十九、示例完整输出

```
{
  spec: GameSpec,
  confidence: 0.91,
  assumptions: ["cameraFollow(player)"],
  missingSlots: [],
  diagnostics: {}
}
```

---

# 二十、设计总结

Intent Parser Agent v1.0 提供：

稳定结构生成能力
Schema约束生成能力
语义修复能力
默认补全能力
置信度评估能力
交互澄清能力
Fallback恢复能力
插件扩展能力

是 Natural Language → GameSpec 的核心编译器层。

