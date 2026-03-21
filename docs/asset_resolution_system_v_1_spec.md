# Asset Resolution System v1.0 规范（资源解析与管理系统）

版本：v1.0
定位：GameSpec Asset References → 实际游戏资源（图片、音频、动画）
作用：智能匹配、生成、管理游戏所需的所有视觉和音频资源

Asset Resolution System 是实现"一键生成"的关键支持系统。

---

# 一、设计目标

Asset Resolution System 负责：

- 解析 GameSpec 中的资源需求
- 从资源库匹配最适合的资源
- 必要时调用 AI 生成资源
- 优化和压缩资源
- 管理资源的缓存和版本
- 生成资源的元数据

设计原则：

- 质量优先（Quality first）
- 缓存优先（Cache first）
- 库资源优先（Library first）
- AI 生成补充（AI generation as fallback）
- 风格一致（Style consistency）

---

# 二、系统位置

系统执行链：

```
GameSpec (Asset References)
↓
Asset Resolution System ← 资源解析核心
├ Asset Registry (资源库索引)
├ Asset Matcher (智能匹配)
├ Asset Cache (缓存层)
└ AI Generator (AI 生成)
↓
Resolved Assets (实际资源文件)
↓
Code Generator (资源路径注入)
↓
Playable Game
```

---

# 三、输入输出定义

### 输入

```typescript
interface AssetResolutionInput {
  assets: Asset[];  // GameSpec 中的资源引用
  gameMeta: GameMeta;  // 游戏元信息（风格、主题）
  outputPath: string;  // 输出目录
}
```

### 输出

```typescript
interface AssetResolutionOutput {
  resolvedAssets: ResolvedAsset[];
  manifest: AssetManifest;
  diagnostics: AssetDiagnostics;
}

interface ResolvedAsset {
  id: string;
  source: 'library' | 'cache' | 'ai-generated';
  path: string;
  metadata: AssetMetadata;
}

interface AssetManifest {
  [assetId: string]: {
    path: string;
    type: AssetType;
    loaded: boolean;
  };
}
```

---

# 四、资源解析流程

### Pipeline

```
1. Parse Asset Requirements
   ↓
2. Check Cache
   ↓ (miss)
3. Search Asset Library
   ↓ (no match)
4. AI Generate
   ↓
5. Optimize & Compress
   ↓
6. Save to Output
   ↓
7. Update Manifest
```

### Stage 1: Parse Requirements

解析 GameSpec 中的资源需求：

```typescript
interface AssetRequirement {
  id: string;
  type: AssetType;
  style?: StyleType;
  theme?: ThemeType;
  tags?: string[];
  constraints?: {
    width?: number;
    height?: number;
    format?: 'png' | 'jpg' | 'webp';
  };
}
```

示例：

```typescript
const requirements = [
  {
    id: 'player_ship',
    type: 'sprite',
    style: 'cartoon',
    theme: 'space',
    tags: ['ship', 'spaceship', 'player'],
    constraints: { width: 64, height: 64, format: 'png' }
  }
];
```

### Stage 2: Check Cache

**缓存层级**:

1. **Memory Cache** (进程内缓存)
2. **Disk Cache** (本地文件缓存)
3. **Remote Cache** (CDN 缓存)

**缓存 Key**:

```typescript
const cacheKey = hash({
  type: asset.type,
  style: asset.style,
  theme: asset.theme,
  tags: asset.tags.sort(),
  constraints: asset.constraints
});
```

**缓存命中**:

```typescript
if (cache.has(cacheKey)) {
  return cache.get(cacheKey);
}
```

### Stage 3: Search Asset Library

**资源库索引**:

```typescript
interface AssetLibrary {
  name: string;
  url: string;
  assets: LibraryAsset[];
  metadata: {
    license: string;
    attribution: string;
  };
}

interface LibraryAsset {
  id: string;
  type: AssetType;
  path: string;
  tags: string[];
  style: StyleType;
  theme: ThemeType;
  similarity?: number;  // 匹配相似度
}
```

**匹配算法**:

