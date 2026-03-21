# @loom/core

Core types and interfaces for the Loom game generation platform.

## Overview

This package contains all the fundamental type definitions used throughout the Loom platform:

- **GameSpec DSL**: The central data format for game definitions
- **Graph Types**: Scene, Entity, Component, and System graphs
- **Component Types**: Reusable behavior definitions
- **Adapter Types**: Engine-agnostic runtime interfaces

## Installation

```bash
pnpm add @loom/core
```

## Usage

```typescript
import type { GameSpec, Entity, Component } from '@loom/core';

const gameSpec: GameSpec = {
  meta: {
    title: 'My Game',
    genre: 'runner',
    camera: 'side',
    dimension: '2D',
    version: '1.0.0'
  },
  settings: {
    gravity: 980
  },
  scene: {
    type: 'single',
    cameraFollow: 'player'
  },
  entities: [
    {
      id: 'player',
      type: 'player',
      sprite: 'player_ship',
      components: ['jump', 'gravity']
    }
  ],
  systems: ['physics', 'collision', 'input'],
  mechanics: ['jump'],
  scoring: { type: 'distance' },
  ui: { hud: ['score'] },
  assets: [],
  extensions: {}
};
```

## API Reference

### GameSpec

The main game definition structure.

```typescript
interface GameSpec {
  meta: GameMeta;
  settings: GameSettings;
  scene: SceneConfig;
  entities: Entity[];
  systems: SystemType[];
  mechanics: MechanicType[];
  scoring: ScoringConfig;
  ui: UIConfig;
  assets: Asset[];
  extensions: Extensions;
}
```

### Entity

A game entity (player, enemy, obstacle, etc.).

```typescript
interface Entity {
  id: string;
  type: EntityType;
  sprite: string;
  position?: Position;
  physics?: PhysicsConfig;
  components: string[];
}
```

### Component

A reusable behavior that can be attached to entities.

```typescript
interface Component {
  type: string;
  enabled: boolean;
  config: Record<string, unknown>;
  events?: ComponentEvents;
  dependencies?: string[];
}
```

## Development

```bash
# Build
pnpm build

# Test
pnpm test

# Type check
pnpm typecheck

# Lint
pnpm lint
```

## License

TBD
