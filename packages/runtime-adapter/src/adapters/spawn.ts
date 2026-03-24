/**
 * Phaser Spawn Adapter
 *
 * Maps spawn component to Phaser entity spawning system
 */

import type { RuntimeAdapter, Entity, GameSpec } from '@loom/core';
import type { PhaserEngine, PhaserSprite } from '../types/phaser';

export interface SpawnAdapterConfig {
  spawnRate?: number; // milliseconds between spawns
  maxSpawns?: number; // maximum number of active spawns
  spawnType?: string; // type of entity to spawn
  offsetX?: number;
  offsetY?: number;
  initialDelay?: number; // delay before first spawn
}

export const spawnAdapter: RuntimeAdapter<SpawnAdapterConfig, PhaserEngine> = {
  componentType: 'spawn',
  engine: 'phaser',
  version: '1.0.0',

  onCreate: (entity: Entity, config: SpawnAdapterConfig, engine: PhaserEngine) => {
    const sprite = engine.scene.children.get(entity.id) as PhaserSprite | undefined;
    if (!sprite) return;

    // Store spawn state on entity
    sprite.spawnState = {
      lastSpawnTime: Date.now() + (config.initialDelay || 0),
      spawnRate: config.spawnRate || 2000,
      maxSpawns: config.maxSpawns || 5,
      activeSpawns: 0,
      spawnType: config.spawnType || 'entity',
    };
  },

  onUpdate: (
    _entity: Entity,
    _config: SpawnAdapterConfig,
    engine: PhaserEngine,
    _deltaTime: number,
    _gameSpec?: GameSpec
  ) => {
    const sprite = engine.scene.children.get(_entity.id) as PhaserSprite | undefined;
    if (!sprite || !sprite.spawnState) return;

    const spawnState = sprite.spawnState;
    const now = Date.now();

    // Check if it's time to spawn
    if (now - spawnState.lastSpawnTime < spawnState.spawnRate) return;

    // Check max spawns limit
    if (spawnState.activeSpawns >= spawnState.maxSpawns) return;

    // Note: Actual spawning logic would require:
    // 1. Access to GameSpec to find spawnable entity templates
    // 2. Entity factory/instantiation system
    // 3. Tracking spawned entities for cleanup
    //
    // This is a placeholder that logs spawn events.
    // Full implementation would integrate with the orchestrator's
    // entity management system.

    console.log(
      `[SpawnAdapter] Entity ${_entity.id} ready to spawn ${spawnState.spawnType || 'entity'}`
    );

    // Update spawn timer
    spawnState.lastSpawnTime = now;

    // In a full implementation, you would:
    // 1. Get entity template from gameSpec.entities
    // 2. Clone and instantiate the entity
    // 3. Set position relative to spawner
    // 4. Add to scene and physics
    // 5. Track for maxSpawns limit
  },

  dependencies: [],
};
