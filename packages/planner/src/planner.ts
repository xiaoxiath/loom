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

/**
 * Planner Agent
 *
 * Transforms declarative GameSpec into executable graph structures.
 */
export class PlannerAgent {
  private diagnostics: PlanDiagnostics;

  constructor() {
    this.diagnostics = {
      warnings: [],
      autoFixes: [],
      inferredNodes: [],
    };
  }

  /**
   * Main planning method
   *
   * @param gameSpec - Input game specification
   * @returns PlanResult with all graphs and diagnostics
   */
  plan(gameSpec: GameSpec): PlanResult {
    // Reset diagnostics
    this.diagnostics = {
      warnings: [],
      autoFixes: [],
      inferredNodes: [],
    };

    // Stage 1: Validate
    this.validateSpec(gameSpec);

    // Stage 2: Complete structure
    const completedSpec = this.completeStructure(gameSpec);

    // Stage 3: Build graphs
    const sceneGraph = this.buildSceneGraph(completedSpec);
    const entityGraph = this.buildEntityGraph(completedSpec);
    const componentGraph = this.buildComponentGraph(completedSpec);
    const systemGraph = this.buildSystemGraph(completedSpec);

    // Stage 4: Resolve dependencies
    this.resolveDependencies(componentGraph, systemGraph);

    // Stage 5: Optimize
    this.optimize(sceneGraph, entityGraph, componentGraph, systemGraph);

    return {
      sceneGraph,
      entityGraph,
      componentGraph,
      systemGraph,
      diagnostics: this.diagnostics,
    };
  }

