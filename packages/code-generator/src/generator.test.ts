/**
 * Unit tests for Code Generator
 */

import { CodeGenerator } from '../src/generator';
import type { CodeGeneratorInput } from '../src/types';

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
            version: '1.0.0',
            genre: 'platformer',
            camera: 'side',
            dimension: '2D',
          },
          settings: {
            gravity: 980,
            worldWidth: 800,
            worldHeight: 600,
            backgroundColor: '#000000',
          },
          scene: {
            type: 'single',
          },
          entities: [
            {
              id: 'player',
              type: 'player',
              sprite: 'player_ship',
              position: { x: 100, y: 300 },
              components: [],
              physics: {
                gravity: true,
                collidable: true,
              },
            },
          ],
          systems: ['physics', 'collision', 'input'],
          mechanics: ['jump'],
          scoring: {
            type: 'collect',
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
            version: '1.0.0',
            genre: 'platformer',
            camera: 'side',
            dimension: '2D',
          },
          settings: {},
          scene: { type: 'single' },
          entities: [],
          systems: [],
          mechanics: [],
          scoring: { type: 'collect' },
          ui: {},
          assets: [],
          extensions: {},
        },
        sceneGraph: {
          scenes: [],
          camera: { follow: '' },
          worldBounds: { width: 800, height: 600 },
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
            version: '1.0.0',
            genre: 'platformer',
            camera: 'side',
            dimension: '2D',
          },
          settings: {},
          scene: { type: 'single' },
          entities: [
            {
              id: 'player',
              type: 'player',
              sprite: 'player_ship',
              position: { x: 200, y: 400 },
              components: [],
            },
          ],
          systems: [],
          mechanics: [],
          scoring: { type: 'collect' },
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
