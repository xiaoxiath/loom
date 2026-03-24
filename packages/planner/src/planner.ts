/**
 * Planner Agent v1.0
 *
 * Compiles GameSpec DSL into execution graphs:
 * - SceneGraph
 * - EntityGraph
 * - ComponentGraph
 * - SystemGraph
 */

import type {
  GameSpec,
  SceneGraph,
  SceneNode,
  EntityGraph,
  EntityNode,
  EntityEdge,
  ComponentGraph,
  SystemGraph,
  SystemNode,
  SystemDependency,
  PlanResult,
  PlanDiagnostics,
  CameraConfig,
} from '@loom/core';
import type { LLMClient } from '@loom/llm-client';

export interface PlannerConfig {
  /** LLM client for enhanced planning */
  llmClient?: LLMClient;
}

/**
 * Planner Agent
 *
 * Transforms declarative GameSpec into executable graph structures.
 */
export class PlannerAgent {
  private llmClient?: LLMClient;

  constructor(config: PlannerConfig = {}) {
    if (config.llmClient !== undefined) {
      this.llmClient = config.llmClient;
    }
  }

  /**
   * Main planning method (supports LLM enhancement)
   *
   * @param gameSpec - Input game specification
   * @returns PlanResult with all graphs and diagnostics
   */
  async plan(gameSpec: GameSpec): Promise<PlanResult> {
    // FIX (shared mutable state): diagnostics is now a local variable instead
    // of an instance field, so concurrent calls to plan() cannot clobber each
    // other's diagnostic data.
    const diagnostics: PlanDiagnostics = {
      warnings: [],
      autoFixes: [],
      inferredNodes: [],
    };

    // Stage 0 (NEW): LLM preprocessing — enrich spec with inferred components
    let enrichedSpec = gameSpec;
    if (this.llmClient) {
      try {
        enrichedSpec = await this.enrichSpecWithLLM(gameSpec, diagnostics);
      } catch (error) {
        // LLM failure doesn't block, fallback to pure rules
        diagnostics.warnings.push(
          `LLM enrichment failed: ${error}. Using rule-based planning only.`
        );
      }
    }

    // Stage 1: Validate
    this.validateSpec(enrichedSpec, diagnostics);

    // Stage 2: Complete structure
    const completedSpec = this.completeStructure(enrichedSpec, diagnostics);

    // Stage 3: Build graphs
    const sceneGraph = this.buildSceneGraph(completedSpec);
    const entityGraph = this.buildEntityGraph(completedSpec);
    const componentGraph = this.buildComponentGraph(completedSpec, diagnostics);
    const systemGraph = this.buildSystemGraph(completedSpec);

    // Stage 4: Resolve dependencies
    this.resolveDependencies(systemGraph, diagnostics);

    // Stage 5: Optimize
    this.optimize(sceneGraph, entityGraph, componentGraph, systemGraph);

    return {
      sceneGraph,
      entityGraph,
      componentGraph,
      systemGraph,
      diagnostics,
    };
  }

  /**
   * Stage 1: Validate GameSpec
   */
  private validateSpec(spec: GameSpec, diagnostics: PlanDiagnostics): void {
    // Check required entities
    const hasPlayer = spec.entities.some((e) => e.type === 'player');
    if (!hasPlayer) {
      throw new Error('GameSpec must have at least one player entity');
    }

    // Check for duplicate entity IDs
    const ids = spec.entities.map((e) => e.id);
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
    if (duplicates.length > 0) {
      throw new Error(`Duplicate entity IDs found: ${duplicates.join(', ')}`);
    }

    // Validate mechanics
    if (spec.mechanics.length === 0) {
      diagnostics.warnings.push('No mechanics defined');
    }
  }

