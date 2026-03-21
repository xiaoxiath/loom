# Code Generator Agent v1.0 规范（Graph → 可执行代码编译器）

版本：v1.0
定位：SceneGraph + EntityGraph + ComponentGraph → Phaser.js 可运行代码
作用：将平台无关的 Graph 结构转换为具体的游戏引擎代码

Code Generator Agent 是实现"稳定自动生成"的核心执行层。

---

# 一、设计目标

Code Generator Agent 负责：

- 解析 SceneGraph, EntityGraph, ComponentGraph, SystemGraph
- 生成 Phaser.js 项目结构
- 生成 Scene 代码文件
- 生成 Entity 代码文件
- 生成 System 代码文件
- 生成配置文件（config.ts, package.json）
- 组装可运行的游戏 Bundle

设计原则：

- 模板驱动（Template-driven）
- 稳定生成（Stable generation）
- 可读代码（Readable code）
- 可调试（Debuggable）
- 可扩展（Extensible）

---

# 二、系统位置

系统执行链：

```
GameSpec DSL
↓
Planner Agent
↓
SceneGraph + EntityGraph + ComponentGraph + SystemGraph
↓
Adapter Binding
↓
Code Generator Agent ← 核心编译层
↓
Phaser Project Bundle
↓
Playable Game
```

---

# 三、输入输出定义

### 输入

```typescript
interface CodeGeneratorInput {
  sceneGraph: SceneGraph;
  entityGraph: EntityGraph;
  componentGraph: ComponentGraph;
  systemGraph: SystemGraph;
  adapterBindings: AdapterBinding[];
  gameSpec: GameSpec;
}
```

### 输出

```typescript
interface CodeGeneratorOutput {
  files: GeneratedFile[];
  dependencies: Record<string, string>;
  entryPoint: string;
  diagnostics: GeneratorDiagnostics;
}

interface GeneratedFile {
  path: string;
  content: string;
  type: 'scene' | 'entity' | 'system' | 'config' | 'asset';
}
```

---

# 四、生成策略：Template + Patch

### 为什么不用完全 AI 生成？

❌ 问题：
- AI 生成的代码不稳定
- 代码质量不可控
- 难以调试和维护
- 容易产生幻觉（hallucination）

✅ 解决方案：**Template + Patch**

- 基础模板：经过测试的 Phaser 项目模板
- Patch 生成：根据 Graph 动态插入代码片段
- 组合策略：像拼乐高一样组装代码

### 模板结构

```
templates/phaser-basic/
├ src/
│  ├ scenes/
│  │  └ MainScene.ts        # 主场景模板
│  ├ entities/
│  │  └ EntityBase.ts       # 实体基类
│  ├ systems/
│  │  ├ PhysicsSystem.ts    # 物理系统
│  │  ├ CollisionSystem.ts  # 碰撞系统
│  │  └ InputSystem.ts      # 输入系统
│  ├ components/            # 组件实现
│  │  ├ JumpComponent.ts
│  │  ├ ShootComponent.ts
│  │  └ ...
│  └ config.ts              # 游戏配置
├ index.html                # 入口 HTML
└ package.json              # 依赖
```

---

# 五、代码生成流程

### Stage 1: 项目初始化

```typescript
// 复制模板项目到输出目录
copyTemplate('phaser-basic', outputDir);
```

### Stage 2: Scene 生成

**输入**: SceneGraph

**生成内容**:
- MainScene.ts

**模板变量替换**:

```typescript
// 模板: templates/phaser-basic/src/scenes/MainScene.ts

export class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' });
  }

  preload() {
    // {{ASSET_LOADINGS}}
  }

  create() {
    // {{ENTITY_CREATIONS}}
    // {{SYSTEM_SETUPS}}
    // {{COLLISION_SETUPS}}
  }

  update(time: number, delta: number) {
    // {{UPDATE_LOGICS}}
  }
}
```

**生成示例**:

