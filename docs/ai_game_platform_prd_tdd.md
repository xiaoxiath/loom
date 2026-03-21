# AI 小游戏生成平台需求文档 + 技术方案文档（PRD + TDD）

作者：系统设计草案
版本：v0.1
目标阶段：MVP → Alpha → Beta

---

# 一、项目目标

## 1.1 项目背景

构建一个支持“自然语言生成小游戏”的平台，使用户无需编程能力即可通过一句话创建可运行小游戏，并支持编辑、导出、分享。

目标定位：

AI Game Copilot Platform

核心能力：

自然语言 → 可运行小游戏

---

# 二、产品目标

## 2.1 用户目标

用户输入：

示例：

生成一个类似 Flappy Bird 的小游戏
玩家点击屏幕跳跃
碰到障碍物失败
有计分系统
背景是太空风格

系统输出：

可运行小游戏
源码
素材
编辑能力
分享能力

---

# 三、用户角色定义

## 3.1 普通用户

目标：

快速生成小游戏
轻量修改游戏
分享给朋友

能力：

自然语言描述
调整参数
替换素材
发布链接

---

## 3.2 创作者用户

目标：

生成基础游戏框架
继续深度编辑
导出源码

能力：

编辑 GameSpec
编辑行为逻辑
替换组件
导出工程

---

# 四、核心功能模块

系统拆解为六大模块：

1 Prompt解析模块
2 GameSpec生成模块
3 Planner模块
4 Code生成模块
5 Asset模块
6 Runtime模块

---

# 五、系统整体架构

架构流程：

自然语言输入
↓
Prompt Parser
↓
GameSpec DSL
↓
Planner Agent
↓
Scene Graph
↓
Behavior Graph
↓
Code Generator
↓
Playable Game

---

# 六、核心系统设计

# 6.1 Prompt解析模块

目标：

将自然语言转换为结构化GameSpec

输入：

自然语言描述

输出：

结构化JSON

示例：

{
  "genre": "platformer",
  "camera": "side",
  "player": {
    "ability": ["jump"]
  },
  "mechanics": [
    "gravity",
    "collision",
    "score"
  ]
}

实现方案：

LLM Structured Output
JSON Schema约束生成

推荐模型接口：

OpenAI JSON Schema mode
Claude JSON mode

---

# 6.2 GameSpec DSL设计

GameSpec是平台核心协议

示例结构：

GameSpec

{
  meta
  scene
  player
  enemies
  mechanics
  scoring
  assets
}

示例：

{
  "meta": {
    "genre": "runner"
  },
  "player": {
    "movement": "jump"
  },
  "mechanics": [
    "gravity",
    "collision"
  ]
}

设计目标：

可扩展
可验证
可生成
可编辑

---

# 6.3 Planner Agent

目标：

将GameSpec转换为游戏结构图

输出结构：

SceneGraph
EntityGraph
BehaviorGraph

示例：

Game
 ├ Scene
 │  ├ Player
 │  ├ EnemySpawner
 │  └ Background
 └ Systems
    ├ Physics
    ├ Collision
    └ Score

Planner职责：

生成Scene
生成Entity
生成System

---

# 6.4 Code生成模块

目标：

生成可运行游戏代码

推荐策略：

模板 + Patch生成

基础模板：

Phaser模板项目

Agent输出：

新增文件
修改Scene文件
注册组件

示例：

add player.ts
add enemy.ts
modify mainScene.ts

优势：

稳定
可控
可调试

---

# 6.5 Asset生成模块

素材来源策略：

优先使用素材库
必要时AI生成

推荐素材库：

Kenney资源库
itch.io资源库

AI生成方案：

Stable Diffusion
DALL·E

素材类型：

角色
背景
UI
特效

---

# 6.6 Runtime运行模块

推荐运行引擎：

Phaser.js

优势：

浏览器运行
无需安装
适合AI生成代码

运行流程：

