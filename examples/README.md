# GameSpec 示例集

本目录包含 3 个完整的 GameSpec JSON 示例，展示了不同游戏类型的核心特性。

---

## 📁 示例文件

### 1. Flappy Bird Clone (`01-flappy-bird.json`)

**类型**: Runner / 跑酷
**视角**: Side-scrolling (横版)
**核心玩法**: 点击跳跃，躲避障碍物

**特性**:
- ✅ 重力系统
- ✅ 跳跃机制
- ✅ 碰撞检测
- ✅ 距离计分
- ✅ 自动生成障碍物（pipe）
- ✅ 游戏结束条件

**实体**:
- `player` - 小鸟（跳跃 + 重力 + 碰撞）
- `pipe_top` - 上方管道（生成 + 移动）
- `pipe_bottom` - 下方管道（生成 + 移动）
- `ground` - 地面（碰撞）

**组件**:
- Jump - 跳跃
- Gravity - 重力
- Collision - 碰撞
- Spawn - 生成
- Move - 移动

**使用场景**: 学习基础物理、跳跃机制、障碍物生成

---

### 2. Space Runner (`02-space-runner.json`)

**类型**: Runner / 跑酷
**视角**: Side-scrolling (横版)
**核心玩法**: 自动跑酷，跳跃躲避，收集金币

**特性**:
- ✅ 自动滚动
- ✅ 平台跳跃
- ✅ 金币收集
- ✅ 障碍物躲避
- ✅ 生命值系统
- ✅ 无限关卡

**实体**:
- `player` - 宇航员（跑 + 跳 + 收集 + 生命值）
- `platform` - 平台（生成）
- `coin` - 金币（生成 + 收集）
- `asteroid` - 小行星（生成 + 移动 + 碰撞销毁）
- `ground` - 地面

**组件**:
- Run - 跑动
- Jump - 跳跃
- Collect - 收集
- Health - 生命值
- DestroyOnCollision - 碰撞销毁

**使用场景**: 学习平台游戏、收集机制、无限生成

---

### 3. Galactic Shooter (`03-galactic-shooter.json`)

**类型**: Shooter / 射击
**视角**: Top-down (俯视)
**核心玩法**: 移动射击，消灭敌人

**特性**:
- ✅ 自由移动（上下左右）
- ✅ 射击系统
- ✅ 多种敌人类型
- ✅ 敌人 AI
- ✅ 道具系统（health, weapon upgrade）
- ✅ 波次系统
- ✅ 渐进难度

**实体**:
- `player` - 玩家飞船（移动 + 射击 + 生命值）
- `player_bullet` - 玩家子弹（移动 + 销毁）
- `enemy_basic` - 基础敌人（生成 + 移动 + 生命值）
- `enemy_shooter` - 射击敌人（生成 + 移动 + 射击 + 生命值）
- `enemy_bullet` - 敌人子弹
- `powerup_health` - 生命道具
- `powerup_weapon` - 武器道具

**组件**:
- Move - 移动
- Shoot - 射击
- Health - 生命值
- Spawn - 生成
- DestroyOnCollision - 碰撞销毁
- TimeToLive - 生命周期
- Collect - 收集
- AI - 敌人 AI

**使用场景**: 学习射击机制、敌人 AI、道具系统、波次管理

---

## 🔍 验证示例

### 使用 JSON Schema 验证

```bash
# 验证单个文件
node ../schemas/dist/validate.js gamespec.schema.json ./01-flappy-bird.json

# 验证所有示例
for file in *.json; do
  echo "Validating $file..."
  node ../schemas/dist/validate.js gamespec.schema.json "./$file"
done
```

### 编程方式验证

```typescript
import { validate } from '@loom/schemas';
import flappyBirdSpec from './01-flappy-bird.json';

const valid = validate(
  'https://loom.dev/schemas/gamespec.schema.json',
  flappyBirdSpec
);

if (!valid) {
  console.error('Validation failed');
} else {
  console.log('✅ Valid GameSpec');
}
```

