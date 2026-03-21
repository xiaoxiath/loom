/**
 * Phaser Destroy On Collision Adapter
 *
 * Destroys entity when it collides with specific entity types
 */

import type { RuntimeAdapter, Entity } from '@loom/core';
import type { PhaserEngine, PhaserSprite } from '../types/phaser';

export interface DestroyOnCollisionAdapterConfig {
  with: string[];
  delay?: number;
}

export const destroyOnCollisionAdapter: RuntimeAdapter<DestroyOnCollisionAdapterConfig, PhaserEngine> = {
  componentType: 'destroyOnCollision',
  engine: 'phaser',
  version: '1.0.0',

  onCreate: (entity: Entity, config: DestroyOnCollisionAdapterConfig, engine: PhaserEngine) => {
    const sprite = engine.scene.children.get(entity.id) as PhaserSprite | undefined;
    if (!sprite) return;

    // Store collision targets
    sprite.destroyOnCollisionTargets = config.with;
    sprite.destroyDelay = config.delay || 0;
  },

  onCollision: (
    entity: Entity,
    other: Entity,
    config: DestroyOnCollisionAdapterConfig,
    engine: PhaserEngine
  ) => {
    const sprite = engine.scene.children.get(entity.id) as PhaserSprite | undefined;
    if (!sprite || !sprite.destroyOnCollisionTargets) return;

    // Check if other entity type matches any target
    if (config.with.includes(other.type)) {
      // Destroy immediately or with delay
      const delay = sprite.destroyDelay || 0;
      if (delay > 0) {
        engine.scene.time.delayedCall(delay, () => {
          sprite.destroy();
        });
      } else {
        sprite.destroy();
      }
    }
  },

  dependencies: ['collision'],
};
