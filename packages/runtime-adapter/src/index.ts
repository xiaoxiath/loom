/**
 * @loom/runtime-adapter
 *
 * Runtime Adapter Layer for Loom game generation platform
 */

// Core registry
export { AdapterRegistryImpl, createDefaultRegistry } from './registry';

// Adapter bindings generator
export { generateAdapterBindings } from './adapter-bindings';

// All Phaser adapters
export * from './adapters';

// Phaser types
export * from './types';

// Re-export types from @loom/core for convenience
export type {
  RuntimeAdapter,
  AdapterRegistry,
  AdapterBinding,
  AdapterDebugInfo,
  SupportedEngine,
} from '@loom/core';
