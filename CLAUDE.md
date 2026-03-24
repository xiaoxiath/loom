# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **Loom** AI Game Platform - a monorepo containing both design specifications and working implementation code for a system that generates playable small games from natural language descriptions.

**Core Goal**: Natural Language -> Playable Game

The platform enables users to describe games in plain language (e.g., "Create a Flappy Bird-style game with space theme") and automatically generates runnable Phaser.js games with source code, assets, editing capabilities, and sharing features.

**Current State**: The project has ~7,600+ lines of TypeScript code across 12 packages, with core pipeline stages (Planner, Runtime Adapter, Code Generator, Intent Parser, Orchestrator) implemented and passing 72+ tests. A Next.js web frontend exists in `apps/web`.

## Repository Structure

```
loom/
├── packages/
│   ├── core/              # Core TypeScript types (GameSpec, Graphs, Components, Adapters)
│   ├── schemas/           # JSON Schema definitions and validation
│   ├── planner/           # GameSpec -> Execution Graphs (SceneGraph, EntityGraph, etc.)
│   ├── runtime-adapter/   # Maps components to Phaser.js APIs (6 adapters)
│   ├── code-generator/    # Generates Phaser.js game code (template + patch)
│   ├── orchestrator/      # End-to-end pipeline orchestration
│   ├── llm-client/        # Unified LLM client (OpenAI, Claude)
│   ├── intent-parser/     # Natural language -> GameSpec (with repair engine)
│   ├── code-review/       # AI-powered code review agent
│   ├── asset-resolver/    # Asset resolution with placeholder SVGs
│   ├── harness/           # E2E evaluation framework and golden tests
│   └── (no runtime-orchestrator package yet)
├── apps/
│   └── web/               # Next.js web frontend
├── schemas/               # Shared JSON Schema files
├── examples/              # Example GameSpec JSON files (3 examples)
├── docs/                  # Design specification documents (11 specs)
└── assets/                # Static assets
```

**Note**: There is no `apps/api` directory or Fastify backend yet. The backend is planned for a future phase.

## Architecture Overview

The system uses a multi-stage pipeline architecture with AI agents:

```
Natural Language
  |
Intent Parser Agent -> GameSpec DSL
  |
Planner Agent -> SceneGraph + EntityGraph + ComponentGraph + SystemGraph
  |
Runtime Adapter Layer -> Phaser API Bindings
  |
Code Generator -> Phaser.js Game Code
  |
Playable Game
```

### Core Packages

**1. @loom/core** - Core type definitions
- `gamespec.ts` - GameSpec DSL types (GameMeta, Entity, SceneConfig, etc.)
- `graphs.ts` - Execution graph types (SceneGraph, EntityGraph, ComponentGraph, SystemGraph)
- `components.ts` - 18 component interfaces + ComponentRegistry + ComponentEvents
- `adapters.ts` - RuntimeAdapter, AdapterRegistry, AdapterBinding types

**2. @loom/planner** - Compiles GameSpec to execution graphs
- 5-stage planning pipeline with auto-completion and dependency resolution
- Generates SceneGraph, EntityGraph, ComponentGraph, SystemGraph
- 11 passing tests

**3. @loom/runtime-adapter** - Maps components to Phaser.js APIs
- 6 adapters: Jump, Gravity, Collision, KeyboardInput, Health, DestroyOnCollision
- AdapterRegistry with engine-specific resolution

**4. @loom/code-generator** - Generates Phaser.js code
- 8-stage generation pipeline
- Template + Patch strategy for stable output

**5. @loom/intent-parser** - Natural language to GameSpec
- LLM-based parsing with JSON Schema constrained decoding
- Repair engine for validation and auto-fix
- 41 passing tests

**6. @loom/orchestrator** - End-to-end pipeline
- Orchestrates all stages from input to generated game
- Configurable stages (LLM, asset resolution, code review)

**7. @loom/llm-client** - Unified LLM interface
- Supports OpenAI and Claude providers
- Factory pattern with env-based configuration
- 12 passing tests

**8. @loom/harness** - Evaluation framework
- 4-dimension code quality scoring
- Golden test suite with 3 example games
- Baseline comparison and regression detection

## Key Concepts

### GameSpec DSL Structure
```json
{
  "meta": { "title": "...", "genre": "runner", "camera": "side", "dimension": "2D", "version": "1.0" },
  "settings": { "gravity": 980, "backgroundColor": "#87CEEB", "worldWidth": 800, "worldHeight": 600 },
  "scene": { "type": "single", "cameraFollow": "player", "spawn": { "x": 100, "y": 300 } },
  "entities": [{ "id": "player", "type": "player", "sprite": "bird", "components": ["jump", "gravity"] }],
  "systems": ["physics", "collision", "input"],
  "mechanics": ["jump", "avoid"],
  "scoring": { "type": "distance", "increment": 1 },
  "ui": { "hud": ["score"], "startScreen": true, "gameOverScreen": true },
  "assets": [{ "id": "bird", "type": "sprite", "source": "kenney" }],
  "extensions": {}
}
```

### Execution Flow
1. **Prompt Intake** - Normalize user input
2. **Intent Parsing** - Generate GameSpec with JSON Schema constraints
3. **Spec Validation** - Validate against schema and semantic rules
4. **Planning** - Build execution graphs from GameSpec
5. **Component Resolution** - Resolve component dependencies
6. **Adapter Binding** - Map components to Phaser APIs
7. **Code Generation** - Generate Phaser scene code via template patching
8. **Asset Resolution** - Load from cache, asset library, or use placeholders
9. **Preview Runtime** - Boot Phaser runtime and display playable game

## Common Development Commands

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run all tests
pnpm test

# Run specific package tests
pnpm --filter @loom/planner test
pnpm --filter @loom/intent-parser test

# Type checking
pnpm typecheck

# Run E2E golden tests
pnpm --filter @loom/harness eval

# Start web dev server
cd apps/web && pnpm dev
```

## Design Principles

1. **Structure-First Generation**: Use constrained decoding (JSON Schema) instead of free-form code generation
2. **Intermediate Representation**: GameSpec DSL is the stable contract between parsing and code generation
3. **Template + Patch**: Generate code by patching existing templates, not generating from scratch
4. **Incremental Updates**: Graph-based structure enables partial rebuilds
5. **Component Composition**: Build complex behaviors from composable, parameterized components
6. **Engine Agnostic**: Component system designed to support multiple engines (currently Phaser.js)

## Technology Stack

**Frontend**: Next.js, React, Tailwind CSS
**Game Engine**: Phaser.js 3
**Language**: TypeScript (strict mode)
**Monorepo**: pnpm workspaces + Turborepo
**Testing**: Vitest
**AI/LLM**: OpenAI GPT-4o, Claude 3.5 Sonnet

## When Working with This Repository

- This is a **working implementation** with 12 packages and 72+ passing tests
- All design specs are in `docs/` - they guide the implementation
- The GameSpec DSL (defined in `@loom/core`) is the core contract all components must understand
- JSON Schema files in `schemas/` define the formal validation rules
- Examples in `examples/` and `packages/harness/data/golden-specs/` are validated test fixtures
- No backend API exists yet - the pipeline runs in-process or via the web frontend
- Component-based architecture enables composability and extensibility
