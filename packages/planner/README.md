# @loom/planner

Planner Agent for the Loom game generation platform.

## Overview

The Planner Agent compiles GameSpec DSL into executable graph structures:

- **SceneGraph** - Scene hierarchy and camera configuration
- **EntityGraph** - Entity relationships and hierarchy
- **ComponentGraph** - Component bindings for each entity
- **SystemGraph** - System dependencies and ordering

## Installation

```bash
pnpm add @loom/planner
```

## Usage

### Basic Usage

```typescript
import { planner } from '@loom/planner';
import type { GameSpec } from '@loom/core';

const gameSpec: GameSpec = {
  // ... game spec
};

const result = planner.plan(gameSpec);

console.log(result.sceneGraph);
console.log(result.entityGraph);
console.log(result.componentGraph);
console.log(result.systemGraph);
console.log(result.diagnostics);
```

### Using PlannerAgent Class

```typescript
import { PlannerAgent } from '@loom/planner';

const planner = new PlannerAgent();
const result = planner.plan(gameSpec);
```

## API Reference

### `PlannerAgent`

#### `plan(gameSpec: GameSpec): PlanResult`

Main planning method. Transforms GameSpec into execution graphs.

**Parameters**:
- `gameSpec` - Input game specification

**Returns**:
- `PlanResult` - Contains all graphs and diagnostics

```typescript
interface PlanResult {
  sceneGraph: SceneGraph;
  entityGraph: EntityGraph;
  componentGraph: ComponentGraph;
  systemGraph: SystemGraph;
  diagnostics: PlanDiagnostics;
}
```

## Planning Pipeline

The planner executes 5 stages:

### Stage 1: Validation
- Validates required fields
- Checks for duplicate entity IDs
- Ensures at least one player exists

### Stage 2: Structure Completion
- Auto-completes missing fields
- Adds default positions
- Infers components from mechanics

### Stage 3: Graph Construction
- Builds SceneGraph
- Builds EntityGraph
- Builds ComponentGraph
- Builds SystemGraph

### Stage 4: Dependency Resolution
- Resolves component dependencies
- Ensures required systems exist
- Validates system dependencies

### Stage 5: Optimization
- Removes duplicates
- Sorts systems by dependencies
- Optimizes graph structure

## Auto-Completion Rules

The planner automatically adds:

### Components
- `jump` mechanics → `jump` component
- Gravity enabled → `gravity` component
- `shoot` mechanics → `shoot` + `keyboardInput` components
- `collect` mechanics → `collect` component
- Enemies present → `health` component

### Systems
- Gravity set → `physics` system
- Collidable entities → `collision` system
- Input components → `input` system
- Spawn components → `spawn` system
- Enemies → `ai` system

### Component Dependencies
- `jump` → `gravity`
- `shoot` → `keyboardInput`
- `collect` → `collision`

## Example

```typescript
import { planner } from '@loom/planner';

const spec = {
  meta: {
    title: 'My Game',
    genre: 'runner',
    camera: 'side',
    dimension: '2D',
    version: '1.0'
  },
  settings: { gravity: 980 },
  scene: { type: 'single' },
  entities: [
    {
      id: 'player',
      type: 'player',
      sprite: 'player',
      components: ['jump']
    }
  ],
  systems: [],
  mechanics: ['jump'],
  scoring: { type: 'distance' },
  ui: {},
  assets: [],
  extensions: {}
};

const result = planner.plan(spec);

// SceneGraph
console.log(result.sceneGraph.camera.follow); // 'player'

// EntityGraph
console.log(result.entityGraph.nodes.length); // 1

// ComponentGraph
console.log(result.componentGraph.entityComponents['player']);
// ['jump', 'gravity', 'keyboardInput'] - auto-completed!

// SystemGraph
console.log(result.systemGraph.systems);
// [physics, collision, input, camera]

// Diagnostics
console.log(result.diagnostics.inferredNodes);
// ['Added gravity component', 'Added keyboardInput component']
```

## Development

```bash
# Build
pnpm build

# Test
pnpm test

# Test with watch
pnpm test:watch

# Type check
pnpm typecheck
```

## License

TBD