  /**
   * Stage 2: Complete missing structure
   */
  private completeStructure(spec: GameSpec, diagnostics: PlanDiagnostics): GameSpec {
    const completed = structuredClone(spec) as GameSpec;

    // Auto-complete player position
    const player = completed.entities.find((e) => e.type === 'player');
    if (player && !player.position) {
      player.position = { x: 100, y: 300 };
      diagnostics.autoFixes.push('Added default position to player');
    }

    // Auto-complete physics for player
    if (player && !player.physics) {
      player.physics = {
        gravity: completed.settings.gravity !== undefined && completed.settings.gravity > 0,
        collidable: true,
      };
      diagnostics.autoFixes.push('Added default physics to player');
    }

    // Auto-complete scene spawn
    if (!completed.scene.spawn) {
      completed.scene.spawn = player?.position || { x: 100, y: 300 };
      diagnostics.autoFixes.push('Added default spawn position');
    }

    // Auto-complete camera follow
    if (!completed.scene.cameraFollow && player) {
      completed.scene.cameraFollow = player.id;
      diagnostics.autoFixes.push(`Camera will follow ${player.id}`);
    }

    // Auto-complete components based on mechanics
    this.autoCompleteComponents(completed, diagnostics);

    return completed;
  }

  /**
   * Auto-complete components based on mechanics
   */
  private autoCompleteComponents(spec: GameSpec, diagnostics: PlanDiagnostics): void {
    const player = spec.entities.find((e) => e.type === 'player');
    if (!player) return;

    // Jump mechanics → add jump component
    if (spec.mechanics.includes('jump') && !player.components.includes('jump')) {
      player.components.push('jump');
      diagnostics.inferredNodes.push('Added jump component to player');
    }

    // Gravity → ensure gravity component
    if (spec.settings.gravity && spec.settings.gravity > 0) {
      if (!player.components.includes('gravity')) {
        player.components.push('gravity');
        diagnostics.inferredNodes.push('Added gravity component to player');
      }
    }

    // Shoot mechanics → add shoot component
    if (spec.mechanics.includes('shoot') && !player.components.includes('shoot')) {
      player.components.push('shoot');
      diagnostics.inferredNodes.push('Added shoot component to player');
    }

    // Collect mechanics → add collect component
    if (spec.mechanics.includes('collect') && !player.components.includes('collect')) {
      player.components.push('collect');
      diagnostics.inferredNodes.push('Added collect component to player');
    }

    // Collision with enemies → add health component
    const hasEnemies = spec.entities.some((e) => e.type === 'enemy');
    if (hasEnemies && !player.components.includes('health')) {
      player.components.push('health');
      diagnostics.inferredNodes.push('Added health component to player');
    }

    // Movement → add input component
    if (
      spec.mechanics.includes('jump') ||
      spec.mechanics.includes('shoot') ||
      spec.mechanics.includes('dash')
    ) {
      if (!player.components.includes('keyboardInput')) {
        player.components.push('keyboardInput');
        diagnostics.inferredNodes.push('Added keyboardInput component to player');
      }
    }
  }

  /**
   * Stage 3a: Build SceneGraph
   */
  private buildSceneGraph(spec: GameSpec): SceneGraph {
    // Create main scene node
    const mainScene: SceneNode = {
      id: 'main',
      type: 'main',
      entities: spec.entities.map((e) => e.id),
    };

    // Build camera config
    const camera: CameraConfig = {
      follow: spec.scene.cameraFollow || 'player',
    };

    // Build world bounds
    const worldBounds = {
      width: spec.settings.worldWidth || 800,
      height: spec.settings.worldHeight || 600,
    };

    return {
      scenes: [mainScene],
      camera,
      worldBounds,
    };
  }

