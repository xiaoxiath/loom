/**
 * Phaser Collision Adapter
 *
 * Maps collision component to Phaser collision system
 */

import type { RuntimeAdapter, Entity } from '@loom/core';
import type { PhaserEngine, PhaserSprite } from '../types/phaser';

export interface CollisionAdapterConfig {
  with: string[];
  callback?: string;
}

export const collisionAdapter: RuntimeAdapter<CollisionAdapterConfig, PhaserEngine> = {
  componentType: 'collision',
  engine: 'phaser',
  version: '1.0.0',

  onCreate: (entity: Entity, config: CollisionAdapterConfig, engine: PhaserEngine) => {
    const sprite = engine.scene.children.get(entity.id) as PhaserSprite | undefined;
    if (!sprite || !sprite.body) return;

    // Enable collision for this entity
    sprite.body.setCollideWorldBounds(true);

    // Set up collision groups based on config.with
    for (const targetEntityId of config.with) {
      const targetSprite = engine.scene.children.get(targetEntityId) as PhaserSprite | undefined;
      if (targetSprite && targetSprite.body) {
        engine.physics.add.collider(sprite, targetSprite, (sprite1: PhaserSprite, sprite2: PhaserSprite) => {
          // Trigger collision callback if provided
          if (config.callback && sprite.collisionCallbacks) {
            const callback = sprite.collisionCallbacks[config.callback];
            if (callback) {
              callback(sprite1, sprite2);
            }
          }
        });
      }
    }
  },

  onCollision: (
    entity: Entity,
    other: Entity,
    config: CollisionAdapterConfig,
    engine: PhaserEngine
  ) => {
    const sprite = engine.scene.children.get(entity.id) as PhaserSprite | undefined;
    const otherSprite = engine.scene.children.get(other.id) as PhaserSprite | undefined;
    if (!sprite || !otherSprite) return;

    // Only react if the other entity's type is in our collision target list
    if (!config.with.includes(other.type)) return;

    // Emit collision event on the sprite for other adapters to consume
    if (sprite.collisionCallbacks) {
      const callbackName = config.callback ?? 'default';
      const callback = sprite.collisionCallbacks[callbackName];
      if (callback) {
        callback(sprite, otherSprite);
        return;
      }
    }

    // Default collision behavior when no callback is registered:
    // Apply damage if the entity has health state
    if (sprite.healthState) {
      const now = Date.now();
      const hs = sprite.healthState;

      // Respect invincibility frames
      if (hs.invincible && now - hs.lastDamageTime < hs.invincibleDuration) {
        return;
      }

      const damageAmount = 1;
      hs.current = Math.max(0, hs.current - damageAmount);
      hs.lastDamageTime = now;

      // Destroy the entity when health reaches zero
      if (hs.current <= 0) {
        sprite.destroy();
      }
    }

    // If the entity has destroyOnCollision targets, check and destroy
    if (sprite.destroyOnCollisionTargets && sprite.destroyOnCollisionTargets.includes(other.type)) {
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

  dependencies: [],
};
