# GameSpec Component Spec v1.0（行为组件协议层规范）

版本：v1.0
定位：GameSpec DSL 的执行行为层协议
作用：描述实体行为、能力、交互规则、参数化逻辑

Component Spec 是小游戏生成平台最核心的运行时抽象层之一。

---

# 一、设计目标

Component Spec 负责解决以下问题：

实体如何移动
实体如何攻击
实体如何交互
实体如何受伤
实体如何响应输入
实体如何产生事件

设计原则：

参数化
可组合
可验证
可序列化
可扩展
可插件化
可热更新

---

# 二、组件系统总体结构

组件结构统一为：

```
Component
{
  type
  enabled
  config
  events
  dependencies
}
```

示例：

```
{
  "type": "jump",
  "enabled": true,
  "config": {
    "force": 320,
    "cooldown": 200
  }
}
```

字段说明：

字段 | 类型 | 说明
---|---|---
type | string | 组件类型
enabled | boolean | 是否启用
config | object | 参数配置
events | object | 组件事件绑定
dependencies | array | 依赖组件

---

# 三、组件分类体系

组件分为六大类：

movement
combat
interaction
physics
input
lifecycle

完整分类结构：

```
Component
 ├ movement
 ├ combat
 ├ physics
 ├ input
 ├ ui
 ├ lifecycle
 └ ai
```

---

# 四、Movement 组件

控制实体移动行为

支持组件：

jump
run
fly
dash
follow
patrol

示例：jump

```
{
  "type": "jump",
  "config": {
    "force": 320,
    "maxCount": 2,
    "cooldown": 200
  }
}
```

字段说明：

字段 | 类型 | 说明
---|---|---
force | number | 跳跃力度
maxCount | number | 最大跳跃次数
cooldown | number | 冷却时间(ms)

---

# 五、Physics 组件

控制物理行为

支持组件：

gravity
collision
bounce
friction

示例：gravity

```
{
  "type": "gravity",
  "config": {
    "value": 980
  }
}
```

---

# 六、Combat 组件

控制攻击行为

支持组件：

shoot
melee
projectileSpawner
explosion

示例：shoot

```
{
  "type": "shoot",
  "config": {
    "rate": 300,
    "projectile": "bullet_basic"
  }
}
```

字段说明：

字段 | 类型 | 说明
---|---|---
rate | number | 射击间隔(ms)
projectile | string | 子弹实体ID

---

# 七、Input 组件

控制输入绑定行为

支持输入类型：

keyboard
mouse
touch
gamepad

示例：keyboard

```
{
  "type": "keyboardInput",
  "config": {
    "left": "A",
    "right": "D",
    "jump": "SPACE"
  }
}
```

---

# 八、Interaction 组件

实体之间交互逻辑

支持组件：

collect
trigger
portal
pickup

示例：collect

```
{
  "type": "collect",
  "config": {
    "target": "coin",
    "score": 10
  }
}
```

---

# 九、Lifecycle 组件

生命周期控制组件

支持组件：

health
respawn
destroyOnCollision
timeToLive

示例：health

```
{
  "type": "health",
  "config": {
    "max": 100,
    "regen": 1
  }
}
```

---

# 十、AI 组件

控制敌人智能行为

支持组件：

patrol
followTarget
attackNearest
wander

示例：patrol

```
{
  "type": "patrol",
  "config": {
    "points": [
      [100,200],
      [300,200]
    ]
  }
}
```

---

# 十一、组件依赖系统

组件之间允许声明依赖关系

示例：

```
{
  "type": "jump",
  "dependencies": ["gravity"]
}
```

运行时自动校验：

缺失依赖
自动补齐
或提示错误

---

# 十二、组件事件系统

组件支持事件绑定

统一结构：

```
"events": {
  "onStart": [],
  "onUpdate": [],
  "onCollision": [],
  "onDestroy": []
}
```

示例：

```
{
  "type": "destroyOnCollision",
  "events": {
    "onCollision": ["self.destroy"]
  }
}
```

---

# 十三、组件组合策略

组件支持组合行为

示例：玩家组件

```
[
  jump
  gravity
  keyboardInput
  collision
  health
]
```

组合形成完整行为树

---

# 十四、组件校验规则

运行前必须校验：

组件类型存在
参数合法
依赖满足
事件合法
引用实体存在

推荐实现方式：

JSON Schema
Runtime Validator

---

# 十五、组件注册机制

平台允许动态注册组件

结构如下：

```
ComponentRegistry
{
  type
  schema
  runtimeAdapter
}
```

作用：

支持插件组件
支持社区组件
支持模板组件

---

# 十六、组件Runtime映射机制

组件不会直接生成代码

而是映射到：

Runtime Adapter

结构如下：

```
Component
↓
Adapter
↓
Phaser Behavior
```

示例：

jump
↓
Phaser velocityY

---

# 十七、组件版本控制

组件支持版本升级

结构如下：

```
{
  "type": "jump",
  "version": "1.0"
}
```

升级策略：

兼容旧版本
自动迁移参数
schema转换

---

# 十八、组件示例完整结构

```
{
  "type": "jump",
  "enabled": true,
  "config": {
    "force": 320,
    "cooldown": 200
  },
  "dependencies": ["gravity"],
  "events": {
    "onStart": [],
    "onCollision": []
  }
}
```

---

# 十九、设计总结

Component Spec v1.0 提供：

行为描述能力
参数化控制能力
组件组合能力
事件驱动能力
插件扩展能力
Runtime映射能力

是 GameSpec DSL 的执行行为核心层。

