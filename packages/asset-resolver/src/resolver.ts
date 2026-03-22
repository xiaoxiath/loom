/**
 * Asset Resolver
 *
 * Resolves game assets from library, cache, or generates placeholders
 */

import type { Asset, GameSpec } from '@loom/core';
import type {
  ResolvedAsset,
  AssetResolutionResult,
  AssetResolverConfig,
  AssetLibraryEntry,
  AssetMatchCriteria,
  AssetSourceType,
  AssetResolverStats,
} from './types';

/**
 * Default resolver configuration
 */
const DEFAULT_CONFIG: AssetResolverConfig = {
  enableCache: true,
  enablePlaceholders: true,
  urlTimeout: 5000,
  enableOptimization: false,
};

/**
 * Asset Resolver Agent
 *
 * Responsible for:
 * - Resolving assets from library
 * - Generating placeholder assets
 * - Caching resolved assets
 * - Optimizing assets
 */
export class AssetResolver {
  private config: AssetResolverConfig;
  private cache: Map<string, ResolvedAsset> = new Map();
  private library: Map<string, AssetLibraryEntry[]> = new Map();
  private stats: AssetResolverStats = {
    totalResolutions: 0,
    cacheHits: 0,
    cacheMisses: 0,
    libraryMatches: 0,
    generatedAssets: 0,
    placeholderAssets: 0,
    avgResolutionTime: 0,
  };

  constructor(config: Partial<AssetResolverConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initializeLibrary();
  }

  /**
   * Initialize asset library with placeholder entries
   */
  private initializeLibrary(): void {
    // Try to load from asset-manifest.json
    try {
      // In a real implementation, this would load from actual file
      // For now, we'll use hardcoded entries that match asset-manifest.json

      const sprites: AssetLibraryEntry[] = [
        {
          id: 'player_default',
          type: 'sprite',
          name: 'Default Player',
          tags: ['player', 'character', 'default'],
          path: '/assets/sprites/player_default.png',
          metadata: { width: 32, height: 32, format: 'png' },
        },
        {
          id: 'player_bird',
          type: 'sprite',
          name: 'Bird Player',
          tags: ['player', 'bird', 'flappy', 'character'],
          path: '/assets/sprites/player_bird.png',
          metadata: { width: 34, height: 24, format: 'png' },
        },
        {
          id: 'player_ship',
          type: 'sprite',
          name: 'Spaceship Player',
          tags: ['player', 'ship', 'spaceship', 'shooter', 'character'],
          path: '/assets/sprites/player_ship.png',
          metadata: { width: 32, height: 32, format: 'png' },
        },
        {
          id: 'player_runner',
          type: 'sprite',
          name: 'Runner Player',
          tags: ['player', 'runner', 'character'],
          path: '/assets/sprites/player_runner.png',
          metadata: { width: 32, height: 32, format: 'png' },
        },
        {
          id: 'enemy_default',
          type: 'sprite',
          name: 'Default Enemy',
          tags: ['enemy', 'character', 'default'],
          path: '/assets/sprites/enemy_default.png',
          metadata: { width: 32, height: 32, format: 'png' },
        },
        {
          id: 'obstacle_pipe',
          type: 'sprite',
          name: 'Pipe Obstacle',
          tags: ['obstacle', 'pipe', 'flappy'],
          path: '/assets/sprites/obstacle_pipe.png',
          metadata: { width: 52, height: 320, format: 'png' },
        },
        {
          id: 'obstacle_asteroid',
          type: 'sprite',
          name: 'Asteroid',
          tags: ['obstacle', 'asteroid', 'space', 'shooter'],
          path: '/assets/sprites/obstacle_asteroid.png',
          metadata: { width: 48, height: 48, format: 'png' },
        },
        {
          id: 'obstacle_spike',
          type: 'sprite',
          name: 'Spike Obstacle',
          tags: ['obstacle', 'spike', 'runner'],
          path: '/assets/sprites/obstacle_spike.png',
          metadata: { width: 32, height: 32, format: 'png' },
        },
      ];

      const backgrounds: AssetLibraryEntry[] = [
        {
          id: 'sky_blue',
          type: 'background',
          name: 'Blue Sky',
          tags: ['sky', 'background', 'blue', 'default'],
          path: '/assets/backgrounds/sky_blue.png',
          metadata: { width: 1920, height: 1080, format: 'png' },
        },
        {
          id: 'space_stars',
          type: 'background',
          name: 'Starfield Space',
          tags: ['space', 'background', 'stars', 'shooter'],
          path: '/assets/backgrounds/space_stars.png',
          metadata: { width: 1920, height: 1080, format: 'png' },
        },
        {
          id: 'ground_grass',
          type: 'background',
          name: 'Grass Ground',
          tags: ['ground', 'background', 'grass', 'platformer'],
          path: '/assets/backgrounds/ground_grass.png',
          metadata: { width: 1920, height: 1080, format: 'png' },
        },
      ];

      this.library.set('sprite', sprites);
      this.library.set('background', backgrounds);
    } catch (error) {
      console.warn('Failed to load asset library:', error);
    }
  }

