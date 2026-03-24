/**
 * Adapter Binding Generator
 *
 * Generates adapter bindings from ComponentGraph
 */

import type { ComponentGraph, GameSpec, AdapterBinding, SupportedEngine } from '@loom/core';
import { AdapterRegistryImpl } from './registry';

/**
 * Generate adapter bindings from component graph
 */
export function generateAdapterBindings(
  componentGraph: ComponentGraph,
  _gameSpec: GameSpec,
  registry: AdapterRegistryImpl,
  engine: SupportedEngine = 'phaser'
): AdapterBinding[] {
  const bindings: AdapterBinding[] = [];

  // For each entity's components
  for (const [entityId, components] of Object.entries(componentGraph.entityComponents)) {
    for (const componentType of components) {
      // Resolve adapter
      const adapter = registry.resolve(componentType, engine);

      if (adapter) {
        bindings.push({
          componentType,
          entityId,
          adapter,
          config: getDefaultConfig(componentType),
        });
      } else {
        console.warn(`No adapter found for component type: ${componentType}`);
      }
    }
  }

  // Validate dependencies
  const validation = registry.validateDependencies(engine);
  if (!validation.valid) {
    console.warn('Missing adapter dependencies:', validation.missing);
  }

  return bindings;
}

/**
 * Get default configuration for a component type
 */
function getDefaultConfig(componentType: string): Record<string, unknown> {
  const defaults: Record<string, Record<string, unknown>> = {
    jump: {
      force: 320,
      maxCount: 1,
      cooldown: 0,
    },
    health: {
      maxHealth: 100,
      currentHealth: 100,
    },
    keyboardInput: {
      keys: {
        up: 'W',
        down: 'S',
        left: 'A',
        right: 'D',
        space: 'SPACE',
      },
    },
    movement: {
      speed: 200,
    },
    shoot: {
      bulletSpeed: 400,
      cooldown: 250,
    },
    move: {
      speed: 200,
      horizontal: true,
      vertical: true,
      autoMove: false,
    },
    spawn: {
      spawnRate: 2000,
      maxSpawns: 5,
      initialDelay: 0,
    },
  };

  return defaults[componentType] || {};
}
