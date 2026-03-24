/**
 * Adapter Registry Implementation
 *
 * Manages registration and resolution of runtime adapters
 */

import type { RuntimeAdapter, AdapterRegistry as IAdapterRegistry } from '@loom/core';
import {
  jumpAdapter,
  gravityAdapter,
  collisionAdapter,
  keyboardInputAdapter,
  healthAdapter,
  destroyOnCollisionAdapter,
  moveAdapter,
  spawnAdapter,
} from './adapters';

export class AdapterRegistryImpl implements IAdapterRegistry {
  private adapters: Map<string, RuntimeAdapter> = new Map();

  /**
   * Generate a unique key for adapter lookup
   */
  private getKey(componentType: string, engine: string): string {
    return `${engine}:${componentType}`;
  }

  /**
   * Register an adapter
   */
  register(componentType: string, engine: string, adapter: RuntimeAdapter): void {
    const key = this.getKey(componentType, engine);

    if (this.adapters.has(key)) {
      console.warn(
        `Adapter already registered for ${componentType} on ${engine}. Overwriting.`
      );
    }

    this.adapters.set(key, adapter);
  }

  /**
   * Resolve an adapter
   */
  resolve(componentType: string, engine: string): RuntimeAdapter | undefined {
    const key = this.getKey(componentType, engine);
    return this.adapters.get(key);
  }

  /**
   * Check if adapter exists
   */
  has(componentType: string, engine: string): boolean {
    const key = this.getKey(componentType, engine);
    return this.adapters.has(key);
  }

  /**
   * Get all adapters for an engine
   */
  getAllForEngine(engine: string): RuntimeAdapter[] {
    const result: RuntimeAdapter[] = [];

    for (const [_key, adapter] of this.adapters) {
      if (adapter.engine === engine) {
        result.push(adapter);
      }
    }

    return result;
  }

  /**
   * Clear all registered adapters
   */
  clear(): void {
    this.adapters.clear();
  }

  /**
   * Get all registered component types for an engine
   */
  getComponentTypes(engine: string): string[] {
    const types: string[] = [];

    for (const [_key, adapter] of this.adapters) {
      if (adapter.engine === engine) {
        types.push(adapter.componentType);
      }
    }

    return types;
  }

  /**
   * Validate adapter dependencies
   * Returns true if all dependencies are registered
   */
  validateDependencies(engine: string): { valid: boolean; missing: string[] } {
    const missing: string[] = [];
    const adapters = this.getAllForEngine(engine);

    for (const adapter of adapters) {
      for (const dep of adapter.dependencies) {
        if (!this.has(dep, engine)) {
          missing.push(`${adapter.componentType} requires ${dep}`);
        }
      }
    }

    return {
      valid: missing.length === 0,
      missing,
    };
  }
}

/**
 * Create and configure a default registry with all core Phaser adapters
 */
export function createDefaultRegistry(): AdapterRegistryImpl {
  const registry = new AdapterRegistryImpl();

  // Register all core Phaser adapters
  // Use double assertion to work with generic RuntimeAdapter type
  const coreAdapters = [
    jumpAdapter,
    gravityAdapter,
    collisionAdapter,
    keyboardInputAdapter,
    healthAdapter,
    destroyOnCollisionAdapter,
    moveAdapter,
    spawnAdapter,
  ] as unknown as RuntimeAdapter[];

  for (const adapter of coreAdapters) {
    registry.register(adapter.componentType, adapter.engine, adapter);
  }

  return registry;
}
