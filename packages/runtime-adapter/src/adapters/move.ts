/**
 * Phaser Move Adapter
 *
 * Maps move component to Phaser velocity-based movement
 */

import type { RuntimeAdapter, Entity } from '@loom/core';
import type { PhaserEngine, PhaserSprite, PhaserKey } from '../types/phaser';

export interface MoveAdapterConfig {
  speed?: number;
  horizontal?: boolean;
  vertical?: boolean;
  autoMove?: boolean;
  direction?: 'left' | 'right' | 'up' | 'down';
}

export const moveAdapter: RuntimeAdapter<MoveAdapterConfig, PhaserEngine> = {
  componentType: 'move',
  engine: 'phaser',
  version: '1.0.0',

  onCreate: (entity: Entity, config: MoveAdapterConfig, engine: PhaserEngine) => {
    const sprite = engine.scene.children.get(entity.id) as PhaserSprite | undefined;
    if (!sprite || !sprite.body) return;

    const speed = config.speed || 200;

    // Auto-move mode: move automatically in a direction
    if (config.autoMove !== false) {
      const direction = config.direction || 'right';

      switch (direction) {
        case 'left':
          sprite.body.setVelocityX(-speed);
          break;
        case 'right':
          sprite.body.setVelocityX(speed);
          break;
        case 'up':
          sprite.body.setVelocityY(-speed);
          break;
        case 'down':
          sprite.body.setVelocityY(speed);
          break;
      }
    }

    // Cache movement keys for keyboard-controlled movement
    if (!config.autoMove) {
      const cursors = engine.input.keyboard?.createCursorKeys();
      const wasd = {
        w: engine.input.keyboard?.addKey('W'),
        a: engine.input.keyboard?.addKey('A'),
        s: engine.input.keyboard?.addKey('S'),
        d: engine.input.keyboard?.addKey('D'),
      };
      sprite._moveKeys = { cursors, wasd };
      sprite._moveSpeed = speed;
    }
  },

  onUpdate: (
    entity: Entity,
    config: MoveAdapterConfig,
    engine: PhaserEngine,
    _deltaTime: number
  ) => {
    const sprite = engine.scene.children.get(entity.id) as PhaserSprite | undefined;
    if (!sprite || !sprite.body) return;

    // Skip if auto-move mode
    if (config.autoMove !== false) return;

    const moveKeys = sprite._moveKeys as
      | {
          cursors?: { up?: PhaserKey; down?: PhaserKey; left?: PhaserKey; right?: PhaserKey };
          wasd?: { w?: PhaserKey; a?: PhaserKey; s?: PhaserKey; d?: PhaserKey };
        }
      | undefined;

    if (!moveKeys) return;

    const speed = (sprite._moveSpeed as number) || config.speed || 200;
    const horizontal = config.horizontal !== false;
    const vertical = config.vertical !== false;

    // Horizontal movement
    if (horizontal) {
      if (moveKeys.cursors?.left?.isDown || moveKeys.wasd?.a?.isDown) {
        sprite.body.setVelocityX(-speed);
      } else if (moveKeys.cursors?.right?.isDown || moveKeys.wasd?.d?.isDown) {
        sprite.body.setVelocityX(speed);
      } else {
        sprite.body.setVelocityX(0);
      }
    }

    // Vertical movement
    if (vertical) {
      if (moveKeys.cursors?.up?.isDown || moveKeys.wasd?.w?.isDown) {
        sprite.body.setVelocityY(-speed);
      } else if (moveKeys.cursors?.down?.isDown || moveKeys.wasd?.s?.isDown) {
        sprite.body.setVelocityY(speed);
      } else {
        sprite.body.setVelocityY(0);
      }
    }
  },

  dependencies: [],
};
