/**
 * Phaser-specific type definitions
 *
 * These types are specific to Phaser.js engine and are used by Phaser adapters.
 * Import @types/phaser for full type definitions in production.
 */

/**
 * Phaser Scene
 */
export interface PhaserScene {
  children: {
    get(id: string): PhaserSprite | undefined;
  };
  time: {
    delayedCall(delay: number, callback: () => void): void;
  };
  physics: {
    world: {
      gravity: { x: number; y: number };
    };
  };
  [key: string]: unknown;
}

/**
 * Phaser Physics
 */
export interface PhaserPhysics {
  world: {
    gravity: { x: number; y: number };
  };
  add: {
    collider(
      sprite1: PhaserSprite,
      sprite2: PhaserSprite,
      callback?: (s1: PhaserSprite, s2: PhaserSprite) => void
    ): void;
  };
}

/**
 * Phaser Input
 */
export interface PhaserInput {
  keyboard?: {
    createCursorKeys(): PhaserCursorKeys;
    addKey(key: string): PhaserKey;
  };
}

/**
 * Phaser Cursor Keys
 */
export interface PhaserCursorKeys {
  up: PhaserKey;
  down: PhaserKey;
  left: PhaserKey;
  right: PhaserKey;
}

/**
 * Phaser Key
 */
export interface PhaserKey {
  isDown: boolean;
  isUp: boolean;
}

/**
 * Phaser Animations
 */
export interface PhaserAnimations {
  play(key: string): void;
  stop(): void;
}

/**
 * Phaser Engine - complete engine interface
 */
export interface PhaserEngine {
  scene: PhaserScene;
  physics: PhaserPhysics;
  input: PhaserInput;
  anims: PhaserAnimations;
}

/**
 * Phaser Sprite with physics body
 */
export interface PhaserSprite {
  id?: string;
  body: PhaserBody;
  destroy(): void;
  // Dynamic state properties used by adapters
  jumpState?: JumpState;
  healthState?: HealthState;
  spawnState?: SpawnState;
  inputKeys?: Record<string, PhaserKey>;
  keyState?: Record<string, boolean>;
  collisionCallbacks?: Record<string, (sprite1: PhaserSprite, sprite2: PhaserSprite) => void>;
  destroyOnCollisionTargets?: string[];
  destroyDelay?: number;
  _jumpKeys?: unknown;
  _moveKeys?: unknown;
  _moveSpeed?: unknown;
  [key: string]: unknown;
}

/**
 * Jump state stored on sprite
 */
export interface JumpState {
  jumpCount: number;
  maxCount: number;
  lastJumpTime: number;
  cooldown: number;
}

/**
 * Health state stored on sprite
 */
export interface HealthState {
  max: number;
  current: number;
  invincible: boolean;
  invincibleDuration: number;
  lastDamageTime: number;
}

/**
 * Spawn state stored on sprite
 */
export interface SpawnState {
  lastSpawnTime: number;
  spawnRate: number;
  maxSpawns: number;
  activeSpawns: number;
  spawnType: string;
}

/**
 * Phaser Physics Body
 */
export interface PhaserBody {
  setVelocityY(y: number): void;
  setVelocityX(x: number): void;
  setAllowGravity(allow: boolean): void;
  setCollideWorldBounds(collide: boolean): void;
  blocked: { down: boolean; up: boolean; left: boolean; right: boolean };
  touching: { down: boolean; up: boolean; left: boolean; right: boolean };
  velocity: { x: number; y: number };
  [key: string]: unknown;
}