  /**
   * Stage 3b: Build EntityGraph
   */
  private buildEntityGraph(spec: GameSpec): EntityGraph {
    const nodes: EntityNode[] = [];
    const edges: EntityEdge[] = [];

    // Create entity nodes
    for (const entity of spec.entities) {
      const node: EntityNode = {
        id: entity.id,
        type: entity.type,
        position: entity.position || { x: 0, y: 0 },
        children: [],
      };

      // Find parent relationships
      if (entity.type === 'projectile') {
        // Projectiles might have a parent (shooter)
        const parent = spec.entities.find(
          (e) =>
            e.components.includes('shoot') &&
            e.id !== entity.id &&
            entity.id.startsWith(e.id)
        );
        if (parent) {
          node.parentId = parent.id;
        }
      }

      nodes.push(node);
    }

    // Q-02 FIX: Back-fill children arrays from parentId relationships
    for (const node of nodes) {
      if (node.parentId) {
        const parentNode = nodes.find((n) => n.id === node.parentId);
        if (parentNode && !parentNode.children.includes(node.id)) {
          parentNode.children.push(node.id);
        }
      }
    }

    // Create edges
    for (const entity of spec.entities) {
      // Spawn relationships
      if (entity.components.includes('spawn')) {
        const spawnableTypes = new Set(['projectile', 'enemy', 'pickup']);

        // Strategy 1: shoot component entities → spawn all projectiles
        if (entity.components.includes('shoot')) {
          const projectiles = spec.entities.filter(
            e => e.type === 'projectile' && e.id !== entity.id
          );
          for (const target of projectiles) {
            edges.push({ from: entity.id, to: target.id, type: 'spawns' });
          }
        }

        // Strategy 2: spawner type entities → spawn all spawnableTypes
        if (entity.type === 'spawner') {
          const targets = spec.entities.filter(
            e => spawnableTypes.has(e.type) && e.id !== entity.id
          );
          for (const target of targets) {
            edges.push({ from: entity.id, to: target.id, type: 'spawns' });
          }
        }

        // Strategy 3: Fallback — prefix matching (includes → startsWith)
        const prefixTargets = spec.entities.filter(
          (e) =>
            e.id.startsWith(entity.id + '_') &&
            spawnableTypes.has(e.type)
        );
        for (const target of prefixTargets) {
          // Avoid duplicate edges
          const exists = edges.some(
            e => e.from === entity.id && e.to === target.id && e.type === 'spawns'
          );
          if (!exists) {
            edges.push({ from: entity.id, to: target.id, type: 'spawns' });
          }
        }
      }

      // Follow relationships (camera)
      if (entity.type === 'player' && spec.scene.cameraFollow === entity.id) {
        // Camera follows player (implicit, no edge needed)
      }

      // Collision relationships
      if (entity.physics?.collidable) {
        const collisionTargets = spec.entities.filter(
          (e) => e.id !== entity.id && e.physics?.collidable
        );

        for (const target of collisionTargets) {
          // Avoid duplicate edges
          const exists = edges.some(
            (e) =>
              ((e.from === entity.id && e.to === target.id) ||
                (e.from === target.id && e.to === entity.id)) &&
              e.type === 'collides'
          );

          if (!exists) {
            edges.push({
              from: entity.id,
              to: target.id,
              type: 'collides',
            });
          }
        }
      }
    }

    return { nodes, edges };
  }

  /**
   * Stage 3c: Build ComponentGraph
   */
  private buildComponentGraph(spec: GameSpec, diagnostics: PlanDiagnostics): ComponentGraph {
    const entityComponents: Record<string, string[]> = {};

    for (const entity of spec.entities) {
      // Ensure unique components
      const components = [...new Set(entity.components)];

      // Resolve component dependencies
      const resolvedComponents = this.resolveComponentDependencies(components, diagnostics);

      entityComponents[entity.id] = resolvedComponents;
    }

    return { entityComponents };
  }

  /**
   * Resolve component dependencies
   */
  private resolveComponentDependencies(components: string[], diagnostics: PlanDiagnostics): string[] {
    const resolved = [...components];
    const added = new Set(components);

    // Dependency rules
    const dependencyRules: Record<string, string[]> = {
      jump: ['gravity'],
      shoot: ['keyboardInput'],
      collect: ['collision'],
      patrol: ['run'],
      followTarget: ['run'],
    };

    // Add dependencies
    for (const component of components) {
      const deps = dependencyRules[component];
      if (deps) {
        for (const dep of deps) {
          if (!added.has(dep)) {
            resolved.push(dep);
            added.add(dep);
            diagnostics.inferredNodes.push(
              `Added dependency '${dep}' for component '${component}'`
            );
          }
        }
      }
    }

    return resolved;
  }

