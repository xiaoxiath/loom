/**
 * Unit tests for Adapter Registry
 */

import { AdapterRegistryImpl } from '../src/registry';
import type { RuntimeAdapter } from '@loom/core';

describe('AdapterRegistryImpl', () => {
  let registry: AdapterRegistryImpl;

  beforeEach(() => {
    registry = new AdapterRegistryImpl();
  });

  afterEach(() => {
    registry.clear();
  });

  describe('register()', () => {
    it('should register an adapter', () => {
      const adapter: RuntimeAdapter = {
        componentType: 'test',
        engine: 'phaser',
        version: '1.0.0',
        dependencies: [],
      };

      registry.register('test', 'phaser', adapter);

      expect(registry.has('test', 'phaser')).toBe(true);
    });

    it('should overwrite existing adapter with warning', () => {
      const adapter1: RuntimeAdapter = {
        componentType: 'test',
        engine: 'phaser',
        version: '1.0.0',
        dependencies: [],
      };

      const adapter2: RuntimeAdapter = {
        componentType: 'test',
        engine: 'phaser',
        version: '2.0.0',
        dependencies: [],
      };

      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();

      registry.register('test', 'phaser', adapter1);
      registry.register('test', 'phaser', adapter2);

      expect(registry.has('test', 'phaser')).toBe(true);
      expect(warnSpy).toHaveBeenCalled();

      warnSpy.mockRestore();
    });
  });

  describe('resolve()', () => {
    it('should resolve a registered adapter', () => {
      const adapter: RuntimeAdapter = {
        componentType: 'test',
        engine: 'phaser',
        version: '1.0.0',
        dependencies: [],
      };

      registry.register('test', 'phaser', adapter);

      const resolved = registry.resolve('test', 'phaser');

      expect(resolved).toBeDefined();
      expect(resolved?.version).toBe('1.0.0');
    });

    it('should return undefined for unregistered adapter', () => {
      const resolved = registry.resolve('nonexistent', 'phaser');

      expect(resolved).toBeUndefined();
    });
  });

  describe('has()', () => {
    it('should return true for registered adapter', () => {
      const adapter: RuntimeAdapter = {
        componentType: 'test',
        engine: 'phaser',
        version: '1.0.0',
        dependencies: [],
      };

      registry.register('test', 'phaser', adapter);

      expect(registry.has('test', 'phaser')).toBe(true);
    });

    it('should return false for unregistered adapter', () => {
      expect(registry.has('nonexistent', 'phaser')).toBe(false);
    });
  });

  describe('getAllForEngine()', () => {
    it('should return all adapters for an engine', () => {
      const adapter1: RuntimeAdapter = {
        componentType: 'jump',
        engine: 'phaser',
        version: '1.0.0',
        dependencies: [],
      };

      const adapter2: RuntimeAdapter = {
        componentType: 'gravity',
        engine: 'phaser',
        version: '1.0.0',
        dependencies: [],
      };

      const adapter3: RuntimeAdapter = {
        componentType: 'jump',
        engine: 'godot',
        version: '1.0.0',
        dependencies: [],
      };

      registry.register('jump', 'phaser', adapter1);
      registry.register('gravity', 'phaser', adapter2);
      registry.register('jump', 'godot', adapter3);

      const phaserAdapters = registry.getAllForEngine('phaser');

      expect(phaserAdapters).toHaveLength(2);
      expect(phaserAdapters.map((a) => a.componentType)).toContain('jump');
      expect(phaserAdapters.map((a) => a.componentType)).toContain('gravity');
    });

    it('should return empty array for engine with no adapters', () => {
      const adapters = registry.getAllForEngine('unity');

      expect(adapters).toHaveLength(0);
    });
  });

  describe('getComponentTypes()', () => {
    it('should return all component types for an engine', () => {
      const adapter1: RuntimeAdapter = {
        componentType: 'jump',
        engine: 'phaser',
        version: '1.0.0',
        dependencies: [],
      };

      const adapter2: RuntimeAdapter = {
        componentType: 'gravity',
        engine: 'phaser',
        version: '1.0.0',
        dependencies: [],
      };

      registry.register('jump', 'phaser', adapter1);
      registry.register('gravity', 'phaser', adapter2);

      const types = registry.getComponentTypes('phaser');

      expect(types).toContain('jump');
      expect(types).toContain('gravity');
    });
  });

  describe('validateDependencies()', () => {
    it('should return valid when all dependencies are registered', () => {
      const gravityAdapter: RuntimeAdapter = {
        componentType: 'gravity',
        engine: 'phaser',
        version: '1.0.0',
        dependencies: [],
      };

      const jumpAdapter: RuntimeAdapter = {
        componentType: 'jump',
        engine: 'phaser',
        version: '1.0.0',
        dependencies: ['gravity'],
      };

      registry.register('gravity', 'phaser', gravityAdapter);
      registry.register('jump', 'phaser', jumpAdapter);

      const result = registry.validateDependencies('phaser');

      expect(result.valid).toBe(true);
      expect(result.missing).toHaveLength(0);
    });

    it('should return invalid when dependencies are missing', () => {
      const jumpAdapter: RuntimeAdapter = {
        componentType: 'jump',
        engine: 'phaser',
        version: '1.0.0',
        dependencies: ['gravity'],
      };

      registry.register('jump', 'phaser', jumpAdapter);

      const result = registry.validateDependencies('phaser');

      expect(result.valid).toBe(false);
      expect(result.missing).toHaveLength(1);
      expect(result.missing[0]).toContain('jump requires gravity');
    });
  });

  describe('clear()', () => {
    it('should clear all registered adapters', () => {
      const adapter: RuntimeAdapter = {
        componentType: 'test',
        engine: 'phaser',
        version: '1.0.0',
        dependencies: [],
      };

      registry.register('test', 'phaser', adapter);
      registry.clear();

      expect(registry.has('test', 'phaser')).toBe(false);
    });
  });
});