  /**
   * Resolve all assets from a GameSpec
   */
  async resolveFromGameSpec(spec: GameSpec): Promise<AssetResolutionResult> {
    const startTime = Date.now();
    const resolved: ResolvedAsset[] = [];
    const failed: Array<{ asset: Asset; error: string }> = [];
    const placeholders: ResolvedAsset[] = [];

    for (const asset of spec.assets) {
      try {
        const resolvedAsset = await this.resolveAsset(asset);

        if (resolvedAsset.sourceType === 'placeholder') {
          placeholders.push(resolvedAsset);
        }

        resolved.push(resolvedAsset);
      } catch (error: any) {
        failed.push({
          asset,
          error: error.message || 'Unknown error',
        });

        // Generate placeholder if enabled
        if (this.config.enablePlaceholders) {
          const placeholder = this.generatePlaceholder(asset);
          placeholders.push(placeholder);
          resolved.push(placeholder);
        }
      }
    }

    // Also resolve implicit assets (sprites referenced in entities)
    const implicitAssets = this.extractImplicitAssets(spec);
    for (const asset of implicitAssets) {
      if (!resolved.find((r) => r.id === asset.id)) {
        try {
          const resolvedAsset = await this.resolveAsset(asset);
          resolved.push(resolvedAsset);
        } catch (error: any) {
          if (this.config.enablePlaceholders) {
            const placeholder = this.generatePlaceholder(asset);
            resolved.push(placeholder);
          }
        }
      }
    }

    const endTime = Date.now();
    this.updateStats(endTime - startTime);

    return {
      resolved,
      failed,
      placeholders,
      metadata: {
        totalAssets: spec.assets.length + implicitAssets.length,
        resolvedCount: resolved.length,
        failedCount: failed.length,
        placeholderCount: placeholders.length,
        resolutionTime: endTime - startTime,
      },
    };
  }

  /**
   * Resolve a single asset
   */
  async resolveAsset(asset: Asset): Promise<ResolvedAsset> {
    // Check cache first
    if (this.config.enableCache) {
      const cached = this.cache.get(asset.id);
      if (cached) {
        this.stats.cacheHits++;
        return cached;
      }
    }

    this.stats.cacheMisses++;

    let resolved: ResolvedAsset;

    // Try library first
    const libraryMatch = this.searchLibrary({
      type: asset.type,
      keywords: [asset.id, asset.source],
    });

    if (libraryMatch) {
      resolved = this.createFromLibraryEntry(libraryMatch, asset);
      this.stats.libraryMatches++;
    } else if (asset.url) {
      // Use provided URL
      resolved = this.createFromUrl(asset);
    } else {
      // Generate placeholder
      resolved = this.generatePlaceholder(asset);
      this.stats.placeholderAssets++;
    }

    // Cache the result
    if (this.config.enableCache) {
      this.cache.set(asset.id, resolved);
    }

    return resolved;
  }

