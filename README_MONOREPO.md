# Loom Monorepo

This is the monorepo for the Loom AI Game Generation Platform.

## Packages

### Core Packages

- **@loom/core** - Core types and interfaces for the Loom platform

### Agent Packages

- **@loom/intent-parser** - Natural language to GameSpec parser
- **@loom/planner** - GameSpec to execution graphs planner
- **@loom/code-generator** - Graph to code generator
- **@loom/runtime-adapter** - Engine-agnostic runtime adapters
- **@loom/asset-resolver** - Asset resolution and management
- **@loom/orchestrator** - Build orchestration and scheduling

### Applications

- **web** - Frontend web application
- **api** - Backend API server

## Development

### Prerequisites

- Node.js 18+
- pnpm 8+

### Setup

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Run linter
pnpm lint

# Type check
pnpm typecheck
```

### Development Workflow

```bash
# Run development servers
pnpm dev

# Clean build artifacts
pnpm clean
```

## Architecture

```
packages/
├── core/              # Core types (GameSpec, Graphs, Components, Adapters)
├── intent-parser/     # Natural language → GameSpec
├── planner/           # GameSpec → SceneGraph + EntityGraph + ComponentGraph
├── code-generator/    # Graphs → Phaser code
├── runtime-adapter/   # Component → Engine API mappings
├── asset-resolver/    # Asset library + AI generation
└── orchestrator/      # Build pipeline orchestration

apps/
├── web/               # Next.js frontend
└── api/               # Fastify backend
```

## Documentation

- [Development Roadmap](../DEVELOPMENT_ROADMAP.md)
- [Tasks](../TASKS.md)
- [Architecture Guide](../CLAUDE.md)
- [Spec Review Report](../docs/spec_review_report.md)

## License

TBD
