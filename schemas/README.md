# @loom/schemas

JSON Schema definitions for the Loom game generation platform.

## Overview

This package contains all JSON Schema definitions used for validation and LLM constrained decoding:

- **GameSpec** (`gamespec.schema.json`) - Core game definition format
- **Component** (`component.schema.json`) - Component specification
- **SceneGraph** (`scene-graph.schema.json`) - Scene structure
- **EntityGraph** (`entity-graph.schema.json`) - Entity relationships
- **ComponentGraph** (`component-graph.schema.json`) - Component bindings
- **SystemGraph** (`system-graph.schema.json`) - System dependencies

## Installation

```bash
pnpm add @loom/schemas
```

## Usage

### Programmatic Validation

```typescript
import { validate } from '@loom/schemas';
import type { GameSpec } from '@loom/core';

const gameSpec: GameSpec = {
  // ... game spec data
};

const valid = validate('https://loom.dev/schemas/gamespec.schema.json', gameSpec);

if (!valid) {
  console.error('Invalid GameSpec');
}
```

### Using with LLM (OpenAI JSON Mode)

```typescript
import Ajv from 'ajv';
import gamespecSchema from '@loom/schemas/gamespec.schema.json';

// Use with OpenAI API
const response = await openai.chat.completions.create({
  model: 'gpt-4-turbo-preview',
  messages: [
    {
      role: 'system',
      content: 'You are a game designer. Generate a GameSpec for a platformer game.'
    },
    {
      role: 'user',
      content: 'Create a Mario-style platformer with jumping and enemies.'
    }
  ],
  response_format: {
    type: 'json_schema',
    json_schema: {
      name: 'gamespec',
      schema: gamespecSchema
    }
  }
});
```

### CLI Validation

```bash
# Validate a GameSpec file
node dist/validate.js gamespec.schema.json ./my-game.json
```

## Schema Files

### gamespec.schema.json

Defines the complete structure of a GameSpec, including:

- **meta**: Game metadata (title, genre, camera, dimension, version)
- **settings**: Runtime settings (gravity, world size, etc.)
- **scene**: Scene configuration
- **entities**: List of game entities
- **systems**: Required game systems
- **mechanics**: Game mechanics
- **scoring**: Scoring configuration
- **ui**: UI configuration
- **assets**: Asset references
- **extensions**: Plugin extensions

### component.schema.json

Defines component structure with conditional validation for specific component types:

- Movement: jump, run, fly, dash
- Physics: gravity, collision, bounce
- Combat: shoot, melee
- Input: keyboard, mouse, touch
- Lifecycle: health, destroy, time-to-live
- AI: patrol, follow
- Interaction: collect

## Development

```bash
# Build
pnpm build

# Type check
pnpm typecheck

# Lint
pnpm lint
```

## Adding New Schemas

1. Create a new `.schema.json` file in this directory
2. Follow JSON Schema Draft 07 specification
3. Add proper `$id` for referencing
4. Register in the `loadSchemas()` function in `validate.ts`
5. Update this README

## Schema Versioning

Schemas follow semantic versioning:

- **Major version**: Breaking changes to structure
- **Minor version**: New optional fields
- **Patch version**: Bug fixes, clarifications

Current version: **v1.0**

## Validation Rules

All schemas enforce:

- Required fields must be present
- Type checking for all properties
- Enum validation for constrained values
- Pattern matching for IDs and special formats
- Unique items in arrays where specified
- Minimum/maximum values for numeric fields

## License

TBD