```typescript
function matchAsset(requirement: AssetRequirement, library: AssetLibrary): LibraryAsset | null {
  const candidates = library.assets.filter(asset => {
    // 类型必须匹配
    if (asset.type !== requirement.type) return false;

    // 计算相似度分数
    const styleScore = asset.style === requirement.style ? 1.0 : 0.5;
    const themeScore = asset.theme === requirement.theme ? 1.0 : 0.5;
    const tagScore = jaccardSimilarity(asset.tags, requirement.tags);

    // 综合评分
    asset.similarity = styleScore * 0.4 + themeScore * 0.3 + tagScore * 0.3;

    return asset.similarity > 0.6; // 阈值
  });

  // 返回最匹配的
  return candidates.sort((a, b) => b.similarity - a.similarity)[0] || null;
}
```

**Jaccard 相似度**:

```typescript
function jaccardSimilarity(set1: string[], set2: string[]): number {
  const intersection = set1.filter(x => set2.includes(x));
  const union = [...new Set([...set1, ...set2])];
  return intersection.length / union.length;
}
```

### Stage 4: AI Generate

当资源库没有合适资源时，调用 AI 生成。

**支持的服务**:

1. **Stable Diffusion** (图片生成)
2. **DALL·E 3** (图片生成)
3. **Midjourney** (图片生成，通过 API)
4. **ElevenLabs** (音频生成)

**Prompt 生成策略**:

```typescript
function generatePrompt(requirement: AssetRequirement): string {
  const parts = [
    `game asset: ${requirement.type}`,
    requirement.style && `style: ${requirement.style}`,
    requirement.theme && `theme: ${requirement.theme}`,
    requirement.tags?.join(', '),
    'pixel art' /* 游戏常用风格 */,
    'transparent background' /* PNG 透明背景 */,
    requirement.constraints && `size: ${requirement.constraints.width}x${requirement.constraints.height}`
  ].filter(Boolean);

  return parts.join(', ');
}
```

**示例 Prompt**:

```
game asset: sprite, style: cartoon, theme: space, ship, spaceship, player,
pixel art, transparent background, size: 64x64
```

**生成调用**:

```typescript
const response = await openai.images.generate({
  model: 'dall-e-3',
  prompt: generatedPrompt,
  size: '1024x1024',
  quality: 'standard',
  n: 1,
  response_format: 'url'
});
```

**后处理**:

```typescript
// 1. 下载图片
const image = await download(response.data[0].url);

// 2. 调整尺寸
const resized = await sharp(image)
  .resize(requirement.constraints.width, requirement.constraints.height)
  .toBuffer();

// 3. 移除背景（如果需要）
const processed = await removeBackground(resized);

// 4. 优化
const optimized = await sharp(processed)
  .png({ compressionLevel: 9 })
  .toBuffer();
```

### Stage 5: Optimize & Compress

**图片优化**:

```typescript
import sharp from 'sharp';

async function optimizeImage(input: Buffer, constraints: any): Promise<Buffer> {
  let pipeline = sharp(input);

  // 调整尺寸
  if (constraints.width && constraints.height) {
    pipeline = pipeline.resize(constraints.width, constraints.height, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    });
  }

  // 格式转换
  switch (constraints.format) {
    case 'png':
      pipeline = pipeline.png({ compressionLevel: 9 });
      break;
    case 'jpg':
      pipeline = pipeline.jpeg({ quality: 85 });
      break;
    case 'webp':
      pipeline = pipeline.webp({ quality: 85 });
      break;
  }

  return pipeline.toBuffer();
}
```

**音频优化**:

```typescript
import ffmpeg from 'fluent-ffmpeg';

async function optimizeAudio(input: string, output: string): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(input)
      .audioCodec('libmp3lame')
      .audioBitrate('128k')
      .output(output)
      .on('end', resolve)
      .on('error', reject)
      .run();
  });
}
```

### Stage 6: Save to Output

**目录结构**:

```
output/assets/
├ sprites/
│  ├ player_ship.png
│  ├ enemy_basic.png
│  └ ...
├ backgrounds/
│  ├ sky.png
│  └ ...
├ sounds/
│  ├ jump.mp3
│  ├ shoot.mp3
│  └ ...
├ music/
│  └ background.mp3
└ manifest.json
```

**文件命名规范**:

- 使用 asset ID 作为文件名
- 小写、下划线分隔
- `{id}.{ext}`