```typescript
export class MainScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private enemies!: Phaser.Physics.Arcade.Group;

  constructor() {
    super({ key: 'MainScene' });
  }

  preload() {
    this.load.image('player_ship', 'assets/player_ship.png');
    this.load.image('enemy_basic', 'assets/enemy_basic.png');
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(200, 400, 'player_ship');
    this.player.setCollideWorldBounds(true);

    // 创建敌人群组
    this.enemies = this.physics.add.group();

    // 设置碰撞
    this.physics.add.collider(this.player, this.enemies, this.handlePlayerEnemyCollision, undefined, this);

    // 设置摄像机
    this.cameras.main.startFollow(this.player);

    // 设置输入
    this.input.keyboard.on('keydown-SPACE', () => {
      this.handleJump();
    });
  }

  update(time: number, delta: number) {
    // 更新逻辑
    this.updatePlayerMovement();
    this.updateEnemySpawning();
  }

  private handleJump() {
    if (this.player.body.touching.down) {
      this.player.setVelocityY(-320);
    }
  }

  private handlePlayerEnemyCollision(player: any, enemy: any) {
    this.scene.restart();
  }
}
```

### Stage 3: Entity 生成

**输入**: EntityGraph, ComponentGraph

**生成策略**:
- 为每个 Entity 生成创建代码
- 注入到 Scene 的 create() 方法

**代码片段模板**:

```typescript
// Entity Creation Template
const {{ENTITY_ID}} = this.physics.add.sprite({{X}}, {{Y}}, '{{SPRITE}}');
{{#IF_STATIC}}
{{ENTITY_ID}}.setStatic(true);
{{/IF_STATIC}}
{{#IF_COLLIDABLE}}
{{ENTITY_ID}}.setCollideWorldBounds(true);
{{/IF_COLLIDABLE}}
```

### Stage 4: Component 生成

**输入**: ComponentGraph, AdapterBindings

**生成策略**:
- 使用 Adapter 映射到 Phaser API
- 生成组件初始化和更新逻辑

**示例: Jump Component**

```typescript
// 在 Scene 中生成跳跃逻辑
private jump(player: Phaser.Physics.Arcade.Sprite) {
  if (player.body.touching.down) {
    player.setVelocityY(-320); // force: 320
  }
}

// 在 create() 中绑定输入
this.input.keyboard.on('keydown-SPACE', () => {
  this.jump(this.player);
});
```

### Stage 5: System 生成

**输入**: SystemGraph

**系统类型**:

1. **Physics System** (自动启用)
   - Phaser 内置 Arcade Physics
   - 无需额外代码

2. **Collision System**
   ```typescript
   this.physics.add.collider(entity1, entity2, callback);
   ```

3. **Input System**
   ```typescript
   this.input.keyboard.on('keydown-KEY', callback);
   ```

4. **Spawn System**
   ```typescript
   // 定时生成敌人
   this.time.addEvent({
     delay: 2000,
     callback: this.spawnEnemy,
     callbackScope: this,
     loop: true
   });
   ```

### Stage 6: Config 生成

**生成 config.ts**:

```typescript
export const GameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 980 },
      debug: false
    }
  },
  scene: [MainScene]
};
```

### Stage 7: Asset 配置生成

**生成 asset manifest**:

```typescript
export const Assets = {
  sprites: {
    player_ship: 'assets/sprites/player_ship.png',
    enemy_basic: 'assets/sprites/enemy_basic.png',
  },
  backgrounds: {
    sky: 'assets/backgrounds/sky.png'
  },
  sounds: {
    jump: 'assets/sounds/jump.mp3'
  }
};
```

### Stage 8: Package.json 生成

```json
{
  "name": "loom-generated-game",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "dependencies": {
    "phaser": "^3.70.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "typescript": "^5.3.0"
  }
}
```

---

# 六、模板变量系统

### 变量语法

使用 `{{VARIABLE_NAME}}` 语法

### 常用变量

```typescript
// 游戏配置
{{GAME_TITLE}}
{{GAME_WIDTH}}
{{GAME_HEIGHT}}
{{GRAVITY}}
{{BACKGROUND_COLOR}}

// 场景
{{SCENE_NAME}}
{{SCENE_KEY}}

// 实体
{{ENTITY_ID}}
{{ENTITY_TYPE}}
{{ENTITY_X}}
{{ENTITY_Y}}
{{ENTITY_SPRITE}}

// 组件
{{COMPONENT_TYPE}}
{{COMPONENT_CONFIG}}

// 系统
{{SYSTEM_TYPE}}
{{SYSTEM_CONFIG}}
```

### 条件块

