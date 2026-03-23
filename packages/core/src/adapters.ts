/**
 * Runtime Adapter types
 *
 * Adapters map platform-agnostic components to specific game engine APIs.
 * Initially targeting Phaser.js, designed to support multiple engines.
 */

import type { Entity } from './gamespec';

/**
 * Runtime adapter interface
 */
export interface RuntimeAdapter<
  TConfig = Record<string, unknown>,
  TEngine = unknown
> {
  /** Component type this adapter handles */
  componentType: string;

  /** Target engine (e.g., 'phaser', 'godot', 'unity') */
  engine: string;

  /** Adapter version */
  version: string;

  /** Lifecycle hooks */
  onCreate?: (entity: Entity, config: TConfig, engine: TEngine) => void;
  onStart?: (entity: Entity, config: TConfig, engine: TEngine) => void;
  onUpdate?: (
    entity: Entity,
    config: TConfig,
    engine: TEngine,
    deltaTime: number
  ) => void;
  onCollision?: (
    entity: Entity,
    other: Entity,
    config: TConfig,
    engine: TEngine
  ) => void;
  onDestroy?: (entity: Entity, config: TConfig, engine: TEngine) => void;

  /** Declared dependencies */
  dependencies: string[];
}

/**
 * Adapter registry interface
 */
export interface AdapterRegistry {
  /** Register an adapter */
  register(
    componentType: string,
    engine: string,
    adapter: RuntimeAdapter
  ): void;

  /** Resolve an adapter */
  resolve(componentType: string, engine: string): RuntimeAdapter | undefined;

  /** Check if adapter exists */
  has(componentType: string, engine: string): boolean;

  /** Get all adapters for an engine */
  getAllForEngine(engine: string): RuntimeAdapter[];
}

/**
 * Adapter binding - maps a component to its resolved adapter
 */
export interface AdapterBinding {
  componentType: string;
  entityId: string;
  adapter: RuntimeAdapter;
  config: Record<string, unknown>;
}

/**
 * Supported engines
 */
export type SupportedEngine = 'phaser' | 'godot' | 'unity' | 'threejs';

/**
 * Adapter debug information
 */
export interface AdapterDebugInfo {
  component: string;
  entity: string;
  lifecycle: {
    onCreate: boolean;
    onStart: boolean;
    onUpdate: boolean;
    onCollision: boolean;
    onDestroy: boolean;
  };
  events: Array<{
    type: string;
    timestamp: number;
    data: unknown;
  }>;
}
