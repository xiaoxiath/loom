/**
 * Phaser Destroy On Collision Adapter
 *
 * Destroys entity when it collides with specific entity types.
 * Optionally plays a destruction effect before removing the sprite.
 */

import type { RuntimeAdapter, Entity } from '@loom/core';
import type { PhaserEngine, PhaserSprite } from '../types/phaser';

export interface DestroyOnCollisionAdapterConfig {
  with: string[];
  delay?: number;
  flash?: boolean;
}

export const destroyOnCollisionAdapter: RuntimeAdapter<DestroyOnCollisionAdapterConfig, PhaserEngine> = {
  componentType: 'destroyOnCollision',
  engine: 'phaser',
  version: '1.0.0',

  onCreate: (entity: Entity, config: DestroyOnCollisionAdapterConfig, engine: PhaserEngine) => {
    const sprite = engine.scene.children.get(entity.id) as PhaserSprite | undefined;
    if (!sprite) return;

    // Store collision targets on the sprite for runtime lookup
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
    if (!sprite) return;

    // Check if the colliding entity's type matches any target
    if (!config.with.includes(other.type)) return;

    const delay = config.delay || 0;

    // Optional flash effect before destruction
    if (config.flash && typeof (sprite as any).setTint === 'function') {
      (sprite as any).setTint(0xffffff);
    }

    if (delay > 0) {
      // Disable physics body immediately to prevent further collisions
      if (sprite.body) {
        (sprite.body as any).enable = false;
      }
      // Destroy after delay
      engine.scene.time.delayedCall(delay, () => {
        sprite.destroy();
      });
    } else {
      // Destroy immediately
      sprite.destroy();
    }
  },

  dependencies: ['collision'],
};
