# 🚀 Loom 项目运行指南

完整的安装、构建和使用指南。

## 📋 环境要求

- **Node.js**: >= 18.0.0
- **pnpm**: >= 8.0.0
- **操作系统**: macOS, Linux, Windows

## 🔧 安装步骤

### 1. 克隆项目

```bash
git clone https://github.com/xiaoxiath/loom.git
cd loom
```

### 2. 安装依赖

```bash
# 安装 pnpm（如果未安装）
npm install -g pnpm@8.12.0

# 安装项目依赖
pnpm install
```

### 3. 构建项目

```bash
# 构建所有包
pnpm build

# 或者使用 turbo（更快）
turbo run build
```

## 🎮 快速开始

### 方式 1: Web 应用（推荐）

最直观的可视化界面：

```bash
# 进入 webapp 目录
cd apps/web

# 启动开发服务器
pnpm dev

# 访问 http://localhost:3000
```

**功能**：
- 🎨 可视化编辑 GameSpec（Monaco 编辑器）
- ⚡ 一键生成游戏代码
- 🎮 实时预览游戏
- 📁 查看生成文件

详细说明请查看 [apps/web/README.md](apps/web/README.md)

### 方式 2: 使用示例脚本

项目提供了便捷的生成脚本：


```bash
# 生成 Flappy Bird 示例
npx tsx examples/generate-game.ts

# 生成所有示例游戏
npx tsx examples/generate-game.ts all
```

生成的代码将保存在 `output/` 目录中。

### 方式 2: 编程方式生成游戏

 生成你的第一个游戏

创建一个简单的游戏规范文件 `my-game.json`:

```json
{
  "meta": {
    "title": "My First Game",
    "genre": "platformer",
    "camera": "side-scroll",
    "dimension": "2d"
  },
  "settings": {
    "width": 800,
    "height": 600,
    "backgroundColor": "#87CEEB",
    "gravity": { "x": 0, "y": 800 }
  },
  "entities": [
    {
      "id": "player",
      "type": "player",
      "sprite": "player",
      "position": { "x": 100, "y": 300 },
      "physics": { "collidable": true },
      "components": ["jump", "keyboardInput"]
    },
    {
      "id": "platform",
      "type": "obstacle",
      "sprite": "platform",
      "position": { "x": 400, "y": 500 },
      "physics": { "collidable": true, "static": true },
      "components": []
    }
  ],
  "systems": ["physics", "input"],
  "mechanics": ["jump"]
}
```

### 使用 Orchestrator 生成游戏

```typescript
import { Orchestrator } from '@loom/orchestrator';
import * as fs from 'fs';

async function generateGame() {
  const orchestrator = new Orchestrator({
    enableAssetResolution: false, // 使用占位符资源
    enableLLMCodeGen: false,       // 使用模板生成（不需要 LLM）
    enableCodeReview: false        // 跳过代码审查
  });

  const gameSpec = JSON.parse(fs.readFileSync('my-game.json', 'utf-8'));

  const result = await orchestrator.generate({ gameSpec });

  // 保存生成的文件
  for (const file of result.codeOutput.files) {
    fs.writeFileSync(`output/${file.path}`, file.content);
    console.log(`✅ Generated: ${file.path}`);
  }
}

generateGame();
```

## 📚 项目结构

```
loom/
├── packages/
│   ├── core/              # 核心类型定义
│   ├── planner/           # GameSpec → Graphs 转换
│   ├── code-generator/    # Graphs → Phaser 代码
│   ├── orchestrator/      # 完整生成管线
│   ├── llm-client/        # LLM API 客户端
│   ├── intent-parser/     # 自然语言 → GameSpec
│   ├── code-review/       # 代码审查 Agent
│   ├── asset-resolver/    # 资源解析
│   ├── runtime-adapter/   # 运行时适配器
│   └── harness/           # 评估框架
├── docs/                  # 设计文档
├── PhaseA.md             # Phase A 实施计划
└── README.md             # 项目说明
```

## 🧪 运行测试

### 运行所有测试

```bash
pnpm test
```

### 运行特定包的测试

```bash
# 测试 Planner
pnpm --filter @loom/planner test

# 测试 Code Generator
pnpm --filter @loom/code-generator test

# 运行 E2E 黄金测试
pnpm --filter @loom/harness eval
```

### 运行 E2E 评估

