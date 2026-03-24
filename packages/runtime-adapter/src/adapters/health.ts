/**
 * Phaser Health Adapter
 *
 * Maps health component to entity health state with visual feedback
 */

import type { RuntimeAdapter, Entity } from '@loom/core';
import type { PhaserEngine, PhaserSprite } from '../types/phaser';

export interface HealthAdapterConfig {
  max: number;
  current?: number;
  invincible?: boolean;
  invincibleDuration?: number;
}

export const healthAdapter: RuntimeAdapter<HealthAdapterConfig, PhaserEngine> = {
  componentType: 'health',
  engine: 'phaser',
  version: '1.0.0',

  onCreate: (entity: Entity, config: HealthAdapterConfig, engine: PhaserEngine) => {
    const sprite = engine.scene.children.get(entity.id) as PhaserSprite | undefined;
    if (!sprite) return;

    // Initialize health state on the sprite
    sprite.healthState = {
      max: config.max,
      current: config.current !== undefined ? config.current : config.max,
      invincible: config.invincible || false,
      invincibleDuration: config.invincibleDuration || 1000,
      lastDamageTime: 0,
    };
  },

  onUpdate: (
    entity: Entity,
    _config: HealthAdapterConfig,
    engine: PhaserEngine,
    _deltaTime: number
  ) => {
    const sprite = engine.scene.children.get(entity.id) as PhaserSprite | undefined;
    if (!sprite || !sprite.healthState) return;

    const hs = sprite.healthState;

    // Clear invincibility visual feedback after duration expires
    if (hs.invincible && hs.lastDamageTime > 0) {
      const now = Date.now();
      if (now - hs.lastDamageTime >= hs.invincibleDuration) {
        // Reset tint after invincibility expires
        if (typeof (sprite as any).clearTint === 'function') {
          (sprite as any).clearTint();
        }
        // Reset alpha flicker
        if (typeof (sprite as any).setAlpha === 'function') {
          (sprite as any).setAlpha(1);
        }
      } else {
        // Flicker sprite during invincibility frames
        const flickerPhase = Math.floor((now - hs.lastDamageTime) / 100) % 2;
        if (typeof (sprite as any).setAlpha === 'function') {
          (sprite as any).setAlpha(flickerPhase === 0 ? 0.5 : 1);
        }
      }
    }
  },

  onCollision: (
    entity: Entity,
    _other: Entity,
    _config: HealthAdapterConfig,
    engine: PhaserEngine
  ) => {
    const sprite = engine.scene.children.get(entity.id) as PhaserSprite | undefined;
    if (!sprite || !sprite.healthState) return;

    const hs = sprite.healthState;
    const now = Date.now();

    // Check if entity is currently in invincibility frames
    if (hs.invincible && now - hs.lastDamageTime < hs.invincibleDuration) {
      return;
    }

    // Apply damage
    const damageAmount = 1;
    hs.current = Math.max(0, hs.current - damageAmount);
    hs.lastDamageTime = now;

    // Visual feedback: flash red tint on damage
    if (typeof (sprite as any).setTint === 'function') {
      (sprite as any).setTint(0xff0000);
      engine.scene.time.delayedCall(200, () => {
        if (typeof (sprite as any).clearTint === 'function') {
          (sprite as any).clearTint();
        }
      });
    }

    // Destroy entity when health reaches zero
    if (hs.current <= 0) {
      sprite.destroy();
    }
  },

  dependencies: [],
};
