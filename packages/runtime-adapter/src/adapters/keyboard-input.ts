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

    // Create keyboard keys based on config
    sprite.inputKeys = {} as Record<string, PhaserKey>;

    for (const [action, key] of Object.entries(config)) {
      // Map common keys
      if (key === 'UP' || key === 'DOWN' || key === 'LEFT' || key === 'RIGHT') {
        const cursors = engine.input.keyboard?.createCursorKeys();
        if (cursors) {
          sprite.inputKeys[action] = cursors[key.toLowerCase() as keyof PhaserCursorKeys];
        }
      } else if (key === 'SPACE') {
        const spaceKey = engine.input.keyboard?.addKey('SPACE');
        if (spaceKey) {
          sprite.inputKeys[action] = spaceKey;
        }
      } else if (key === 'W' || key === 'A' || key === 'S' || key === 'D') {
        const mappedKey = engine.input.keyboard?.addKey(key);
        if (mappedKey) {
          sprite.inputKeys[action] = mappedKey;
        }
      } else {
        // Generic key mapping
        const genericKey = engine.input.keyboard?.addKey(key);
        if (genericKey) {
          sprite.inputKeys[action] = genericKey;
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

    // Check key states and store on entity for other adapters to use
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
