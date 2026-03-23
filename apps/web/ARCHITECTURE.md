# Loom Webapp Architecture Design

## 概述

Loom Webapp 使用 **服务端打包架构**，将 TypeScript 游戏代码编译成浏览器可运行的 JavaScript bundle。

## 核心架构

```
┌─────────────────────────────────────────────────────────────┐
│                        用户界面层                             │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   │
│  │  GameSpec    │   │   Editor     │   │   Preview    │   │
│  │  编辑器       │   │   (Monaco)    │   │   (iframe)    │   │
│  └──────────────┘   └──────────────┘   └──────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ↓ GameSpec
┌─────────────────────────────────────────────────────────────┐
│                        API 层                                │
│  POST /api/generate                                         │
│  ┌────────────────────────────────────────────────────┐   │
│  │  1. Orchestrator.generate()                         │   │
│  │     ↓ 生成 TypeScript 项目                           │   │
│  │  2. 写入临时目录                                      │   │
│  │     /tmp/loom-game-{timestamp}/                     │   │
│  │  3. esbuild.build()                                 │   │
│  │     ↓ 打包 + 优化                                     │   │
│  │  4. 返回 bundle.js                                   │   │
│  └────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ↓ bundle.js
┌─────────────────────────────────────────────────────────────┐
│                      浏览器运行层                             │
│  <iframe>                                                   │
│  ┌────────────────────────────────────────────────────┐   │
│  │  <!DOCTYPE html>                                    │   │
│  │  <script>                                           │   │
│  │    // bundle.js (包含 Phaser + 游戏代码)              │   │
│  │    GameBundle.main();                               │   │
│  │  </script>                                          │   │
│  └────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 数据流

### 1. 用户输入 → GameSpec

```typescript
// 用户在 Monaco 编辑器中编辑
{
  "meta": {
    "title": "Flappy Bird",
    "genre": "runner"
  },
  "entities": [...],
  "systems": ["physics", "input"]
}
```

### 2. API 处理

```typescript
// apps/web/src/app/api/generate/route.ts

export async function POST(request: NextRequest) {
  const { gameSpec } = await request.json();

  // 1. 生成 TypeScript 项目
  const orchestrator = new Orchestrator({...});
  const result = await orchestrator.generate({ gameSpec });

  // 输出文件：
  // - src/main.ts       (入口)
  // - src/config.ts     (游戏配置)
  // - src/scenes/MainScene.ts  (主场景)

  // 2. 写入临时目录
  const tempDir = `/tmp/loom-game-${Date.now()}`;
  await writeFiles(tempDir, result.codeOutput.files);

  // 3. esbuild 打包
  const bundle = await esbuild.build({
    entryPoints: [path.join(tempDir, 'src/main.ts')],
    bundle: true,
    minify: true,
    format: 'iife',
    globalName: 'GameBundle',
    platform: 'browser',
    external: [],  // 打包所有依赖（包括 Phaser）
  });

  // 4. 返回 bundle
  return NextResponse.json({
    files: [{
      path: 'bundle.js',
      content: bundle.outputFiles[0].text,
      type: 'bundle'
    }]
  });
}
```

### 3. 浏览器运行

```typescript
// apps/web/src/components/preview/GamePreview.tsx

// 从 API 接收 bundle.js
const bundleCode = files.find(f => f.path === 'bundle.js').content;

// 构建 HTML
const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body>
  <div id="game-container"></div>
  <script>
    ${bundleCode}
  </script>
</body>
</html>
`;

// 创建 Blob URL
const blob = new Blob([html], { type: 'text/html' });
const url = URL.createObjectURL(blob);

// 在 iframe 中加载
<iframe src={url} sandbox="allow-scripts" />
```

## Code Generator 架构

### 生成的 TypeScript 项目结构

```
loom-game/
├── src/
│   ├── main.ts          # 入口文件
│   ├── config.ts        # Phaser 配置
│   └── scenes/
│       └── MainScene.ts # 游戏主场景
├── package.json         # 依赖声明
└── tsconfig.json        # TypeScript 配置
```

### main.ts (入口)

```typescript
import Phaser from 'phaser';
import { GameConfig } from './config';

window.addEventListener('load', () => {
  new Phaser.Game(GameConfig);
});
```

### config.ts (配置)

```typescript
import Phaser from 'phaser';
import { MainScene } from './scenes/MainScene';

export const GameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 980 }
    }
  },
  scene: [MainScene]
};
```

### MainScene.ts (场景)

```typescript
import Phaser from 'phaser';

export class MainScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private score = 0;

  constructor() {
    super({ key: 'MainScene' });
  }

  preload() {
    this.load.image('player', 'assets/player.png');
  }

  create() {
    this.player = this.physics.add.sprite(400, 300, 'player');
  }

  update(time: number, delta: number) {
    // 游戏逻辑
  }
}
```

## esbuild 配置详解

```typescript
await esbuild.build({
  // 入口文件
  entryPoints: ['src/main.ts'],

  // 打包模式
  bundle: true,           // 递归解析 import
  minify: true,           // 压缩代码
  format: 'iife',         // 立即执行函数 (浏览器兼容)
  globalName: 'GameBundle', // 全局变量名

  // 目标环境
  platform: 'browser',    // 浏览器环境
  target: ['es2020'],     // 现代浏览器

  // 依赖处理
  external: [],           // 空 = 打包所有依赖（包括 Phaser）

  // 输出
  outfile: 'bundle.js',
  write: false,           // 返回内存中的结果
});
```

