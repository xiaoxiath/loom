# GameSpec DSL v1.0 规范（AI 小游戏生成平台核心协议）

版本：v1.0
用途：自然语言 → GameSpec → SceneGraph → BehaviorGraph → Runtime Code
定位：小游戏生成平台核心中间层协议

---

# 一、设计目标

GameSpec DSL 是平台的核心协议层，承担以下职责：

自然语言理解输出格式
游戏结构描述格式
编辑器操作数据结构
代码生成输入格式
版本管理对象格式

设计目标：

可扩展
可验证
可序列化
可编辑
可生成
可回滚

---

# 二、整体结构设计

GameSpec 顶层结构如下：

```
GameSpec
 ├ meta
 ├ settings
 ├ scene
 ├ entities
 ├ systems
 ├ mechanics
 ├ scoring
 ├ ui
 ├ assets
 └ extensions
```

完整示例：

```
{
  "meta": {},
  "settings": {},
  "scene": {},
  "entities": [],
  "systems": [],
  "mechanics": [],
  "scoring": {},
  "ui": {},
  "assets": [],
  "extensions": {}
}
```

---

# 三、meta 模块

描述游戏基础信息

```
meta
```

示例：

```
"meta": {
  "title": "Space Runner",
  "genre": "runner",
  "camera": "side",
  "dimension": "2D",
  "version": "1.0"
}
```

字段说明：

字段 | 类型 | 说明
---|---|---
title | string | 游戏名称
genre | enum | 游戏类型
camera | enum | 摄像机类型
dimension | enum | 2D / 3D
version | string | spec版本

---

# 四、settings 模块

描述运行时参数

```
settings
```

示例：

```
"settings": {
  "gravity": 980,
  "backgroundColor": "#000000",
  "worldWidth": 1920,
  "worldHeight": 1080
}
```

---

# 五、scene 模块

描述场景结构

```
scene
```

示例：

```
"scene": {
  "type": "single",
  "cameraFollow": "player",
  "spawn": {
    "x": 200,
    "y": 400
  }
}
```

字段说明：

字段 | 类型 | 说明
---|---|---
type | enum | single / multi
cameraFollow | string | 跟随对象
spawn | object | 出生点

---

# 六、entities 模块

描述游戏中的实体

```
entities
```

实体类型包括：

player
enemy
npc
obstacle
projectile
platform
pickup

示例：

```
"entities": [
  {
    "id": "player",
    "type": "player",
    "sprite": "player_ship",
    "position": {
      "x": 200,
      "y": 400
    },
    "physics": {
      "gravity": true,
      "collidable": true
    },
    "components": [
      "jump",
      "health"
    ]
  }
]
```

实体字段说明：

字段 | 类型 | 说明
---|---|---
id | string | 唯一ID
type | enum | 实体类型
sprite | string | 精灵资源引用
position | object | 坐标
physics | object | 物理属性
components | array | 行为组件

---

# 七、systems 模块

系统级逻辑模块

```
systems
```

示例：

```
"systems": [
  "physics",
  "collision",
  "spawn",
  "input",
  "camera"
]
```

系统列表：

physics
collision
input
spawn
camera
animation
sound

---

# 八、mechanics 模块

描述核心玩法机制

```
mechanics
```

示例：

```
"mechanics": [
  "jump",
  "shoot",
  "gravity",
  "collision"
]
```

常见mechanics类型：

jump
shoot
dash
collect
avoid
survive
follow
spawn

---

# 九、scoring 模块

计分系统

```
scoring
```

示例：

```
"scoring": {
  "type": "distance",
  "increment": 1
}
```

支持类型：

kill
collect
time
distance
combo

---

# 十、ui 模块

UI结构描述

```
ui
```

示例：

```
"ui": {
  "hud": [
    "score",
    "health"
  ],
  "startScreen": true,
  "gameOverScreen": true
}
```

---

# 十一、assets 模块

资源引用系统

```
assets
```

示例：

```
"assets": [
  {
    "id": "player_ship",
    "type": "sprite",
    "source": "kenney"
  }
]
```

支持类型：

sprite
background
music
sound
ui
particle

---

# 十二、extensions 模块

插件扩展系统

用于未来扩展能力

```
extensions
```

示例：

```
"extensions": {
  "multiplayer": false,
  "aiEnemy": true
}
```

设计目标：

避免破坏主结构
支持插件生态
支持版本演进

---

# 十三、组件系统设计

组件驱动行为系统

```
components
```

示例组件：

jump
shoot
health
movement
ai
patrol
follow

组件示例：

```
"components": [
  "jump",
  "health"
]
```

未来支持参数化组件：

```
{
  "type": "jump",
  "force": 300
}
```

---

# 十四、校验规则设计

GameSpec必须满足以下规则：

必须存在player实体
必须存在scene
必须存在meta
实体ID必须唯一
引用资源必须存在

推荐使用：

JSON Schema校验

---

# 十五、版本控制策略

支持Spec版本升级机制

```
meta.version
```

升级策略：

向后兼容
自动迁移
schema转换器

---

# 十六、示例完整GameSpec

```
{
  "meta": {
    "title": "Space Runner",
    "genre": "runner",
    "camera": "side",
    "dimension": "2D",
    "version": "1.0"
  },
  "settings": {
    "gravity": 980
  },
  "scene": {
    "type": "single",
    "cameraFollow": "player"
  },
  "entities": [
    {
      "id": "player",
      "type": "player",
      "sprite": "player_ship",
      "components": [
        "jump",
        "health"
      ]
    }
  ],
  "systems": [
    "physics",
    "collision",
    "input"
  ],
  "mechanics": [
    "jump",
    "collision"
  ],
  "scoring": {
    "type": "distance"
  },
  "ui": {
    "hud": [
      "score"
    ]
  },
  "assets": [
    {
      "id": "player_ship",
      "type": "sprite",
      "source": "kenney"
    }
  ],
  "extensions": {}
}
```

---

# 十七、设计总结

GameSpec DSL v1.0 作为平台核心协议层，承担以下角色：

自然语言理解输出格式
编辑器内部状态格式
Planner输入格式
Runtime生成输入格式
版本系统核心对象

属于平台最关键的系统抽象层。

