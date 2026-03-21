/**
 * Phaser Jump Adapter
 *
 * Maps jump component to Phaser physics velocity
 */

import type { RuntimeAdapter, Entity } from '@loom/core';
import type { PhaserEngine, PhaserSprite } from '../types/phaser';

export interface JumpAdapterConfig {
  force: number;
  maxCount?: number;
  cooldown?: number;
}

export const jumpAdapter: RuntimeAdapter<JumpAdapterConfig, PhaserEngine> = {
  componentType: 'jump',
  engine: 'phaser',
  version: '1.0.0',

  onCreate: (entity: Entity, config: JumpAdapterConfig, engine: PhaserEngine) => {
    // Store jump state on entity
    const sprite = engine.scene.children.get(entity.id) as PhaserSprite | undefined;
    if (sprite && sprite.body) {
      sprite.jumpState = {
        jumpCount: 0,
        maxCount: config.maxCount || 1,
        lastJumpTime: 0,
        cooldown: config.cooldown || 0,
      };
    }
  },

  onUpdate: (
    entity: Entity,
    config: JumpAdapterConfig,
    engine: PhaserEngine,
    _deltaTime: number
  ) => {
    const sprite = engine.scene.children.get(entity.id) as PhaserSprite | undefined;
    if (!sprite || !sprite.body) return;

    const jumpState = sprite.jumpState;
    if (!jumpState) return;

    // Reset jump count when touching ground
    if (sprite.body.blocked.down || sprite.body.touching.down) {
      jumpState.jumpCount = 0;
    }

    // Check for jump input
    const cursors = engine.input.keyboard?.createCursorKeys();
    const spaceKey = engine.input.keyboard?.addKey('SPACE');

    const now = Date.now();
    const canJump =
      jumpState.jumpCount < jumpState.maxCount &&
      now - jumpState.lastJumpTime >= jumpState.cooldown;

    if (canJump && (cursors?.up.isDown || spaceKey?.isDown)) {
      sprite.body.setVelocityY(-config.force);
      jumpState.jumpCount++;
      jumpState.lastJumpTime = now;
    }
  },

  dependencies: ['gravity', 'keyboardInput'],
};