```typescript
{{#IF_GRAVITY}}
player.body.setAllowGravity(true);
{{/IF_GRAVITY}}

{{#IF_COLLIDABLE}}
player.setCollideWorldBounds(true);
{{/IF_COLLIDABLE}}
```

### 循环块

```typescript
{{#EACH_ENTITIES}}
const {{ENTITY_ID}} = this.physics.add.sprite({{X}}, {{Y}}, '{{SPRITE}}');
{{/EACH_ENTITIES}}
```

---

# 七、代码组织规范

### 文件命名

```
scenes/
  ├ MainScene.ts
  └ GameOverScene.ts

entities/
  ├ Player.ts
  ├ Enemy.ts
  └ Projectile.ts

systems/
  ├ PhysicsSystem.ts
  ├ CollisionSystem.ts
  └ InputSystem.ts

components/
  ├ JumpComponent.ts
  └ ShootComponent.ts

config/
  ├ GameConfig.ts
  └ Assets.ts
```

### 类命名

- Scene: `{Name}Scene` (e.g., `MainScene`)
- Entity: `{Name}` (e.g., `Player`, `Enemy`)
- System: `{Name}System` (e.g., `CollisionSystem`)
- Component: `{Name}Component` (e.g., `JumpComponent`)

### 方法命名

- `create*()` - 创建方法
- `update*()` - 更新方法
- `handle*()` - 事件处理方法
- `spawn*()` - 生成方法

---

# 八、错误处理

### 生成失败场景

1. **模板不存在**
   - 回退到基础模板
   - 记录警告

2. **变量替换失败**
   - 使用默认值
   - 记录诊断信息

3. **组件映射失败**
   - 跳过该组件
   - 记录错误

### 诊断输出

```typescript
interface GeneratorDiagnostics {
  warnings: string[];
  errors: string[];
  skippedComponents: string[];
  usedTemplates: string[];
}
```

---

# 九、优化策略

### 1. 代码复用

- 共享的组件逻辑提取到基类
- 常用的工具函数提取到 utils

### 2. 性能优化

- 使用 Object Pool 管理实体
- 优化碰撞检测分组
- 减少 update 中的计算

### 3. 可读性优化

- 添加代码注释
- 格式化代码
- 有意义的变量名

---

# 十、测试策略

### 单元测试

- 模板变量替换测试
- 代码片段生成测试
- 配置生成测试

### 集成测试

- 端到端生成测试
- 生成的代码可运行测试
- 游戏逻辑正确性测试

### 快照测试

- 对比生成的代码快照
- 确保生成结果稳定

---

# 十一、扩展机制

### 自定义模板

```typescript
interface TemplatePlugin {
  name: string;
  templatePath: string;
  variables: Record<string, any>;
}
```

### 自定义生成器

```typescript
interface GeneratorPlugin {
  componentType: string;
  generate(entity: Entity, config: any): string;
}
```

---

# 十二、示例完整输出

### 目录结构

```
dist/game/
├ src/
│  ├ scenes/
│  │  └ MainScene.ts
│  ├ entities/
│  │  ├ Player.ts
│  │  └ Enemy.ts
│  ├ config/
│  │  ├ GameConfig.ts
│  │  └ Assets.ts
│  └ main.ts
├ assets/
│  ├ sprites/
│  └ backgrounds/
├ index.html
├ package.json
└ tsconfig.json
```

### package.json

```json
{
  "name": "space-runner",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "phaser": "^3.70.0"
  }
}
```

---

# 十三、设计总结

Code Generator Agent v1.0 提供：

- 模板驱动代码生成能力
- Graph 到 Phaser 代码映射能力
- 稳定可靠的生成策略
- 可读可调试的代码输出
- 完整的项目结构生成
- 诊断和错误处理能力
- 插件扩展能力

是实现 AI 自动生成小游戏"稳定运行能力"的核心代码生成层。

---

# 十四、实现优先级

### MVP 阶段（必须）

- [x] 基础模板项目
- [x] Scene 代码生成
- [x] Entity 创建代码生成
- [x] 基础 Component 映射
- [x] Config 文件生成
- [x] package.json 生成

### 后续阶段

- [ ] 高级组件生成
- [ ] 多场景支持
- [ ] 自定义模板系统
- [ ] 代码优化
- [ ] Source Map 支持
