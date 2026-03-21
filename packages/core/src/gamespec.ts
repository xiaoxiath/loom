/**
 * GameSpec DSL v1.0 - Core Protocol Layer
 *
 * GameSpec is the central data format that represents a complete game definition.
 * It serves as the stable intermediate format between natural language parsing
 * and code generation.
 */

/**
 * Game metadata
 */
export interface GameMeta {
  title: string;
  genre: GameGenre;
  camera: CameraType;
  dimension: DimensionType;
  version: string;
}

/**
 * Game runtime settings
 */
export interface GameSettings {
  gravity?: number;
  backgroundColor?: string;
  worldWidth?: number;
  worldHeight?: number;
  [key: string]: unknown;
}

/**
 * Scene configuration
 */
export interface SceneConfig {
  type: SceneType;
  cameraFollow?: string;
  spawn?: Position;
  [key: string]: unknown;
}

/**
 * Game entity definition
 */
export interface Entity {
  id: string;
  type: EntityType;
  sprite: string;
  position?: Position;
  physics?: PhysicsConfig;
  components: string[];
  [key: string]: unknown;
}

/**
 * Position coordinates
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * Physics configuration
 */
export interface PhysicsConfig {
  gravity?: boolean;
  collidable?: boolean;
  static?: boolean;
  bounce?: number;
  friction?: number;
  [key: string]: unknown;
}

/**
 * Scoring system configuration
 */
export interface ScoringConfig {
  type: ScoringType;
  increment?: number;
  target?: string;
  [key: string]: unknown;
}

/**
 * UI configuration
 */
export interface UIConfig {
  hud?: string[];
  startScreen?: boolean;
  gameOverScreen?: boolean;
  [key: string]: unknown;
}

/**
 * Asset reference
 */
export interface Asset {
  id: string;
  type: AssetType;
  source: string;
  url?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Extensions for plugins
 */
export interface Extensions {
  [key: string]: unknown;
}

/**
 * Complete GameSpec DSL structure
 */
export interface GameSpec {
  meta: GameMeta;
  settings: GameSettings;
  scene: SceneConfig;
  entities: Entity[];
  systems: SystemType[];
  mechanics: MechanicType[];
  scoring: ScoringConfig;
  ui: UIConfig;
  assets: Asset[];
  extensions: Extensions;
}

// Enums

export type GameGenre =
  | 'runner'
  | 'platformer'
  | 'shooter'
  | 'puzzle'
  | 'rpg'
  | 'strategy'
  | 'sports'
  | 'racing'
  | 'arcade';

export type CameraType =
  | 'side'
  | 'topdown'
  | 'isometric'
  | 'first-person'
  | 'third-person';

export type DimensionType = '2D' | '3D';

export type SceneType = 'single' | 'multi';

export type EntityType =
  | 'player'
  | 'enemy'
  | 'npc'
  | 'obstacle'
  | 'projectile'
  | 'platform'
  | 'pickup'
  | 'spawner'
  | 'trigger';

export type SystemType =
  | 'physics'
  | 'collision'
  | 'input'
  | 'spawn'
  | 'camera'
  | 'animation'
  | 'sound'
  | 'ai'
  | 'scoring';

export type MechanicType =
  | 'jump'
  | 'shoot'
  | 'dash'
  | 'collect'
  | 'avoid'
  | 'survive'
  | 'follow'
  | 'spawn'
  | 'patrol';

export type ScoringType =
  | 'kill'
  | 'collect'
  | 'time'
  | 'distance'
  | 'combo';

export type AssetType =
  | 'sprite'
  | 'background'
  | 'music'
  | 'sound'
  | 'ui'
  | 'particle'
  | 'font';
