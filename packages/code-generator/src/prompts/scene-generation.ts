/**
 * Scene generation prompt builder
 *
 * Constructs user prompts for MainScene generation from structured context
 */

import type {
  GameSpec,
  EntityGraph,
  ComponentGraph,
  SystemGraph,
} from '@loom/core';
import type { AdapterBinding } from '@loom/core';
import type { ResolvedAsset } from '@loom/asset-resolver';

export interface SceneGenerationContext {
  gameSpec: GameSpec;
  entityGraph: EntityGraph;
  componentGraph: ComponentGraph;
  systemGraph: SystemGraph;
  adapterBindings?: AdapterBinding[];
  resolvedAssets?: ResolvedAsset[];
}

/**
 * Build MainScene generation user prompt
 *
 * Design principles:
 * 1. Structured JSON input (LLM understands JSON better than natural language)
 * 2. Only pass necessary information to avoid token waste
 * 3. Use section headers to separate different data sources
 */
export function buildSceneGenerationPrompt(ctx: SceneGenerationContext): string {
  const sections: string[] = [];

  // Section 1: Game metadata (concise)
  sections.push(`## Game Metadata
- Title: ${ctx.gameSpec.meta.title}
- Genre: ${ctx.gameSpec.meta.genre}
- Camera: ${ctx.gameSpec.meta.camera}
- Dimension: ${ctx.gameSpec.meta.dimension}`);

  // Section 2: Settings
  sections.push(`## Settings
${JSON.stringify(ctx.gameSpec.settings, null, 2)}`);

  // Section 3: Entities list (complete - LLM needs all entities)
  sections.push(`## Entities (${ctx.gameSpec.entities.length} total)
${JSON.stringify(ctx.gameSpec.entities, null, 2)}`);

  // Section 4: EntityGraph (key relationships)
  const collisionEdges = ctx.entityGraph.edges.filter(e => e.type === 'collides');
  const spawnEdges = ctx.entityGraph.edges.filter(e => e.type === 'spawns');
  sections.push(`## Entity Relationships
### Collision Pairs (${collisionEdges.length})
${JSON.stringify(collisionEdges, null, 2)}

### Spawn Relationships (${spawnEdges.length})
${JSON.stringify(spawnEdges, null, 2)}`);

  // Section 5: ComponentGraph (entity-component bindings)
  sections.push(`## Component Bindings
${JSON.stringify(ctx.componentGraph.entityComponents, null, 2)}`);

  // Section 6: SystemGraph (active systems)
  const activeSystems = ctx.systemGraph.systems
    .filter(s => s.enabled)
    .map(s => s.type);
  sections.push(`## Active Systems: [${activeSystems.join(', ')}]`);

  // Section 7: Asset mapping (if available)
  if (ctx.resolvedAssets && ctx.resolvedAssets.length > 0) {
    const assetMap = ctx.resolvedAssets.map(a => ({
      id: a.id,
      url: a.resolvedUrl,
      type: a.type,
    }));
    sections.push(`## Resolved Assets
${JSON.stringify(assetMap, null, 2)}`);
  }

  // Section 8: Game mechanics
  sections.push(`## Mechanics: [${ctx.gameSpec.mechanics.join(', ')}]`);

  // Section 9: Scoring
  if (ctx.gameSpec.scoring) {
    sections.push(`## Scoring
${JSON.stringify(ctx.gameSpec.scoring, null, 2)}`);
  }

  // Section 10: UI
  if (ctx.gameSpec.ui) {
    sections.push(`## UI Config
${JSON.stringify(ctx.gameSpec.ui, null, 2)}`);
  }

  // Final instruction
  sections.push(`## Task
Generate a complete MainScene.ts file implementing all the above specifications.
The output must be ONLY the TypeScript code, no markdown fences, no explanations.`);

  return sections.join('\n\n');
}
