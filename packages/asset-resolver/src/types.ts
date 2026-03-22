/**
 * Asset Resolution Types
 *
 * Defines types for asset resolution, caching, and optimization
 */

import type { Asset, AssetType } from '@loom/core';

/**
 * Asset source type
 */
export type AssetSourceType =
  | 'library' // From asset library (e.g., Kenney assets)
  | 'url' // External URL
  | 'generated' // AI-generated
  | 'placeholder'; // Temporary placeholder

/**
 * Resolved asset with full metadata
 */
export interface ResolvedAsset extends Asset {
  /** Source type */
  sourceType: AssetSourceType;

  /** Resolved URL (local or remote) */
  resolvedUrl: string;

  /** Asset dimensions (for sprites) */
  dimensions?: {
    width: number;
    height: number;
  };

  /** File size in bytes */
  size?: number;

  /** Format (png, jpg, mp3, etc.) */
  format?: string;

  /** Optimization metadata */
  optimized?: boolean;

  /** Cache key */
  cacheKey?: string;
}

/**
 * Asset resolution result
 */
export interface AssetResolutionResult {
  /** Successfully resolved assets */
  resolved: ResolvedAsset[];

  /** Failed to resolve */
  failed: Array<{
    asset: Asset;
    error: string;
  }>;

  /** Placeholder assets (temporary) */
  placeholders: ResolvedAsset[];

  /** Resolution metadata */
  metadata: {
    totalAssets: number;
    resolvedCount: number;
    failedCount: number;
    placeholderCount: number;
    resolutionTime: number;
  };
}

/**
 * Asset resolver configuration
 */
export interface AssetResolverConfig {
  /** Enable asset caching */
  enableCache: boolean;

  /** Cache directory */
  cacheDir?: string;

  /** Enable placeholder generation for missing assets */
  enablePlaceholders: boolean;

  /** Asset library path */
  libraryPath?: string;

  /** Timeout for external URL resolution (ms) */
  urlTimeout: number;

  /** Enable asset optimization */
  enableOptimization: boolean;

  /** Preferred sprite dimensions */
  preferredSpriteSize?: {
    width: number;
    height: number;
  };
}

/**
 * Asset library entry
 */
export interface AssetLibraryEntry {
  /** Asset ID */
  id: string;

  /** Asset type */
  type: AssetType;

  /** Asset name/description */
  name: string;

  /** Tags for search */
  tags: string[];

  /** File path in library */
  path: string;

  /** Metadata */
  metadata?: {
    width?: number;
    height?: number;
    format?: string;
    size?: number;
  };
}

/**
 * Asset matcher criteria
 */
export interface AssetMatchCriteria {
  /** Asset type */
  type: AssetType;

  /** Keywords/tags to match */
  keywords?: string[];

  /** Preferred dimensions */
  dimensions?: {
    width: number;
    height: number;
  };

  /** Style (e.g., 'pixel', 'cartoon', 'realistic') */
  style?: string;
}

/**
 * Asset resolver statistics
 */
export interface AssetResolverStats {
  /** Total resolutions */
  totalResolutions: number;

  /** Cache hits */
  cacheHits: number;

  /** Cache misses */
  cacheMisses: number;

  /** Library matches */
  libraryMatches: number;

  /** Generated assets */
  generatedAssets: number;

  /** Placeholder assets */
  placeholderAssets: number;

  /** Average resolution time */
  avgResolutionTime: number;
}