```bash
# 运行黄金测试套件
pnpm --filter @loom/harness eval

# 输出示例：
# 🧪 Running E2E Golden Tests...
#
# ✅ Flappy Bird
#    Score: 85.5%
#    Structure: 100% | Spec: 80% | Safety: 90% | Quality: 70%
```

## 🛠️ 开发命令

### 构建

```bash
# 构建所有包
pnpm build

# 构建特定包
pnpm --filter @loom/code-generator build

# 监听模式（开发）
pnpm dev
```

### 类型检查

```bash
# 检查所有包
pnpm typecheck

# 检查特定包
pnpm --filter @loom/planner typecheck
```

### 代码格式化

```bash
pnpm format
```

### 清理

```bash
# 清理所有构建产物
pnpm clean
```

## 🔑 配置 LLM（可选）

如果要使用 LLM 功能（代码生成、审查等），需要配置 API 密钥：

### OpenAI

```bash
export OPENAI_API_KEY="your-api-key"
```

### Claude

```bash
export ANTHROPIC_API_KEY="your-api-key"
```

### 使用示例

```typescript
import { Orchestrator } from '@loom/orchestrator';
import { createLLMClient } from '@loom/llm-client';

const llmClient = createLLMClient({
  provider: 'openai',
  model: 'gpt-4o',
  apiKey: process.env.OPENAI_API_KEY
});

const orchestrator = new Orchestrator({
  llmClient,
  enableLLMCodeGen: true,   // 启用 LLM 代码生成
  enableCodeReview: true     // 启用代码审查
});
```

## 📊 包功能说明

### @loom/core
核心类型定义，包括：
- `GameSpec`: 游戏规范 DSL
- `Entity`, `Component`, `System` 类型
- `SceneGraph`, `EntityGraph` 等图结构

### @loom/planner
将 GameSpec 转换为执行图：
- `PlannerAgent.plan()`: 主规划方法
- 支持规则引擎 + LLM 增强
- 生成 SceneGraph, EntityGraph, ComponentGraph, SystemGraph

### @loom/code-generator
生成 Phaser.js 代码：
- **模板模式**: 基于规则的字符串拼接（快速、稳定）
- **LLM 模式**: AI 生成高质量代码（智能、灵活）
- 支持碰撞回调、计分 UI、Enemy AI、Spawner

### @loom/orchestrator
完整的生成管线编排：
- Stage 1: Intent Parsing（可选）
- Stage 2: Planning
- Stage 3: Asset Resolution
- Stage 4: Adapter Binding
- Stage 5: Code Generation
- Stage 6: Code Review（可选）

### @loom/code-review
代码审查 Agent：
- 自动检测错误和警告
- 自动修复问题（最多 2 轮）
- 3 级严重性：error, warning, info

### @loom/harness
评估框架：
- 4 维度代码质量评估
- E2E 黄金测试
- 基线对比和回归检测

## 🎯 示例游戏

查看 `packages/harness/data/golden-specs/` 中的示例：

### 1. Flappy Bird
```bash
cat packages/harness/data/golden-specs/flappy-bird.json
```

### 2. Space Runner
```bash
cat packages/harness/data/golden-specs/space-runner.json
```

### 3. Galactic Shooter
```bash
cat packages/harness/data/golden-specs/galactic-shooter.json
```

## 🐛 故障排查

### 依赖安装失败

```bash
# 清理并重新安装
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### 构建失败

```bash
# 清理构建产物
pnpm clean

# 重新构建
pnpm build
```

### TypeScript 类型错误

```bash
# 检查类型
pnpm typecheck

# 重新构建特定包
pnpm --filter @loom/planner build
```

### 测试失败

```bash
# 查看详细错误
pnpm --filter @loom/harness eval

# 检查 baseline
cat packages/harness/data/baseline.json
```

## 📖 更多资源

- **设计文档**: `docs/` 目录
- **实施计划**: `PhaseA.md`
- **项目状态**: `PROJECT_STATUS.md`
- **开发路线图**: `DEVELOPMENT_ROADMAP.md`

## 🤝 获取帮助

- **GitHub Issues**: https://github.com/xiaoxiath/loom/issues
- **文档**: 查看 `docs/` 目录中的详细设计文档

## 📝 常用命令速查

```bash
# 安装
pnpm install

# 构建
pnpm build

# 测试
pnpm test

# E2E 评估
pnpm --filter @loom/harness eval

# 类型检查
pnpm typecheck

# 格式化
pnpm format

# 清理
pnpm clean
```

---

Happy Coding! 🚀
