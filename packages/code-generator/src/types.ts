/**
 * Code Generator types
 *
 * Defines input/output structures for code generation
 */

import type {
  SceneGraph,
  EntityGraph,
  ComponentGraph,
  SystemGraph,
  GameSpec,
  AdapterBinding,
} from '@loom/core';
import type { ResolvedAsset } from '@loom/asset-resolver';

/**
 * Code Generator input
 */
export interface CodeGeneratorInput {
  sceneGraph: SceneGraph;
  entityGraph: EntityGraph;
  componentGraph: ComponentGraph;
  systemGraph: SystemGraph;
  adapterBindings: AdapterBinding[];
  gameSpec: GameSpec;
  resolvedAssets?: ResolvedAsset[];
}

/**
 * Generated file
 */
export interface GeneratedFile {
  path: string;
  content: string;
  type: 'scene' | 'entity' | 'system' | 'config' | 'asset' | 'html' | 'package';
}

/**
 * Code Generator output
 */
export interface CodeGeneratorOutput {
  files: GeneratedFile[];
  dependencies: Record<string, string>;
  entryPoint: string;
  diagnostics: GeneratorDiagnostics;
}

/**
 * Generator diagnostics
 */
export interface GeneratorDiagnostics {
  warnings: string[];
  errors: string[];
  generatedFiles: string[];
  skippedFiles: string[];
  /** Generation method used */
  generationMethod?: 'llm' | 'template' | 'template-fallback';
  /** LLM call latency in milliseconds */
  llmLatencyMs?: number;
  /** LLM token usage */
  llmTokenUsage?: {
    prompt: number;
    completion: number;
    total: number;
  };
}

/**
 * Code generation options
 */
export interface CodeGeneratorOptions {
  outputDir: string;
  engine: 'phaser';
  template: 'basic' | 'advanced';
  minify: boolean;
  sourceMap: boolean;
}

/**
 * Template variable context
 */
export interface TemplateContext {
  game: {
    title: string;
    width: number;
    height: number;
    backgroundColor: string;
  };
  scene: {
    name: string;
    key: string;
  };
  entities: EntityTemplateData[];
  systems: SystemTemplateData[];
}

/**
 * Entity template data
 */
export interface EntityTemplateData {
  id: string;
  type: string;
  x: number;
  y: number;
  sprite: string;
  components: ComponentTemplateData[];
}

/**
 * Component template data
 */
export interface ComponentTemplateData {
  type: string;
  config: Record<string, unknown>;
}

/**
 * System template data
 */
export interface SystemTemplateData {
  type: string;
  enabled: boolean;
  config?: Record<string, unknown>;
}