  /**
   * Stage 3d: Build SystemGraph
   */
  private buildSystemGraph(spec: GameSpec): SystemGraph {
    const systems: SystemNode[] = [];
    const dependencies: SystemDependency[] = [];
    const addedTypes = new Set<string>();

    // Helper to add a system only once
    const addSystem = (type: string, enabled: boolean) => {
      if (!addedTypes.has(type)) {
        systems.push({ type, enabled });
        addedTypes.add(type);
      }
    };

    // FIX (GameSpec.systems ignored): Read explicitly declared systems first
    for (const sys of spec.systems) {
      addSystem(sys, true);
    }

    // Always include physics if gravity is set
    if (spec.settings.gravity && spec.settings.gravity > 0) {
      addSystem('physics', true);
    }

    // Include collision if any entity is collidable
    const hasCollidable = spec.entities.some((e) => e.physics?.collidable);
    if (hasCollidable) {
      addSystem('collision', true);
      dependencies.push({
        system: 'collision',
        requires: ['physics'],
      });
    }

    // Include input if any entity uses input
    const hasInput = spec.entities.some((e) =>
      e.components.some((c) => c.includes('Input'))
    );
    if (hasInput) {
      addSystem('input', true);
    }

    // Include spawn if any entity spawns others
    const hasSpawn = spec.entities.some((e) => e.components.includes('spawn'));
    if (hasSpawn) {
      addSystem('spawn', true);
    }

    // Include camera (always)
    addSystem('camera', true);

    // Q-01 FIX: scoring is a required field in GameSpec so `if (spec.scoring)`
    // is always true. Check for a meaningful scoring type instead.
    if (spec.scoring?.type) {
      addSystem('scoring', true);
    }

    // Include AI if there are enemies
    const hasEnemies = spec.entities.some((e) => e.type === 'enemy');
    if (hasEnemies) {
      addSystem('ai', true);
    }

    // Include animation (optional, always enabled)
    addSystem('animation', true);

    // Include sound (optional)
    if (spec.assets.some((a) => a.type === 'sound' || a.type === 'music')) {
      addSystem('sound', true);
    }

    return { systems, dependencies };
  }

  /**
   * Stage 4: Resolve dependencies
   *
   * Q-04 FIX: Removed unused _componentGraph parameter.
   */
  private resolveDependencies(
    systemGraph: SystemGraph,
    diagnostics: PlanDiagnostics
  ): void {
    // Ensure all required systems are present
    for (const dep of systemGraph.dependencies) {
      const system = systemGraph.systems.find((s) => s.type === dep.system);
      if (!system) {
        systemGraph.systems.push({ type: dep.system, enabled: true });
        diagnostics.autoFixes.push(`Added missing system: ${dep.system}`);
      }

      // Check if required systems exist
      for (const required of dep.requires) {
        const requiredSystem = systemGraph.systems.find((s) => s.type === required);
        if (!requiredSystem) {
          systemGraph.systems.push({ type: required, enabled: true });
          diagnostics.autoFixes.push(`Added missing system: ${required}`);
        }
      }
    }
  }

  /**
   * Stage 5: Optimize graphs
   */
  private optimize(
    _sceneGraph: SceneGraph,
    _entityGraph: EntityGraph,
    componentGraph: ComponentGraph,
    systemGraph: SystemGraph
  ): void {
    // Remove duplicate systems
    const uniqueSystems: SystemNode[] = [];
    const seen = new Set<string>();

    for (const system of systemGraph.systems) {
      if (!seen.has(system.type)) {
        uniqueSystems.push(system);
        seen.add(system.type);
      }
    }

    systemGraph.systems = uniqueSystems;

    // Remove duplicate components
    for (const entityId in componentGraph.entityComponents) {
      componentGraph.entityComponents[entityId] = [
        ...new Set(componentGraph.entityComponents[entityId]),
      ];
    }

    // Q-03 FIX: Sort systems using topological order based on dependency
    // relationships. Systems that are required by others come first.
    // Build a map of system type → set of systems it depends on
    const depMap = new Map<string, Set<string>>();
    for (const sys of systemGraph.systems) {
      depMap.set(sys.type, new Set<string>());
    }
    for (const dep of systemGraph.dependencies) {
      const existing = depMap.get(dep.system);
      if (existing) {
        for (const req of dep.requires) {
          existing.add(req);
        }
      }
    }

    // Kahn's algorithm for topological sort
    const inDegree = new Map<string, number>();
    for (const sys of systemGraph.systems) {
      inDegree.set(sys.type, 0);
    }
    for (const [, deps] of depMap) {
      for (const dep of deps) {
        if (inDegree.has(dep)) {
          // dep is required by someone, but dep itself has no extra in-degree from this
        }
      }
    }
    // Actually compute in-degree: if A depends on B, then A has in-degree += 1
    for (const [sysType, deps] of depMap) {
      inDegree.set(sysType, deps.size);
    }

    const queue: string[] = [];
    for (const [sysType, deg] of inDegree) {
      if (deg === 0) {
        queue.push(sysType);
      }
    }

    const sorted: string[] = [];
    while (queue.length > 0) {
      const current = queue.shift()!;
      sorted.push(current);

      // For each system that depends on current, reduce its in-degree
      for (const [sysType, deps] of depMap) {
        if (deps.has(current)) {
          const newDeg = (inDegree.get(sysType) ?? 0) - 1;
          inDegree.set(sysType, newDeg);
          if (newDeg === 0) {
            queue.push(sysType);
          }
        }
      }
    }

    // Append any remaining systems (cycle or missing from dependency graph)
    for (const sys of systemGraph.systems) {
      if (!sorted.includes(sys.type)) {
        sorted.push(sys.type);
      }
    }

    // Reorder systemGraph.systems according to sorted order
    const systemMap = new Map(systemGraph.systems.map((s) => [s.type, s]));
    systemGraph.systems = sorted
      .filter((t) => systemMap.has(t))
      .map((t) => systemMap.get(t)!);
  }