### Stage 7: Update Manifest

**manifest.json**:

```json
{
  "version": "1.0",
  "generated": "2024-01-15T10:30:00Z",
  "assets": {
    "player_ship": {
      "path": "assets/sprites/player_ship.png",
      "type": "sprite",
      "size": "64x64",
      "source": "library",
      "attribution": "Kenney Assets"
    },
    "enemy_basic": {
      "path": "assets/sprites/enemy_basic.png",
      "type": "sprite",
      "size": "64x64",
      "source": "ai-generated",
      "model": "dall-e-3"
    }
  }
}
```

---

# 五、资源库集成

### Kenney Assets

**资源类型**:
- 2D 精灵
- UI 元素
- 音效
- 背景

**集成方式**:

```typescript
const kenneyLibrary: AssetLibrary = {
  name: 'Kenney Assets',
  url: 'https://kenney.nl/assets',
  assets: [
    // 索引所有资源
  ],
  metadata: {
    license: 'CC0',
    attribution: 'Kenney.nl'
  }
};
```

**自动化索引**:

```typescript
// 脚本：scripts/index-kenney-assets.ts
async function indexKenneyAssets() {
  const assets = await fetchKenneyAssets();
  const index = assets.map(asset => ({
    id: asset.name,
    type: inferType(asset.category),
    path: asset.url,
    tags: extractTags(asset.name, asset.category),
    style: 'cartoon',
    theme: inferTheme(asset.category)
  }));

  await writeFile('data/kenney-index.json', JSON.stringify(index, null, 2));
}
```

### itch.io

**开源游戏素材**:
- 用户上传
- 多种风格
- 需要筛选许可

### OpenGameArt.org

**分类资源**:
- 按类型分类
- 按许可筛选
- 元数据完善

---

# 六、AI 生成集成

### Stable Diffusion

**本地部署**:

```typescript
import { StableDiffusionPipeline } from '@diffusion/stable';

const pipeline = await StableDiffusionPipeline.fromPretrained('runwayml/stable-diffusion-v1-5');

const image = await pipeline({
  prompt: 'pixel art spaceship, transparent background',
  width: 64,
  height: 64,
  numInferenceSteps: 50
});
```

**API 调用** (Stability AI):

```typescript
const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.STABILITY_API_KEY}`
  },
  body: JSON.stringify({
    text_prompts: [{ text: prompt }],
    cfg_scale: 7,
    height: 1024,
    width: 1024,
    steps: 30,
    samples: 1
  })
});
```

### DALL·E 3

```typescript
const response = await openai.images.generate({
  model: 'dall-e-3',
  prompt: prompt,
  size: '1024x1024',
  quality: 'standard',
  n: 1
});
```

### 风格一致性

**方法 1: 风格迁移**

使用同一基础图片进行风格迁移：

```typescript
const baseStyle = await loadImage('style-base.png');

const generated = await img2img({
  initImage: baseStyle,
  prompt: 'spaceship in same style',
  strength: 0.7
});
```

**方法 2: 固定 Seed**

```typescript
const seed = 12345; // 固定种子

const response = await stableDiffusion({
  prompt,
  seed, // 确保风格一致
  ...
});
```

**方法 3: LoRA 微调**

训练特定风格的 LoRA 模型：

```bash
# 训练像素艺术风格 LoRA
accelerate launch train_dreambooth_lora.py \
  --pretrained_model_name_or_path="runwayml/stable-diffusion-v1-5" \
  --instance_data_dir="./pixel-art-dataset" \
  --output_dir="./pixel-art-lora"
```

---

# 七、资源管理

### 存储

**本地存储**:

```
.cache/assets/
├ library/
│  └ kenney/
├ generated/
│  └ dall-e-3/
└ optimized/
```

**云存储 (S3/R2)**:

```typescript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({ region: 'us-east-1' });

