# Loom 项目运行指南

完整的安装、构建和使用指南。

## 环境要求

- **Node.js**: >= 18.0.0
- **pnpm**: >= 8.0.0
- **操作系统**: macOS, Linux, Windows

## 安装步骤

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
```

## 快速开始

### 方式 1: Web 应用

```bash
cd apps/web
pnpm dev
# 访问 http://localhost:3000
```

### 方式 2: 使用示例脚本

```bash
# 生成 Flappy Bird 示例
npx tsx examples/generate-game.ts

# 生成所有示例游戏
npx tsx examples/generate-game.ts all
```

生成的代码将保存在 `output/` 目录中。

### 方式 3: 编程方式生成游戏

创建一个游戏规范文件 `my-game.json`：

```json
{
  "meta": {
    "title": "My First Game",
    "genre": "runner",
    "camera": "side",
    "dimension": "2D",
    "version": "1.0"
  },
  "settings": {
    "worldWidth": 800,
    "worldHeight": 600,
    "backgroundColor": "#87CEEB",
    "gravity": 980
  },
  "scene": {
    "type": "single",
    "cameraFollow": "player",
    "spawn": { "x": 100, "y": 300 }
  },
  "entities": [
    {
      "id": "player",
      "type": "player",
      "sprite": "player",
      "position": { "x": 100, "y": 300 },
      "physics": { "collidable": true, "gravity": true },
      "components": ["jump", "gravity", "keyboardInput"]
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
  "systems": ["physics", "collision", "input"],
  "mechanics": ["jump", "avoid"],
  "scoring": {
    "type": "distance",
    "increment": 1
  },
  "ui": {
    "hud": ["score"],
    "startScreen": true,
    "gameOverScreen": true
  },
  "assets": [
    { "id": "player", "type": "sprite", "source": "kenney" },
    { "id": "platform", "type": "sprite", "source": "kenney" }
  ],
  "extensions": {}
}
```

然后使用 Orchestrator 生成游戏：

```typescript
import { Orchestrator } from '@loom/orchestrator';
import * as fs from 'fs';

async function generateGame() {
  const orchestrator = new Orchestrator({
    enableAssetResolution: false,
    enableLLMCodeGen: false,
    enableCodeReview: false,
  });

  const gameSpec = JSON.parse(fs.readFileSync('my-game.json', 'utf-8'));
  const result = await orchestrator.generate({ gameSpec });

  for (const file of result.codeOutput.files) {
    fs.writeFileSync(`output/${file.path}`, file.content);
    console.log(`Generated: ${file.path}`);
  }
}

generateGame();
```

## 项目结构

```
loom/
├── packages/
│   ├── core/              # 核心类型定义
│   ├── schemas/           # JSON Schema 定义和验证
│   ├── planner/           # GameSpec -> Graphs 转换
│   ├── runtime-adapter/   # 运行时适配器（Phaser.js）
│   ├── code-generator/    # Graphs -> Phaser 代码
│   ├── orchestrator/      # 完整生成管线编排
│   ├── llm-client/        # LLM API 客户端
│   ├── intent-parser/     # 自然语言 -> GameSpec
│   ├── code-review/       # 代码审查 Agent
│   ├── asset-resolver/    # 资源解析
│   └── harness/           # 评估框架
├── apps/
│   └── web/               # Next.js 前端
├── schemas/               # 共享 JSON Schema 文件
├── examples/              # 示例 GameSpec JSON 文件
├── docs/                  # 设计文档
└── README.md
```

## 运行测试

```bash
# 运行所有测试
pnpm test

# 运行特定包的测试
pnpm --filter @loom/planner test
pnpm --filter @loom/intent-parser test
pnpm --filter @loom/code-generator test

# 运行 E2E 黄金测试
pnpm --filter @loom/harness eval
```

## 开发命令

```bash
# 构建所有包
pnpm build

# 构建特定包
pnpm --filter @loom/code-generator build

# 类型检查
pnpm typecheck

# 代码格式化
pnpm format

# 清理构建产物
pnpm clean
```

## 配置 LLM（可选）

如果要使用 LLM 功能（Intent Parser、代码审查等），需要配置 API 密钥：

```bash
# OpenAI
export OPENAI_API_KEY="your-api-key"

# Claude
export ANTHROPIC_API_KEY="your-api-key"
```

使用示例：

```typescript
import { Orchestrator } from '@loom/orchestrator';
import { createLLMClient } from '@loom/llm-client';

const llmClient = createLLMClient({
  provider: 'openai',
  model: 'gpt-4o',
  apiKey: process.env.OPENAI_API_KEY,
});

const orchestrator = new Orchestrator({
  llmClient,
  enableLLMCodeGen: true,
  enableCodeReview: true,
});
```

## 包功能说明

| 包 | 说明 | 测试状态 |
|---|---|---|
| @loom/core | GameSpec, Graph, Component, Adapter 类型定义 | - |
| @loom/schemas | JSON Schema 验证 | - |
| @loom/planner | GameSpec -> 4 种 Graph | 11/11 |
| @loom/runtime-adapter | 6 个 Phaser.js 适配器 | passing |
| @loom/code-generator | 8 阶段代码生成 | passing |
| @loom/llm-client | OpenAI + Claude 客户端 | 12/12 |
| @loom/intent-parser | 自然语言 -> GameSpec | 41/41 |
| @loom/asset-resolver | 资源解析 + 占位符 | 8/8 |
| @loom/orchestrator | 端到端管线 | 3/3 E2E |
| @loom/harness | 评估框架 | 3 golden tests |

## 示例游戏

查看 `examples/` 目录中的示例：

```bash
cat examples/01-flappy-bird.json
cat examples/02-space-runner.json
cat examples/03-galactic-shooter.json
```

## 故障排查

### 依赖安装失败

```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### 构建失败

```bash
pnpm clean
pnpm build
```

### TypeScript 类型错误

```bash
pnpm typecheck
```

## 更多资源

- **设计文档**: `docs/` 目录
- **项目状态**: `PROJECT_STATUS.md`
- **开发路线图**: `DEVELOPMENT_ROADMAP.md`
- **任务看板**: `TASKS.md`
