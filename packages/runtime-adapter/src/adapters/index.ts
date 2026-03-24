/**
 * Export all Phaser adapters
 */

export { jumpAdapter } from './jump';
export type { JumpAdapterConfig } from './jump';

export { gravityAdapter } from './gravity';
export type { GravityAdapterConfig } from './gravity';

export { collisionAdapter } from './collision';
export type { CollisionAdapterConfig } from './collision';

export { keyboardInputAdapter } from './keyboard-input';
export type { KeyboardInputAdapterConfig } from './keyboard-input';

export { healthAdapter } from './health';
export type { HealthAdapterConfig } from './health';

export { destroyOnCollisionAdapter } from './destroy-on-collision';
export type { DestroyOnCollisionAdapterConfig } from './destroy-on-collision';

export { moveAdapter } from './move';
export type { MoveAdapterConfig } from './move';

export { spawnAdapter } from './spawn';
export type { SpawnAdapterConfig } from './spawn';