await s3.send(new PutObjectCommand({
  Bucket: 'loom-assets',
  Key: `assets/${assetId}.png`,
  Body: imageBuffer,
  ContentType: 'image/png'
}));
```

### CDN 分发

```typescript
// CloudFlare CDN
const cdnUrl = `https://cdn.loom.dev/assets/${assetId}.png`;
```

### 版本管理

```typescript
interface AssetVersion {
  id: string;
  version: string;
  hash: string;
  timestamp: Date;
  metadata: AssetMetadata;
}
```

---

# 八、缓存策略

### 缓存层级

```
Request
↓
L1: Memory Cache (TTL: 5min)
↓ (miss)
L2: Disk Cache (TTL: 1hour)
↓ (miss)
L3: CDN Cache (TTL: 24hours)
↓ (miss)
Generate or Fetch
```

### 缓存 Key

```typescript
function generateCacheKey(requirement: AssetRequirement): string {
  const hash = createHash('sha256');
  hash.update(JSON.stringify({
    type: requirement.type,
    style: requirement.style,
    theme: requirement.theme,
    tags: requirement.tags?.sort(),
    constraints: requirement.constraints
  }));
  return hash.digest('hex');
}
```

### 缓存失效

```typescript
// LRU 缓存
const cache = new LRUCache<string, Buffer>({
  max: 1000, // 最多 1000 个资源
  maxSize: 500 * 1024 * 1024, // 500MB
  sizeCalculation: (value) => value.length,
  ttl: 1000 * 60 * 60 // 1 小时
});
```

---

# 九、元数据管理

### AssetMetadata

```typescript
interface AssetMetadata {
  id: string;
  type: AssetType;
  source: 'library' | 'ai-generated';
  format: string;
  size: {
    width: number;
    height: number;
  };
  fileSize: number; // bytes
  hash: string;
  attribution?: string;
  license?: string;
  generatedBy?: string;
  prompt?: string;
  createdAt: Date;
}
```

### 搜索和索引

```typescript
class AssetIndex {
  private index: Map<string, AssetMetadata[]> = new Map();

  // 按标签索引
  indexByTags(metadata: AssetMetadata) {
    for (const tag of metadata.tags || []) {
      if (!this.index.has(tag)) {
        this.index.set(tag, []);
      }
      this.index.get(tag)!.push(metadata);
    }
  }

  // 搜索
  search(query: AssetRequirement): AssetMetadata[] {
    // 实现搜索逻辑
  }
}
```

---

# 十、诊断和监控

### AssetDiagnostics

```typescript
interface AssetDiagnostics {
  totalRequested: number;
  fromCache: number;
  fromLibrary: number;
  aiGenerated: number;
  failed: number;
  warnings: string[];
  errors: string[];
}
```

### 性能指标

```typescript
interface AssetMetrics {
  resolutionTime: number; // ms
  cacheHitRate: number; // percentage
  averageFileSize: number; // bytes
  aiGenerationTime: number; // ms
}
```

---

# 十一、实现优先级

### MVP 阶段（必须）

- [x] 基础资源解析
- [x] Kenney 资源库集成
- [x] 简单的匹配算法
- [x] 文件系统缓存
- [x] 基础优化（resize, compress）

### 后续阶段

- [ ] AI 生成集成
- [ ] 高级匹配算法
- [ ] 多资源库支持
- [ ] CDN 分发
- [ ] 风格一致性保证
- [ ] 资源版本管理

---

# 十二、配置示例

```typescript
const assetResolutionConfig = {
  libraries: [
    {
      name: 'Kenney Assets',
      enabled: true,
      priority: 1
    }
  ],

  aiGeneration: {
    enabled: true,
    provider: 'openai', // or 'stability'
    fallback: true,
    maxGenerations: 10 // 每次最多生成 10 个资源
  },

  cache: {
    enabled: true,
    ttl: 3600,
    maxSize: 500 * 1024 * 1024 // 500MB
  },

  optimization: {
    images: {
      format: 'png',
      quality: 85,
      maxWidth: 2048,
      maxHeight: 2048
    },
    audio: {
      format: 'mp3',
      bitrate: '128k'
    }
  }
};
```

---

# 十三、设计总结

Asset Resolution System v1.0 提供：

- 智能资源匹配能力
- 多资源库集成能力
- AI 生成补充能力
- 资源优化能力
- 缓存管理能力
- 风格一致性保证
- 完整的元数据管理
- 诊断和监控能力

是实现 AI 自动生成小游戏"视觉呈现能力"的关键支持系统。
