/**
 * Phaser Health Adapter
 *
 * Maps health component to entity health state
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

    // Initialize health state
    sprite.healthState = {
      max: config.max,
      current: config.current !== undefined ? config.current : config.max,
      invincible: config.invincible || false,
      invincibleDuration: config.invincibleDuration || 0,
      lastDamageTime: 0,
    };
  },

  onCollision: (
    entity: Entity,
    _other: Entity,
    _config: HealthAdapterConfig,
    engine: PhaserEngine
  ) => {
    const sprite = engine.scene.children.get(entity.id) as PhaserSprite | undefined;
    if (!sprite || !sprite.healthState) return;

    const healthState = sprite.healthState;

    // Check if entity is invincible
    const now = Date.now();
    if (healthState.invincible && now - healthState.lastDamageTime < healthState.invincibleDuration) {
      return;
    }

    // Check if collision should cause damage (would be determined by collision tags)
    // For now, just a placeholder - actual damage logic would be more complex
    const damageAmount = 1; // Would be determined by other entity's damage component

    healthState.current = Math.max(0, healthState.current - damageAmount);
    healthState.lastDamageTime = now;

    // Check if entity should be destroyed
    if (healthState.current <= 0) {
      sprite.destroy();
    }
  },

  dependencies: [],
};
