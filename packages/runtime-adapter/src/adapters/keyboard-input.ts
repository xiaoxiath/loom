/**
 * Phaser Keyboard Input Adapter
 *
 * Maps keyboard input component to Phaser input system
 */

import type { RuntimeAdapter, Entity } from '@loom/core';
import type { PhaserEngine, PhaserSprite, PhaserKey, PhaserCursorKeys } from '../types/phaser';

export interface KeyboardInputAdapterConfig {
  [action: string]: string;
}

export const keyboardInputAdapter: RuntimeAdapter<KeyboardInputAdapterConfig, PhaserEngine> = {
  componentType: 'keyboardInput',
  engine: 'phaser',
  version: '1.0.0',

  onCreate: (entity: Entity, config: KeyboardInputAdapterConfig, engine: PhaserEngine) => {
    const sprite = engine.scene.children.get(entity.id) as PhaserSprite | undefined;
    if (!sprite) return;

    // Initialize keyboard keys once during creation (not per-frame)
    sprite.inputKeys = {} as Record<string, PhaserKey>;

    // Create cursor keys once and cache them
    let cursors: PhaserCursorKeys | undefined;

    for (const [action, key] of Object.entries(config)) {
      // Map common keys
      if (key === 'UP' || key === 'DOWN' || key === 'LEFT' || key === 'RIGHT') {
        // Create cursor keys only once, reuse for all direction mappings
        if (!cursors) {
          cursors = engine.input.keyboard?.createCursorKeys();
        }
        if (cursors) {
          sprite.inputKeys[action] = cursors[key.toLowerCase() as keyof PhaserCursorKeys];
        }
      } else {
        // All other keys use addKey (SPACE, WASD, etc.)
        const mappedKey = engine.input.keyboard?.addKey(key);
        if (mappedKey) {
          sprite.inputKeys[action] = mappedKey;
        }
      }
    }
  },

  onUpdate: (
    entity: Entity,
    config: KeyboardInputAdapterConfig,
    engine: PhaserEngine,
    _deltaTime: number
  ) => {
    const sprite = engine.scene.children.get(entity.id) as PhaserSprite | undefined;
    if (!sprite || !sprite.inputKeys) return;

    // Read key states from already-created key objects (no re-creation per frame)
    sprite.keyState = {};
    for (const action of Object.keys(config)) {
      const keyObj = sprite.inputKeys[action];
      if (keyObj) {
        sprite.keyState[action] = keyObj.isDown;
      }
    }
  },

  dependencies: [],
};