### 关键配置说明

**format: 'iife'**
- 立即执行函数表达式
- 生成 `(function() { ... })()`
- 浏览器可直接运行

**globalName: 'GameBundle'**
- 将导出挂载到全局变量
- 可以通过 `window.GameBundle` 访问

**external: []**
- 默认情况下会打包 Phaser (约 600KB)
- 如果想用 CDN 加载 Phaser，可以设置 `external: ['phaser']`

## 为什么不用其他方案？

### ❌ 方案 A: 客户端正则剥离

```typescript
// 错误示范
code
  .replace(/private \w+!: .+;/g, '')
  .replace(/: Phaser\..+;/g, ';')
```

**问题**:
- 无法处理复杂 TypeScript 语法
- 正则容易出错
- 没有模块系统

### ❌ 方案 C: 客户端 Sucrase

```typescript
// 客户端编译
import { transform } from 'sucrase';
const js = transform(ts, { transforms: ['typescript'] });
```

**问题**:
- 编译延迟 (50-100ms)
- 仍然没有模块系统
- 无法处理 `import Phaser from 'phaser'`

### ✅ 方案 B: 服务端 esbuild 打包 (当前方案)

**优点**:
- ✅ 完整的 TypeScript 支持
- ✅ ES6 模块系统
- ✅ 打包所有依赖
- ✅ 生产级优化 (压缩、tree-shaking)
- ✅ 快速 (500-1000ms)
- ✅ 可扩展 (支持 Phaser 插件、资源)

## 性能指标

| 指标 | 数值 |
|------|------|
| **代码生成** | 100-300ms |
| **esbuild 打包** | 500-1000ms |
| **总 API 延迟** | 600-1300ms |
| **Bundle 大小** | ~600KB (minified) |
| **浏览器加载** | < 2s |
| **首次渲染** | < 500ms |

## 安全考虑

### iframe 沙箱

```html
<iframe
  src={blobUrl}
  sandbox="allow-scripts"  <!-- 仅允许脚本执行 -->
/>
```

**限制**:
- ❌ 不允许 `allow-same-origin` (防止访问父窗口)
- ❌ 不允许 `allow-forms`
- ❌ 不允许 `allow-popups`
- ✅ 仅允许 `allow-scripts`

### Blob URL

```typescript
const blob = new Blob([html], { type: 'text/html' });
const url = URL.createObjectURL(blob);

// 生命周期管理
useEffect(() => {
  return () => URL.revokeObjectURL(url);  // 清理
}, [url]);
```

## 扩展性

### 添加 Phaser 插件

```typescript
// 生成代码中引入插件
import Phaser from 'phaser';
import VirtualJoystickPlugin from 'phaser3-rex-plugins/plugins/virtualjoystick-plugin.js';

const config = {
  plugins: {
    global: [{
      key: 'VirtualJoystickPlugin',
      plugin: VirtualJoystickPlugin,
      start: true
    }]
  }
};
```

### 多场景支持

```typescript
// config.ts
import { MainScene } from './scenes/MainScene';
import { MenuScene } from './scenes/MenuScene';
import { GameOverScene } from './scenes/GameOverScene';

export const GameConfig = {
  scene: [MenuScene, MainScene, GameOverScene]
};
```

### 资源优化

```typescript
// 未来: 使用 CDN 加载 Phaser (减少 bundle 大小)
esbuild.build({
  external: ['phaser'],  // 不打包 Phaser
  // ...
});

// HTML 中加载
<script src="https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.min.js"></script>
<script src="bundle.js"></script>
```

## 部署

### Vercel (推荐)

```bash
cd apps/web
vercel
```

**环境变量**: 无需配置 (esbuild 是纯 JavaScript)

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "start"]
```

## 故障排查

### Bundle 过大

```bash
# 分析 bundle 组成
esbuild --bundle src/main.ts --analyze
```

**优化方案**:
1. 使用 CDN 加载 Phaser (`external: ['phaser']`)
2. 按需加载场景
3. 压缩资源

### 打包失败

**常见错误**:
1. 找不到模块: 检查 `package.json` 依赖
2. 语法错误: 检查生成的 TS 代码
3. 类型错误: 检查 `tsconfig.json`

```typescript
// API 返回详细错误
return NextResponse.json({
  success: false,
  error: error.message,
  stack: error.stack,  // 仅开发环境
  diagnostics: {...}
}, { status: 500 });
```

### 游戏不显示

**检查清单**:
1. ✅ bundle.js 是否成功加载 (Network tab)
2. ✅ 浏览器控制台是否有错误
3. ✅ Phaser.Game 是否正确初始化
4. ✅ Canvas 是否正确渲染 (检查 DOM)

## 未来优化

### 短期 (v1.1)
- [ ] Bundle 大小优化 (拆分 Phaser)
- [ ] 添加 Source Map 支持
- [ ] 缓存编译结果

### 中期 (v1.5)
- [ ] 热重载 (HMR) 支持
- [ ] 多场景编辑器
- [ ] 资源管理器

### 长期 (v2.0)
- [ ] WebAssembly 加速
- [ ] Web Worker 编译
- [ ] 分布式构建

---

**架构版本**: v1.0
**最后更新**: 2026-03-23
**维护者**: Loom Team
