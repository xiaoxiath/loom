# @loom/code-generator

Code Generator for Loom game generation platform.

## Overview

This package generates Phaser.js game code from execution graphs (SceneGraph, EntityGraph, ComponentGraph, SystemGraph).

## Installation

```bash
pnpm install @loom/code-generator
```

## Usage

### Basic Usage

```typescript
import { codeGenerator } from '@loom/code-generator';
import { planner } from '@loom/planner';
import flappyBird from '../../examples/01-flappy-bird.json';

// Generate graphs from GameSpec
const planResult = planner.plan(flappyBird);

// Generate code from graphs
const output = codeGenerator.generate({
  gameSpec: flappyBird,
  sceneGraph: planResult.sceneGraph,
  entityGraph: planResult.entityGraph,
  componentGraph: planResult.componentGraph,
  systemGraph: planResult.systemGraph,
  adapterBindings: [],
});

// Write generated files to disk
for (const file of output.files) {
  fs.writeFileSync(path.join(outputDir, file.path), file.content);
}
```

## Generated Project Structure

```
output/
├ package.json
├ index.html
├ tsconfig.json
├ vite.config.ts
└ src/
   ├ main.ts
   ├ config.ts
   └ scenes/
      └ MainScene.ts
```

## API

### CodeGenerator

```typescript
class CodeGenerator {
  generate(input: CodeGeneratorInput, options?: Partial<CodeGeneratorOptions>): CodeGeneratorOutput;
}
```

### Input Types

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

### Output Types

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
  type: 'scene' | 'entity' | 'system' | 'config' | 'asset' | 'html' | 'package';
}
```

## Generation Strategy

The code generator uses **Template + Patch** strategy:

1. **Base Templates**: Pre-defined Phaser project structure
2. **Dynamic Patches**: Insert code based on graphs
3. **Composition**: Assemble files into complete project

This ensures:
- ✅ Stable code generation
- ✅ Readable output
- ✅ Debuggable results
- ✅ Consistent quality

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
