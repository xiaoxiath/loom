/**
 * Phaser Gravity Adapter
 *
 * Maps gravity component to Phaser world gravity
 */

import type { RuntimeAdapter, Entity } from '@loom/core';
import type { PhaserEngine, PhaserSprite } from '../types/phaser';

export interface GravityAdapterConfig {
  value: number;
}

export const gravityAdapter: RuntimeAdapter<GravityAdapterConfig, PhaserEngine> = {
  componentType: 'gravity',
  engine: 'phaser',
  version: '1.0.0',

  onCreate: (entity: Entity, config: GravityAdapterConfig, engine: PhaserEngine) => {
    // Set world gravity
    engine.physics.world.gravity.y = config.value;

    // Enable physics body for entity
    const sprite = engine.scene.children.get(entity.id) as PhaserSprite | undefined;
    if (sprite && sprite.body) {
      sprite.body.setAllowGravity(true);
    }
  },

  dependencies: [],
};