GameSpec
↓
SceneBuilder
↓
Phaser Scene
↓
HTML Game

---

# 七、系统Agent架构

GameBuilderAgent

结构如下：

GameBuilderAgent
 ├ IntentParserAgent
 ├ SpecValidatorAgent
 ├ PlannerAgent
 ├ CodeAgent
 ├ AssetAgent
 └ RuntimeAgent

执行流程：

Prompt
↓
IntentParser
↓
GameSpec
↓
Planner
↓
Graph
↓
CodeAgent
↓
Playable Game

---

# 八、前端系统设计

前端模块包括：

Prompt输入面板
Scene编辑器
参数编辑器
预览窗口
分享面板

推荐技术栈：

React
Tailwind
Zustand

Scene编辑推荐：

React Flow

---

# 九、后端系统设计

推荐技术栈：

Node.js
Bun
Fastify

模块结构：

API Gateway
Agent Service
Game Builder Service
Asset Service
Storage Service

---

# 十、数据结构设计

核心对象：

GameProject
GameSpec
SceneGraph
EntityGraph
BehaviorGraph

示例：

GameProject

{
  id
  owner
  spec
  graph
  assets
  runtime
}

---

# 十一、数据库设计

推荐数据库：

PostgreSQL

表结构：

users
projects
gamespecs
assets
versions

---

# 十二、版本管理系统

支持能力：

版本回滚
历史记录
diff查看

实现方案：

JSON diff storage
snapshot机制

---

# 十三、编辑器设计

编辑能力包括：

属性编辑
行为编辑
Scene编辑
资源替换

编辑器目标：

低代码
可视化
实时预览

---

# 十四、运行流程设计

完整执行流程：

用户输入Prompt
↓
解析Intent
↓
生成GameSpec
↓
验证Spec
↓
生成SceneGraph
↓
生成BehaviorGraph
↓
生成代码Patch
↓
加载Runtime
↓
输出小游戏

---

# 十五、MVP范围定义

第一阶段支持：

单场景
单角色
基础敌人
基础碰撞
基础计分

支持游戏类型：

跳跃类
躲避类
射击类
跑酷类

---

# 十六、系统难点分析

核心挑战包括：

GameSpec设计
SceneGraph生成
BehaviorGraph生成
代码稳定生成
素材质量控制

---

# 十七、安全设计

需要考虑：

代码沙箱执行
资源访问隔离
Prompt注入防护

实现方案：

iframe sandbox
runtime隔离
权限控制系统

---

# 十八、部署架构设计

推荐部署架构：

Frontend
Vercel

Backend
Fly.io
Railway

Asset Storage
S3

Database
Supabase

---

# 十九、性能设计

优化方向：

缓存GameSpec
缓存SceneGraph
缓存Asset

推荐方案：

Redis缓存层

---

# 二十、未来扩展方向

后续扩展能力包括：

多人游戏支持
3D游戏支持
Unity导出支持
Mod插件系统
社区模板市场
AI自动生成关卡系统

---

# 二十一、路线图规划

阶段1

Prompt生成小游戏
可运行
可分享

阶段2

可视化编辑器上线
支持素材替换

阶段3

多人协作编辑
模板市场

阶段4

3D游戏生成支持
Unity导出支持

---

# 二十二、技术风险评估

主要风险包括：

LLM生成不稳定
行为系统复杂度增长
素材一致性问题
SceneGraph复杂度提升

解决策略：

DSL约束
模板驱动生成
Graph中间层设计

---

# 二十三、成功指标定义

核心指标包括：

生成成功率
平均生成时间
用户编辑次数
分享次数
复用模板比例

---

# 二十四、总结

该平台核心架构为：

自然语言
↓
GameSpec DSL
↓
SceneGraph
↓
BehaviorGraph
↓
Patch Generator
↓
Phaser Runtime
↓
Playable Game

属于典型AI Agent驱动型生成平台架构。

