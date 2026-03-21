# Runtime Adapter Layer v1.0 规范（游戏引擎行为映射协议）

版本：v1.0
定位：Component Spec → Runtime Engine（如 Phaser）之间的执行桥接层
作用：将平台无关的行为组件映射为具体游戏引擎运行逻辑

Runtime Adapter Layer 是小游戏生成平台实现“稳定自动生成”的关键执行层。

---

# 一、设计目标

Runtime Adapter Layer 负责解决：

组件如何映射到引擎行为
组件如何绑定生命周期
组件如何绑定事件系统
组件如何绑定输入系统
组件如何绑定物理系统
组件如何绑定渲染系统

设计原则：

引擎无关（Engine Agnostic）
组件驱动（Component Driven）
声明式映射（Declarative Mapping）
可扩展（Extensible）
可替换（Replaceable）
可调试（Inspectable）

---

# 二、整体架构设计

Runtime Adapter Layer 位于：

Natural Language
↓
GameSpec DSL
↓
Component Spec
↓
Runtime Adapter Layer
↓
Phaser Runtime
↓
Playable Game

核心职责：

解释组件
注册行为
绑定事件
连接引擎API

---

# 三、Runtime Adapter 基本结构

统一 Adapter 结构：

```
RuntimeAdapter
{
  componentType
  engine
  version
  lifecycle
  bindings
  dependencies
}
```

示例：

```
{
  "componentType": "jump",
  "engine": "phaser",
  "version": "1.0",
  "lifecycle": [
    "onCreate",
    "onUpdate"
  ]
}
```

字段说明：

字段 | 类型 | 说明
---|---|---
componentType | string | 对应组件类型
engine | string | 目标引擎
version | string | adapter版本
lifecycle | array | 生命周期绑定点
bindings | object | 引擎API映射
dependencies | array | 依赖组件

---

# 四、生命周期映射系统

统一生命周期阶段：

```
onInit
onCreate
onStart
onUpdate
onCollision
onDestroy
```

映射示例：

Component.jump
↓
Phaser.update

示例 Adapter：

```
{
  "componentType": "jump",
  "lifecycle": [
    "onUpdate"
  ]
}
```

---

# 五、行为绑定系统（Behavior Binding）

组件行为通过 bindings 字段映射到引擎行为

结构如下：

```
bindings
{
  input
  physics
  animation
  collision
}
```

示例：jump

```
{
  "bindings": {
    "physics": "setVelocityY"
  }
}
```

说明：

jump.force
↓
Phaser.physics.velocityY

---

# 六、输入系统映射

统一输入抽象：

```
InputLayer
{
  keyboard
  mouse
  touch
  gamepad
}
```

示例：

keyboardInput
↓
Phaser.input.keyboard

Adapter示例：

```
{
  "componentType": "keyboardInput",
  "bindings": {
    "input": "phaser.keyboard"
  }
}
```

---

# 七、物理系统映射

统一物理抽象层：

```
PhysicsLayer
{
  gravity
  velocity
  acceleration
  collision
}
```

示例：gravity

```
gravity.value
↓
phaser.physics.world.gravity
```

Adapter示例：

```
{
  "componentType": "gravity",
  "bindings": {
    "physics": "world.gravity.y"
  }
}
```

---

# 八、碰撞系统映射

统一碰撞抽象：

```
CollisionLayer
{
  overlap
  collide
  trigger
}
```

示例：

collision
↓
Phaser.physics.add.collider

Adapter示例：

```
{
  "componentType": "collision",
  "bindings": {
    "collision": "physics.add.collider"
  }
}
```

---

# 九、动画系统映射

统一动画抽象：

```
AnimationLayer
{
  play
  stop
  loop
}
```

示例：

animation.play
↓
Phaser.anims.play

Adapter示例：

```
{
  "componentType": "animation",
  "bindings": {
    "animation": "anims.play"
  }
}
```

---

# 十、事件系统映射

统一事件结构：

```
EventLayer
{
  onStart
  onUpdate
  onCollision
  onDestroy
}
```

示例：

onCollision
↓
phaser.physics.collider callback

Adapter示例：

```
{
  "componentType": "destroyOnCollision",
  "bindings": {
    "event": "collider.callback"
  }
}
```

---

# 十一、Adapter 注册机制

Adapter通过注册表统一管理

结构如下：

```
AdapterRegistry
{
  componentType
  engine
  adapter
}
```

示例：

```
registerAdapter(
  "jump",
  "phaser",
  jumpAdapter
)
```

作用：

支持多引擎
支持插件扩展
支持社区扩展

---

# 十二、多引擎支持设计

平台设计支持未来扩展：

Phaser
Godot Web
Unity WebGL
Three.js

结构如下：

```
jump
├ phaserAdapter
├ godotAdapter
└ unityAdapter
```

实现方式：

Engine Adapter Strategy Pattern

---

# 十三、Adapter 依赖系统

Adapter可以声明依赖组件

示例：

```
{
  "componentType": "jump",
  "dependencies": [
    "gravity",
    "keyboardInput"
  ]
}
```

作用：

自动补齐组件
自动校验依赖
自动生成行为链

---

# 十四、Adapter 调试机制

支持运行时调试能力

调试信息包括：

组件状态
事件触发记录
生命周期调用记录
输入响应记录

结构如下：

```
AdapterDebugInfo
{
  component
  lifecycle
  events
}
```

---

# 十五、Adapter 版本控制

支持版本升级机制

结构如下：

```
{
  componentType
  adapterVersion
  engineVersion
}
```

升级策略：

向后兼容
自动迁移
schema转换

---

# 十六、Adapter 示例完整结构

```
{
  "componentType": "jump",
  "engine": "phaser",
  "version": "1.0",
  "lifecycle": [
    "onUpdate"
  ],
  "bindings": {
    "physics": "setVelocityY",
    "input": "keyboard.space"
  },
  "dependencies": [
    "gravity",
    "keyboardInput"
  ]
}
```

---

# 十七、设计总结

Runtime Adapter Layer v1.0 提供：

组件行为映射能力
生命周期绑定能力
输入系统桥接能力
物理系统桥接能力
动画系统桥接能力
事件系统桥接能力
多引擎扩展能力
插件适配能力
调试能力

是实现 AI 自动生成小游戏“稳定运行能力”的核心执行桥接层。

