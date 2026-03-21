/**
 * @loom/core
 *
 * Core types and interfaces for Loom game generation platform
 */

// GameSpec DSL
export type {
  GameSpec,
  GameMeta,
  GameSettings,
  SceneConfig,
  Entity,
  Position,
  PhysicsConfig,
  ScoringConfig,
  UIConfig,
  Asset,
  Extensions,
  GameGenre,
  CameraType,
  DimensionType,
  SceneType,
  EntityType,
  SystemType,
  MechanicType,
  ScoringType,
  AssetType,
} from './gamespec';

// Graph types
export type {
  SceneGraph,
  SceneNode,
  EntityGraph,
  EntityNode,
  EntityEdge,
  EntityRelationType,
  ComponentGraph,
  SystemGraph,
  SystemNode,
  SystemDependency,
  PlanResult,
  PlanDiagnostics,
  CameraConfig,
} from './graphs';

// Component types
export type {
  Component,
  ComponentEvents,
  JumpComponent,
  RunComponent,
  FlyComponent,
  DashComponent,
  GravityComponent,
  CollisionComponent,
  BounceComponent,
  ShootComponent,
  MeleeComponent,
  KeyboardInputComponent,
  MouseInputComponent,
  TouchInputComponent,
  HealthComponent,
  DestroyOnCollisionComponent,
  TimeToLiveComponent,
  PatrolComponent,
  FollowTargetComponent,
  CollectComponent,
  ComponentRegistry,
  ComponentDefinition,
} from './components';

// Adapter types
export type {
  RuntimeAdapter,
  AdapterRegistry,
  AdapterBinding,
  GenericEngine,
  SupportedEngine,
  AdapterDebugInfo,
} from './adapters';