  /**
   * Search asset library for matching entry
   */
  private searchLibrary(criteria: AssetMatchCriteria): AssetLibraryEntry | null {
    const entries = this.library.get(criteria.type) || [];

    // Simple keyword matching
    for (const entry of entries) {
      const keywords = criteria.keywords || [];
      const matches = keywords.some((keyword) =>
        entry.tags.includes(keyword.toLowerCase()) ||
        entry.name.toLowerCase().includes(keyword.toLowerCase()) ||
        entry.id.toLowerCase().includes(keyword.toLowerCase())
      );

      if (matches) {
        return entry;
      }
    }

    // Return first entry as fallback
    return entries[0] || null;
  }

  /**
   * Create resolved asset from library entry
   */
  private createFromLibraryEntry(entry: AssetLibraryEntry, original: Asset): ResolvedAsset {
    const resolved: ResolvedAsset = {
      ...original,
      sourceType: 'library' as AssetSourceType,
      resolvedUrl: entry.path,
      format: entry.metadata?.format ?? 'unknown',
      cacheKey: `library:${entry.id}`,
    };

    if (entry.metadata?.width !== undefined && entry.metadata?.height !== undefined) {
      resolved.dimensions = { width: entry.metadata.width, height: entry.metadata.height };
    }

    return resolved;
  }

  /**
   * Create resolved asset from URL
   */
  private createFromUrl(asset: Asset): ResolvedAsset {
    return {
      ...asset,
      sourceType: 'url' as AssetSourceType,
      resolvedUrl: asset.url!,
      cacheKey: `url:${asset.id}`,
    };
  }

  /**
   * Generate placeholder asset
   */
  private generatePlaceholder(asset: Asset): ResolvedAsset {
    // Generate a simple placeholder based on asset type
    const placeholders: Record<string, string> = {
      sprite: '/assets/placeholders/sprite_placeholder.png',
      background: '/assets/placeholders/background_placeholder.png',
      music: '/assets/placeholders/music_placeholder.mp3',
      sound: '/assets/placeholders/sound_placeholder.mp3',
      ui: '/assets/placeholders/ui_placeholder.png',
    };

    const placeholderUrl = placeholders[asset.type] ?? placeholders.sprite!;

    return {
      ...asset,
      sourceType: 'placeholder' as AssetSourceType,
      resolvedUrl: placeholderUrl,
      dimensions: { width: 32, height: 32 },
      format: 'png',
      cacheKey: `placeholder:${asset.id}`,
    };
  }

  /**
   * Extract implicit assets from GameSpec (e.g., sprites referenced in entities)
   */
  private extractImplicitAssets(spec: GameSpec): Asset[] {
    const assets: Asset[] = [];
    const seen = new Set<string>();

    // Extract from entities
    for (const entity of spec.entities) {
      if (entity.sprite && !seen.has(entity.sprite)) {
        seen.add(entity.sprite);
        assets.push({
          id: entity.sprite,
          type: 'sprite',
          source: entity.sprite,
        });
      }
    }

    return assets;
  }

  /**
   * Update resolution statistics
   */
  private updateStats(resolutionTime: number): void {
    this.stats.totalResolutions++;
    this.stats.avgResolutionTime =
      (this.stats.avgResolutionTime * (this.stats.totalResolutions - 1) + resolutionTime) /
      this.stats.totalResolutions;
  }

  /**
   * Get resolver statistics
   */
  getStats(): AssetResolverStats {
    return { ...this.stats };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Add entry to library
   */
  addToLibrary(entry: AssetLibraryEntry): void {
    const entries = this.library.get(entry.type) || [];
    entries.push(entry);
    this.library.set(entry.type, entries);
  }

  /**
   * Load library from entries
   */
  loadLibrary(entries: AssetLibraryEntry[]): void {
    for (const entry of entries) {
      this.addToLibrary(entry);
    }
  }
}