---

## 📊 示例对比

| 特性 | Flappy Bird | Space Runner | Galactic Shooter |
|------|-------------|--------------|------------------|
| **类型** | Runner | Runner | Shooter |
| **视角** | Side | Side | Top-down |
| **重力** | ✅ | ✅ | ❌ |
| **跳跃** | ✅ | ✅ | ❌ |
| **射击** | ❌ | ❌ | ✅ |
| **收集** | ❌ | ✅ | ✅ |
| **敌人 AI** | ❌ | ❌ | ✅ |
| **道具** | ❌ | ❌ | ✅ |
| **生命值** | ❌ | ✅ | ✅ |
| **波次** | ❌ | ❌ | ✅ |
| **复杂度** | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |

---

## 🎯 使用这些示例

### 1. 作为测试数据

```typescript
import flappyBirdSpec from './examples/01-flappy-bird.json';
import { Planner } from '@loom/planner';

const planner = new Planner();
const graphs = planner.plan(flappyBirdSpec);
```

### 2. 学习 GameSpec 结构

每个示例都展示了不同的核心概念：

- **Flappy Bird**: 基础物理、简单机制
- **Space Runner**: 平台游戏、收集、无限生成
- **Galactic Shooter**: 复杂实体、AI、道具系统

### 3. 开发和调试

使用这些固定示例来测试 Planner、Code Generator 等模块。

---

## 🛠️ 创建自己的 GameSpec

### 步骤

1. **选择基础模板**
   - 从最相似的示例开始
   - 复制并修改

2. **定义 Meta 信息**
   ```json
   {
     "meta": {
       "title": "My Game",
       "genre": "platformer",
       "camera": "side",
       "dimension": "2D",
       "version": "1.0"
     }
   }
   ```

3. **设置游戏参数**
   ```json
   {
     "settings": {
       "gravity": 980,
       "worldWidth": 800,
       "worldHeight": 600
     }
   }
   ```

4. **定义实体**
   ```json
   {
     "entities": [
       {
         "id": "player",
         "type": "player",
         "sprite": "player_ship",
         "components": ["jump", "gravity"]
       }
     ]
   }
   ```

5. **添加系统和机制**
   ```json
   {
     "systems": ["physics", "collision", "input"],
     "mechanics": ["jump", "collect"]
   }
   ```

6. **配置资源和 UI**
   ```json
   {
     "assets": [...],
     "ui": {
       "hud": ["score"],
       "startScreen": true
     }
   }
   ```

7. **验证**
   ```bash
   node ../schemas/dist/validate.js gamespec.schema.json ./my-game.json
   ```

---

## 📚 扩展阅读

- [GameSpec DSL 规范](../docs/gamespec_dsl_v_1_spec.md)
- [组件系统](../docs/gamespec_component_spec_v_1.md)
- [Planner Agent](../docs/planner_agent_v_1_spec.md)
- [JSON Schema](../schemas/README.md)

---

## 🤝 贡献示例

欢迎添加更多示例！请确保：

1. ✅ 遵循 JSON Schema
2. ✅ 包含完整的 meta 信息
3. ✅ 所有实体都有 sprite 引用
4. ✅ 组件和系统匹配
5. ✅ 添加注释说明游戏类型和特性

---

## 📝 示例命名规范

```
{number}-{name}.json

例如:
01-flappy-bird.json
02-space-runner.json
03-galactic-shooter.json
04-mario-platformer.json
05-pong-classic.json
...
```

---

## 🎮 示例路线图

### 当前示例 (MVP)
- ✅ Runner (Flappy Bird)
- ✅ Runner with Collection (Space Runner)
- ✅ Shooter (Galactic Shooter)

### 未来示例
- [ ] Platformer (Mario-style)
- [ ] Puzzle (Match-3)
- [ ] Racing
- [ ] RPG
- [ ] Strategy

---

**这些示例是 Loom 平台的测试基准，确保核心功能正常工作。**
