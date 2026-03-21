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
    // In a full implementation, this would query the scene for entities
    // matching the types in config.with and create colliders
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
    _entity: Entity,
    _other: Entity,
    _config: CollisionAdapterConfig,
    _engine: PhaserEngine
  ) => {
    // This would be called by the collision system
    // Implementation would depend on event system design
  },

  dependencies: [],
};
