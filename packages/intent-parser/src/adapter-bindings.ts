/**
 * Adapter Binding Generator
 *
 * Generates adapter bindings from ComponentGraph
 */

import type { ComponentGraph, AdapterBinding } from '@loom/core';
import {
  AdapterRegistryImpl,
  jumpAdapter,
  healthAdapter,
  keyboardInputAdapter,
  gravityAdapter
} from '@loom/runtime-adapter';

/**
 * Create a registry with all available adapters
 */
export function createPhaserAdapterRegistry(): AdapterRegistryImpl {
  const registry = new AdapterRegistryImpl();

  // Register all available Phaser adapters
  // Use type assertion to work with generic RuntimeAdapter type
  registry.register('jump', 'phaser', jumpAdapter as any);
  registry.register('health', 'phaser', healthAdapter as any);
  registry.register('keyboardInput', 'phaser', keyboardInputAdapter as any);
  registry.register('gravity', 'phaser', gravityAdapter as any);

  return registry;
}

/**
 * Generate adapter bindings from component graph
 */
export function generateAdapterBindings(
  componentGraph: ComponentGraph,
  engine: 'phaser' = 'phaser'
): AdapterBinding[] {
  const registry = createPhaserAdapterRegistry();
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
  };

  return defaults[componentType] || {};
}
