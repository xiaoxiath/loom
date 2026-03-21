# @loom/runtime-adapter

Runtime Adapter Layer for Loom game generation platform.

## Overview

This package provides runtime adapters that map platform-agnostic game components to specific game engine APIs. Currently targeting Phaser.js with support for future engines (Godot, Unity, Three.js).

## Installation

```bash
pnpm install @loom/runtime-adapter
```

## Usage

### Basic Usage

```typescript
import { AdapterRegistryImpl, jumpAdapter, gravityAdapter } from '@loom/runtime-adapter';

// Create registry
const registry = new AdapterRegistryImpl();

// Register adapters
registry.register('jump', 'phaser', jumpAdapter);
registry.register('gravity', 'phaser', gravityAdapter);

// Resolve adapter
const adapter = registry.resolve('jump', 'phaser');
```

### Available Adapters

#### Movement
- **jumpAdapter** - Jump behavior with multi-jump support
- **gravityAdapter** - Gravity physics

#### Physics
- **collisionAdapter** - Collision detection

#### Input
- **keyboardInputAdapter** - Keyboard input handling

#### Lifecycle
- **healthAdapter** - Health and damage system
- **destroyOnCollisionAdapter** - Destroy on collision behavior

## Adapter Structure

Each adapter implements the `RuntimeAdapter` interface:

```typescript
interface RuntimeAdapter<TConfig, TEngine> {
  componentType: string;
  engine: string;
  version: string;
  onCreate?: (entity, config, engine) => void;
  onStart?: (entity, config, engine) => void;
  onUpdate?: (entity, config, engine, deltaTime) => void;
  onCollision?: (entity, other, config, engine) => void;
  onDestroy?: (entity, config, engine) => void;
  dependencies: string[];
}
```

## Adapter Registry

The `AdapterRegistryImpl` class manages adapter registration and resolution:

```typescript
class AdapterRegistryImpl {
  register(componentType, engine, adapter): void
  resolve(componentType, engine): RuntimeAdapter | undefined
  has(componentType, engine): boolean
  getAllForEngine(engine): RuntimeAdapter[]
  getComponentTypes(engine): string[]
  validateDependencies(engine): { valid: boolean; missing: string[] }
  clear(): void
}
```

## Testing

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch
```

## Build

```bash
# Build the package
pnpm build

# Build in watch mode
pnpm dev
```

## License

MIT
