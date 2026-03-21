/**
 * Unit tests for Code Generator
 */

import { CodeGenerator } from '../src/generator';
import type { CodeGeneratorInput } from '../src/types';
import type { GameSpec } from '@loom/core';

describe('CodeGenerator', () => {
  let generator: CodeGenerator;

  beforeEach(() => {
    generator = new CodeGenerator();
  });

  describe('generate()', () => {
    it('should generate basic Phaser project files', () => {
      const input: CodeGeneratorInput = {
        gameSpec: {
          meta: {
            title: 'Test Game',
            genre: 'action',
            camera: 'side',
            dimension: '2d',
          },
          settings: {
            gravity: 980,
            worldBounds: { width: 800, height: 600 },
            backgroundColor: '#000000',
          },
          scene: {
            type: 'main',
          },
          entities: [
            {
              id: 'player',
              type: 'player',
              sprite: 'player_ship',
              position: { x: 100, y: 300 },
              physics: {
                gravity: true,
                collidable: true,
              },
            },
          ],
          systems: ['physics', 'collision', 'input'],
          mechanics: ['jump'],
          scoring: {
            type: 'score',
            increment: 10,
          },
          ui: {},
          assets: [],
          extensions: {},
        },
        sceneGraph: {
          scenes: [{ id: 'main', type: 'main', entities: ['player'] }],
          camera: { follow: 'player' },
          worldBounds: { width: 800, height: 600 },
        },
        entityGraph: {
          nodes: [{ id: 'player', type: 'player', position: { x: 100, y: 300 }, children: [] }],
          edges: [],
        },
        componentGraph: {
          entityComponents: {
            player: ['jump', 'gravity'],
          },
        },
        systemGraph: {
          systems: [
            { type: 'physics', enabled: true },
            { type: 'collision', enabled: true },
            { type: 'input', enabled: true },
          ],
          dependencies: [],
        },
        adapterBindings: [],
      };

      const output = generator.generate(input);

      // Check that files were generated
      expect(output.files.length).toBeGreaterThan(0);
      expect(output.diagnostics.generatedFiles.length).toBeGreaterThan(0);

      // Check for required files
      const filePaths = output.files.map(f => f.path);
      expect(filePaths).toContain('package.json');
      expect(filePaths).toContain('index.html');
      expect(filePaths).toContain('src/config.ts');
      expect(filePaths).toContain('src/scenes/MainScene.ts');
      expect(filePaths).toContain('src/main.ts');

      // Check dependencies
      expect(output.dependencies).toHaveProperty('phaser');
    });

    it('should generate package.json with correct game name', () => {
      const input: CodeGeneratorInput = {
        gameSpec: {
          meta: {
            title: 'My Awesome Game',
            genre: 'action',
            camera: 'side',
            dimension: '2d',
          },
          settings: {},
          scene: { type: 'main' },
          entities: [],
          systems: [],
          mechanics: [],
          scoring: { type: 'none' },
          ui: {},
          assets: [],
          extensions: {},
        },
        sceneGraph: {
          scenes: [],
          camera: {},
          worldBounds: {},
        },
        entityGraph: {
          nodes: [],
          edges: [],
        },
        componentGraph: {
          entityComponents: {},
        },
        systemGraph: {
          systems: [],
          dependencies: [],
        },
        adapterBindings: [],
      };

      const output = generator.generate(input);

      const packageJsonFile = output.files.find(f => f.path === 'package.json');
      expect(packageJsonFile).toBeDefined();

      const packageJson = JSON.parse(packageJsonFile!.content);
      expect(packageJson.name).toContain('my-awesome-game');
    });

    it('should generate MainScene with player entity', () => {
      const input: CodeGeneratorInput = {
        gameSpec: {
          meta: {
            title: 'Test Game',
            genre: 'action',
            camera: 'side',
            dimension: '2d',
          },
          settings: {},
          scene: { type: 'main' },
          entities: [
            {
              id: 'player',
              type: 'player',
              sprite: 'player_ship',
              position: { x: 200, y: 400 },
            },
          ],
          systems: [],
          mechanics: [],
          scoring: { type: 'none' },
          ui: {},
          assets: [],
          extensions: {},
        },
        sceneGraph: {
          scenes: [{ id: 'main', type: 'main', entities: ['player'] }],
          camera: { follow: 'player' },
          worldBounds: {},
        },
        entityGraph: {
          nodes: [{ id: 'player', type: 'player', position: { x: 200, y: 400 }, children: [] }],
          edges: [],
        },
        componentGraph: {
          entityComponents: {},
        },
        systemGraph: {
          systems: [],
          dependencies: [],
        },
        adapterBindings: [],
      };

      const output = generator.generate(input);

      const sceneFile = output.files.find(f => f.path === 'src/scenes/MainScene.ts');
      expect(sceneFile).toBeDefined();
      expect(sceneFile!.content).toContain('private player!');
      expect(sceneFile!.content).toContain('200, 400');
      expect(sceneFile!.content).toContain('player_ship');
    });
  });
});