  /**
   * LLM preprocessing: Enrich GameSpec with inferred components and systems
   *
   * Design principles:
   * 1. LLM only "completes", doesn't modify existing config
   * 2. Output is incremental diff, not complete spec
   * 3. Rule engine still does final validation
   */
  private async enrichSpecWithLLM(spec: GameSpec, diagnostics: PlanDiagnostics): Promise<GameSpec> {
    const prompt = `Analyze this GameSpec and suggest missing components/systems.

## GameSpec
${JSON.stringify(spec, null, 2)}

## Task
Based on the game genre "${spec.meta.genre}" and mechanics [${spec.mechanics.join(', ')}]:
1. What components should each entity have that are currently missing?
2. What systems should be active that are currently missing?
3. Are there any implicit mechanics not listed?

Respond in JSON:
{
  "entityComponentAdditions": {
    "<entityId>": ["component1", "component2"]
  },
  "systemAdditions": ["system1", "system2"],
  "mechanicAdditions": ["mechanic1"],
  "reasoning": "brief explanation"
}

Only suggest additions. Do NOT remove existing components/systems.`;

    const response = await this.llmClient!.chat(
      [
        {
          role: 'system',
          content:
            'You are a game design expert. Analyze game specifications '
            + 'and identify missing components for complete gameplay.',
        },
        { role: 'user', content: prompt },
      ],
      {
        temperature: 0.3,
        maxTokens: 2000,
        jsonMode: { enabled: true },
      }
    );

    const suggestions = JSON.parse(response.content);

    // Apply incremental completion
    const enriched = structuredClone(spec);

    // Add entity components
    if (suggestions.entityComponentAdditions) {
      for (const [entityId, components] of Object.entries(
        suggestions.entityComponentAdditions as Record<string, string[]>
      )) {
        const entity = enriched.entities.find(e => e.id === entityId);
        if (entity) {
          for (const comp of components) {
            if (!entity.components.includes(comp)) {
              entity.components.push(comp);
              diagnostics.inferredNodes.push(
                `LLM added component '${comp}' to entity '${entityId}'`
              );
            }
          }
        }
      }
    }

    // Add systems
    if (suggestions.systemAdditions) {
      for (const sys of suggestions.systemAdditions as string[]) {
        if (!enriched.systems.includes(sys as any)) {
          enriched.systems.push(sys as any);
          diagnostics.inferredNodes.push(
            `LLM added system '${sys}'`
          );
        }
      }
    }

    // Add mechanics
    if (suggestions.mechanicAdditions) {
      for (const mech of suggestions.mechanicAdditions as string[]) {
        if (!enriched.mechanics.includes(mech as any)) {
          enriched.mechanics.push(mech as any);
          diagnostics.inferredNodes.push(
            `LLM added mechanic '${mech}'`
          );
        }
      }
    }

    return enriched;
  }
}

/**
 * Factory function to create PlannerAgent instance
 */
export function createPlanner(config?: PlannerConfig): PlannerAgent {
  return new PlannerAgent(config);
}
