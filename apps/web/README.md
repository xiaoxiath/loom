# Loom Webapp

AI 驱动的游戏生成平台 - Next.js Web 界面

## 技术栈

- **框架**: Next.js 16 (App Router)
- **UI**: shadcn/ui + Tailwind CSS
- **状态管理**: Zustand
- **代码编辑器**: Monaco Editor
- **游戏引擎**: Phaser.js 3
- **后端**: Next.js API Routes

## 功能特性

### ✅ 已实现（MVP）

1. **首页**
   - 展示 3 个示例游戏（Flappy Bird、Space Runner、Galactic Shooter）
   - 点击示例卡片加载预设 GameSpec
   - 创建新游戏入口

2. **GameSpec 编辑器**
   - Monaco 编辑器实时编辑 JSON
   - 语法高亮和自动格式化
   - 撤销/重做功能

3. **代码生成**
   - 一键调用 Orchestrator API
   - 模板模式生成（无需 LLM）
   - 生成进度显示

4. **游戏预览**
   - iframe 沙箱安全运行
   - Phaser.js 游戏实时渲染
   - 重载功能

5. **代码查看**
   - 文件树展示生成文件
   - 代码内容查看器
   - 分类图标（scene、config 等）

## 快速开始

### 安装依赖

```bash
# 在项目根目录
pnpm install
```

### 开发模式

```bash
# 方式 1: 从 web 目录启动
cd apps/web
pnpm dev

# 方式 2: 从项目根目录（需要先构建 packages）
pnpm --filter web dev
```

访问 http://localhost:3000

### 生产构建

```bash
cd apps/web
pnpm build
pnpm start
```

## 使用流程

1. **加载示例**
   - 访问首页
   - 点击示例卡片（如 "Flappy Bird"）
   - 自动跳转到编辑器

2. **编辑 GameSpec**
   - 在左侧 Monaco 编辑器中修改 JSON
   - 实时语法验证
   - 支持撤销/重做

3. **生成游戏**
   - 点击右上角 "生成游戏" 按钮
   - 等待生成完成（通常 < 1 秒）

4. **查看结果**
   - 右上方：游戏预览（可玩）
   - 右下方：生成的文件树和代码
   - 点击文件查看具体内容

5. **重载预览**
   - 点击预览区域的 "重载" 按钮
   - 重新运行游戏

## API 端点

### POST /api/generate

生成游戏代码

**请求**:
```json
{
  "gameSpec": { /* GameSpec 对象 */ }
}
```

**响应**:
```json
{
  "success": true,
  "files": [
    {
      "path": "scenes/MainScene.ts",
      "content": "...",
      "type": "scene"
    }
  ],
  "diagnostics": {
    "warnings": [],
    "errors": [],
    "generatedFiles": ["scenes/MainScene.ts"],
    "generationMethod": "template"
  }
}
```

### GET /api/examples/[id]

加载示例 GameSpec

**支持的 ID**:
- `flappy-bird`
- `space-runner`
- `galactic-shooter`

**响应**:
```json
{
  "gameSpec": { /* 完整的 GameSpec 对象 */ }
}
```

## 技术亮点

### 1. Monaco Editor 集成

- 动态导入优化包大小（~2MB）
- 暗色主题
- JSON 语法高亮
- 自动格式化

### 2. iframe 沙箱

- 严格的安全策略（`sandbox="allow-scripts"`）
- Blob URL 避免跨域
- 完全隔离的游戏运行环境

### 3. Zustand 状态管理

- 轻量级（~1KB gzipped）
- 支持撤销/重做历史记录
- 类型安全

### 4. shadcn/ui 组件库

- 可定制的 Radix UI 组件
- Tailwind CSS 样式
- 完全类型安全

## 开发指南

### 添加新的 UI 组件

```bash
cd apps/web
pnpm dlx shadcn@latest add [component-name]
```

### 修改主题

编辑 `src/app/globals.css` 中的 CSS 变量：

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  /* ... */
}
```

### 添加新的 API 端点

在 `src/app/api/` 下创建新目录和 `route.ts` 文件。

## 性能优化

- ✅ Monaco Editor 动态导入
- ✅ Next.js 自动代码分割
- ✅ Tailwind CSS Tree Shaking
- ✅ 图片优化（Next.js Image）
- ✅ API Routes 按需加载

## 浏览器支持

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 部署

### Vercel（推荐）

```bash
# 安装 Vercel CLI
pnpm add -g vercel

# 部署
cd apps/web
vercel
```

## 故障排查

### 依赖安装失败

```bash
# 清理并重新安装
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### 构建失败

```bash
# 确保内部包已构建
cd ../..
pnpm build

# 然后构建 webapp
cd apps/web
pnpm build
```

### Monaco Editor 不加载

检查浏览器控制台是否有 CORS 错误。Monaco 需要从 CDN 加载字体。

### 游戏预览不显示

1. 检查生成的文件是否包含 `scene` 和 `config` 类型
2. 检查浏览器控制台是否有 JavaScript 错误
3. 确认 Phaser.js CDN 可访问

## 未来计划

### Phase 2（下一版本）

- [ ] 表单化 GameSpec 编辑器
- [ ] 可视化实体编辑器（React Flow）
- [ ] 实时协作
- [ ] 数据库保存/加载
- [ ] URL 分享生成游戏

### Phase 3

- [ ] LLM 驱动代码生成
- [ ] 代码审查集成
- [ ] 多场景支持
- [ ] ZIP 导出
- [ ] Phaser Editor 集成

## 许可证

MIT
