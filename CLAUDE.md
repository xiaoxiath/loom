# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **Loom** AI Game Platform - a design and specification repository for a system that generates playable small games from natural language descriptions. The repository currently contains design documents and technical specifications; no implementation code exists yet.

**Core Goal**: Natural Language → Playable Game

The platform enables users to describe games in plain language (e.g., "Create a Flappy Bird-style game with space theme") and automatically generates runnable games with source code, assets, editing capabilities, and sharing features.

## Repository Structure

All documentation is in the `docs/` directory:

- `ai_game_platform_prd_tdd.md` - Master PRD and TDD document defining the complete platform vision
- `gamespec_dsl_v_1_spec.md` - GameSpec DSL specification (core protocol layer)
- `gamespec_component_spec_v_1.md` - Component specification (behavior layer)
- `intent_parser_agent_v_1_spec.md` - Intent Parser Agent specification
- `planner_agent_v_1_spec.md` - Planner Agent specification
- `runtime_adapter_layer_v_1_spec.md` - Runtime Adapter layer specification
- `game_builder_runtime_orchestrator_v_1_spec.md` - Runtime Orchestrator specification

## Architecture Overview

The system uses a multi-stage pipeline architecture with AI agents:

```
Natural Language
↓
Intent Parser Agent → GameSpec DSL
↓
Planner Agent → SceneGraph + EntityGraph + ComponentGraph
↓
Component Resolver → Component Bindings
↓
Runtime Adapter Layer → Engine-Specific Code
↓
Code Generator → Phaser.js Game
↓
Playable Game
```

### Core Components

**1. Intent Parser Agent**
- Converts natural language to structured GameSpec DSL
- Uses JSON Schema constrained decoding for stable generation
- Performs semantic validation and repair
- Auto-completes missing fields with sensible defaults
- Outputs confidence scores and diagnostics

**2. GameSpec DSL**
The central data format that serves as:
- Output from Intent Parser
- Input to Planner
- Editable intermediate format
- Version control artifact

Key sections: `meta`, `settings`, `scene`, `entities`, `systems`, `mechanics`, `scoring`, `ui`, `assets`, `extensions`

**3. Planner Agent**
- Compiles GameSpec to execution graphs
- Generates: SceneGraph, EntityGraph, ComponentGraph, SystemGraph
- Applies inference rules to auto-complete structure
- Supports incremental updates (only recompute changed nodes)

**4. Component System**
- Defines entity behaviors as composable, parameterized components
- Categories: Movement, Physics, Combat, Input, Interaction, Lifecycle, AI
- Components declare dependencies (e.g., `jump` requires `gravity`)
- Components support event bindings (onStart, onUpdate, onCollision, onDestroy)

**5. Runtime Adapter Layer**
- Maps platform-agnostic components to specific game engine APIs
- Initially targets Phaser.js, designed to support multiple engines (Godot, Unity, Three.js)
- Handles lifecycle bindings, input mapping, physics, collision, animation, events
- Uses adapter registry pattern for extensibility

**6. Runtime Orchestrator**
- Central execution scheduler managing the entire pipeline
- Handles task scheduling, state management, caching, error recovery
- Supports incremental rebuilds and interactive editing
- Manages session lifecycle and versioning

## Key Concepts

### GameSpec DSL Structure
```json
{
  "meta": { "title", "genre", "camera", "dimension" },
  "settings": { "gravity", "worldBounds", "backgroundColor" },
  "scene": { "type", "cameraFollow", "spawn" },
  "entities": [{ "id", "type", "sprite", "components" }],
  "systems": ["physics", "collision", "input"],
  "mechanics": ["jump", "shoot", "collect"],
  "scoring": { "type", "increment" },
  "ui": { "hud", "startScreen", "gameOverScreen" },
  "assets": [{ "id", "type", "source" }],
  "extensions": {}
}
```

### Component Structure
```json
{
  "type": "jump",
  "enabled": true,
  "config": { "force": 320, "cooldown": 200 },
  "dependencies": ["gravity"],
  "events": { "onStart": [], "onCollision": [] }
}
```

### Execution Flow
1. **Prompt Intake** → Normalize user input
2. **Intent Parsing** → Generate GameSpec with JSON Schema constraints
3. **Spec Validation** → Validate against schema and semantic rules
4. **Planning** → Build execution graphs from GameSpec
5. **Component Resolution** → Resolve component dependencies
6. **Adapter Binding** → Map components to Phaser APIs
7. **Code Generation** → Generate Phaser scene code via template patching
8. **Asset Resolution** → Load from cache, asset library, or AI generate
9. **Preview Runtime** → Boot Phaser runtime and display playable game

## Design Principles

1. **Structure-First Generation**: Use constrained decoding (JSON Schema) instead of free-form code generation to ensure stability
2. **Intermediate Representation**: GameSpec DSL serves as the stable intermediate format between parsing and code generation
3. **Template + Patch**: Generate code by patching existing templates rather than generating from scratch
4. **Incremental Updates**: Support partial rebuilds when users edit games
5. **Component Composition**: Build complex behaviors from composable, parameterized components
6. **Engine Agnostic**: Design component system to potentially support multiple game engines

## Target Technology Stack

**Frontend**: React, Tailwind, Zustand, React Flow
**Backend**: Node.js/Bun, Fastify
**Game Engine**: Phaser.js
**Database**: PostgreSQL (via Supabase)
**Deployment**: Frontend (Vercel), Backend (Fly.io/Railway)

## MVP Scope

First iteration supports:
- Single scene games
- Single player character
- Basic enemies and obstacles
- Simple collision detection
- Basic scoring systems
- Game types: Jumpers, Dodgers, Shooters, Runners

## When Working with This Repository

- This is a **specification repository**, not an implementation
- All documents are written in Chinese with technical terms in English
- The specs define a sophisticated multi-agent system with clear separation of concerns
- Focus is on achieving stable, reliable generation through constrained intermediate formats
- The GameSpec DSL is the core contract that all components must understand
- Component-based architecture enables composability and extensibility
- The system prioritizes stability over flexibility in the MVP phase

## Key Design Challenges Addressed

1. **LLM Generation Stability**: Addressed through JSON Schema constrained decoding and intermediate GameSpec DSL
2. **Code Quality**: Template-based generation with patches, not full code generation
3. **Incremental Editing**: Graph-based structure enables partial rebuilds
4. **Multi-Engine Support**: Runtime Adapter abstraction layer
5. **Behavior Complexity**: Component system with dependencies and composition
