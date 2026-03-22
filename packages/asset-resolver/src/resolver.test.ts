/**
 * Asset Resolver Tests
 */

import { AssetResolver } from './resolver';
import type { GameSpec } from '@loom/core';

describe('AssetResolver', () => {
  let resolver: AssetResolver;

  beforeEach(() => {
    resolver = new AssetResolver({
      enableCache: true,
      enablePlaceholders: true,
    });
  });

  describe('resolveFromGameSpec()', () => {
    it('should resolve assets from GameSpec', async () => {
      const spec: GameSpec = {
        meta: {
          title: 'Test Game',
          genre: 'runner',
          camera: 'side',
          dimension: '2D',
          version: '1.0',
        },
        settings: {},
        scene: { type: 'single' },
        entities: [
          {
            id: 'player',
            type: 'player',
            sprite: 'player_default',
            components: [],
          },
        ],
        systems: [],
        mechanics: [],
        scoring: { type: 'distance' },
        ui: {},
        assets: [
          {
            id: 'player_sprite',
            type: 'sprite',
            source: 'player',
          },
        ],
        extensions: {},
      };

      const result = await resolver.resolveFromGameSpec(spec);

      expect(result).toBeDefined();
      expect(result.resolved).toBeDefined();
      expect(result.resolved.length).toBeGreaterThan(0);
      expect(result.metadata.totalAssets).toBeGreaterThan(0);
    });

    it('should generate placeholders for missing assets', async () => {
      const spec: GameSpec = {
        meta: {
          title: 'Test',
          genre: 'runner',
          camera: 'side',
          dimension: '2D',
          version: '1.0',
        },
        settings: {},
        scene: { type: 'single' },
        entities: [],
        systems: [],
        mechanics: [],
        scoring: { type: 'distance' },
        ui: {},
        assets: [
          {
            id: 'missing_music',
            type: 'music',
            source: 'nonexistent',
          },
        ],
        extensions: {},
      };

      const result = await resolver.resolveFromGameSpec(spec);

      // Music assets don't have library entries, so they become placeholders
      expect(result.resolved.length).toBeGreaterThan(0);
      expect(result.resolved[0]!.sourceType).toBe('placeholder');
    });

    it('should extract implicit assets from entities', async () => {
      const spec: GameSpec = {
        meta: {
          title: 'Test',
          genre: 'runner',
          camera: 'side',
          dimension: '2D',
          version: '1.0',
        },
        settings: {},
        scene: { type: 'single' },
        entities: [
          {
            id: 'player',
            type: 'player',
            sprite: 'custom_player_sprite',
            components: [],
          },
          {
            id: 'enemy',
            type: 'enemy',
            sprite: 'custom_enemy_sprite',
            components: [],
          },
        ],
        systems: [],
        mechanics: [],
        scoring: { type: 'distance' },
        ui: {},
        assets: [],
        extensions: {},
      };

      const result = await resolver.resolveFromGameSpec(spec);

      // Should resolve implicit assets from entity sprites
      expect(result.resolved.some((a) => a.id === 'custom_player_sprite')).toBe(true);
      expect(result.resolved.some((a) => a.id === 'custom_enemy_sprite')).toBe(true);
    });
  });

  describe('resolveAsset()', () => {
    it('should resolve asset from library', async () => {
      const asset = {
        id: 'player_default',
        type: 'sprite' as const,
        source: 'player',
      };

      const resolved = await resolver.resolveAsset(asset);

      expect(resolved).toBeDefined();
      expect(resolved.sourceType).toBe('library');
      expect(resolved.resolvedUrl).toContain('/assets/');
    });

    it('should cache resolved assets', async () => {
      const asset = {
        id: 'test_cached',
        type: 'sprite' as const,
        source: 'test',
      };

      // First resolution
      await resolver.resolveAsset(asset);

      // Second resolution (should hit cache)
      await resolver.resolveAsset(asset);

      const stats = resolver.getStats();
      expect(stats.cacheHits).toBeGreaterThan(0);
    });
  });

  describe('getStats()', () => {
    it('should return resolver statistics', () => {
      const stats = resolver.getStats();

      expect(stats).toBeDefined();
      expect(stats.totalResolutions).toBeGreaterThanOrEqual(0);
      expect(stats.cacheHits).toBeGreaterThanOrEqual(0);
      expect(stats.cacheMisses).toBeGreaterThanOrEqual(0);
    });
  });

  describe('clearCache()', () => {
    it('should clear the cache', async () => {
      const asset = {
        id: 'test_clear',
        type: 'sprite' as const,
        source: 'test',
      };

      await resolver.resolveAsset(asset);
      resolver.clearCache();

      const stats = resolver.getStats();
      // After clearing, next resolution should be a cache miss
      expect(stats.cacheHits).toBe(0);
    });
  });

  describe('addToLibrary()', () => {
    it('should add entry to library', async () => {
      resolver.addToLibrary({
        id: 'custom_sprite',
        type: 'sprite',
        name: 'Custom Sprite',
        tags: ['custom', 'test'],
        path: '/assets/custom.png',
      });

      const asset = {
        id: 'custom_sprite',
        type: 'sprite' as const,
        source: 'custom',
      };

      const resolved = await resolver.resolveAsset(asset);

      expect(resolved.sourceType).toBe('library');
      expect(resolved.resolvedUrl).toBe('/assets/custom.png');
    });
  });
});