  /**
   * Stage 1: Validate GameSpec
   */
  private validateSpec(spec: GameSpec): void {
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
      this.diagnostics.warnings.push('No mechanics defined');
    }
  }

  /**
   * Stage 2: Complete missing structure
   */
  private completeStructure(spec: GameSpec): GameSpec {
    const completed = JSON.parse(JSON.stringify(spec)) as GameSpec;

    // Auto-complete player position
    const player = completed.entities.find((e) => e.type === 'player');
    if (player && !player.position) {
      player.position = { x: 100, y: 300 };
      this.diagnostics.autoFixes.push('Added default position to player');
    }

    // Auto-complete physics for player
    if (player && !player.physics) {
      player.physics = {
        gravity: completed.settings.gravity !== undefined && completed.settings.gravity > 0,
        collidable: true,
      };
      this.diagnostics.autoFixes.push('Added default physics to player');
    }

    // Auto-complete scene spawn
    if (!completed.scene.spawn) {
      completed.scene.spawn = player?.position || { x: 100, y: 300 };
      this.diagnostics.autoFixes.push('Added default spawn position');
    }

    // Auto-complete camera follow
    if (!completed.scene.cameraFollow && player) {
      completed.scene.cameraFollow = player.id;
      this.diagnostics.autoFixes.push(`Camera will follow ${player.id}`);
    }

    // Auto-complete components based on mechanics
    this.autoCompleteComponents(completed);

    return completed;
  }

  /**
   * Auto-complete components based on mechanics
   */
  private autoCompleteComponents(spec: GameSpec): void {
    const player = spec.entities.find((e) => e.type === 'player');
    if (!player) return;

    // Jump mechanics → add jump component
    if (spec.mechanics.includes('jump') && !player.components.includes('jump')) {
      player.components.push('jump');
      this.diagnostics.inferredNodes.push('Added jump component to player');
    }

    // Gravity → ensure gravity component
    if (spec.settings.gravity && spec.settings.gravity > 0) {
      if (!player.components.includes('gravity')) {
        player.components.push('gravity');
        this.diagnostics.inferredNodes.push('Added gravity component to player');
      }
    }

    // Shoot mechanics → add shoot component
    if (spec.mechanics.includes('shoot') && !player.components.includes('shoot')) {
      player.components.push('shoot');
      this.diagnostics.inferredNodes.push('Added shoot component to player');
    }

    // Collect mechanics → add collect component
    if (spec.mechanics.includes('collect') && !player.components.includes('collect')) {
      player.components.push('collect');
      this.diagnostics.inferredNodes.push('Added collect component to player');
    }

    // Collision with enemies → add health component
    const hasEnemies = spec.entities.some((e) => e.type === 'enemy');
    if (hasEnemies && !player.components.includes('health')) {
      player.components.push('health');
      this.diagnostics.inferredNodes.push('Added health component to player');
    }

    // Movement → add input component
    if (
      spec.mechanics.includes('jump') ||
      spec.mechanics.includes('shoot') ||
      spec.mechanics.includes('dash')
    ) {
      if (!player.components.includes('keyboardInput')) {
        player.components.push('keyboardInput');
        this.diagnostics.inferredNodes.push('Added keyboardInput component to player');
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

    // Create edges
    for (const entity of spec.entities) {
      // Spawn relationships
      if (entity.components.includes('spawn')) {
        // Find what this entity spawns
        const spawnTargets = spec.entities.filter(
          (e) =>
            e.id.includes(entity.id) &&
            e.id !== entity.id &&
            (e.type === 'projectile' || e.type === 'enemy' || e.type === 'pickup')
        );

        for (const target of spawnTargets) {
          edges.push({
            from: entity.id,
            to: target.id,
            type: 'spawns',
          });
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
  private buildComponentGraph(spec: GameSpec): ComponentGraph {
    const entityComponents: Record<string, string[]> = {};

    for (const entity of spec.entities) {
      // Ensure unique components
      const components = [...new Set(entity.components)];

      // Resolve component dependencies
      const resolvedComponents = this.resolveComponentDependencies(components);

      entityComponents[entity.id] = resolvedComponents;
    }

    return { entityComponents };
  }

  /**
   * Resolve component dependencies
   */
  private resolveComponentDependencies(components: string[]): string[] {
    const resolved = [...components];
    const added = new Set(components);

    // Dependency rules
    const dependencyRules: Record<string, string[]> = {
      jump: ['gravity'],
      shoot: ['keyboardInput'],
      collect: ['collision'],
      patrol: ['move'],
      followTarget: ['move'],
    };

    // Add dependencies
    for (const component of components) {
      const deps = dependencyRules[component];
      if (deps) {
        for (const dep of deps) {
          if (!added.has(dep)) {
            resolved.push(dep);
            added.add(dep);
            this.diagnostics.inferredNodes.push(
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

    // Always include physics if gravity is set
    if (spec.settings.gravity && spec.settings.gravity > 0) {
      systems.push({ type: 'physics', enabled: true });
    }

    // Include collision if any entity is collidable
    const hasCollidable = spec.entities.some((e) => e.physics?.collidable);
    if (hasCollidable) {
      systems.push({ type: 'collision', enabled: true });
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
      systems.push({ type: 'input', enabled: true });
    }

    // Include spawn if any entity spawns others
    const hasSpawn = spec.entities.some((e) => e.components.includes('spawn'));
    if (hasSpawn) {
      systems.push({ type: 'spawn', enabled: true });
    }

    // Include camera (always)
    systems.push({ type: 'camera', enabled: true });

    // Include scoring if defined
    if (spec.scoring) {
      systems.push({ type: 'scoring', enabled: true });
    }

    // Include AI if there are enemies
    const hasEnemies = spec.entities.some((e) => e.type === 'enemy');
    if (hasEnemies) {
      systems.push({ type: 'ai', enabled: true });
    }

    // Include animation (optional, always enabled)
    systems.push({ type: 'animation', enabled: true });

    // Include sound (optional)
    if (spec.assets.some((a) => a.type === 'sound' || a.type === 'music')) {
      systems.push({ type: 'sound', enabled: true });
    }

    return { systems, dependencies };
  }

  /**
   * Stage 4: Resolve dependencies
   */
  private resolveDependencies(
    _componentGraph: ComponentGraph,
    systemGraph: SystemGraph
  ): void {
    // Ensure all required systems are present
    for (const dep of systemGraph.dependencies) {
      const system = systemGraph.systems.find((s) => s.type === dep.system);
      if (!system) {
        systemGraph.systems.push({ type: dep.system, enabled: true });
        this.diagnostics.autoFixes.push(`Added missing system: ${dep.system}`);
      }

      // Check if required systems exist
      for (const required of dep.requires) {
        const requiredSystem = systemGraph.systems.find((s) => s.type === required);
        if (!requiredSystem) {
          systemGraph.systems.push({ type: required, enabled: true });
          this.diagnostics.autoFixes.push(`Added missing system: ${required}`);
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

    // Sort systems by dependencies
    systemGraph.systems.sort((a, b) => {
      const aDeps = systemGraph.dependencies.filter((d) => d.system === a.type);
      const bDeps = systemGraph.dependencies.filter((d) => d.system === b.type);

      // Systems with fewer dependencies come first
      return aDeps.length - bDeps.length;
    });
  }
}

// Export singleton instance
export const planner = new PlannerAgent();
