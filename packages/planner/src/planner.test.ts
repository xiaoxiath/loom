import { PlannerAgent } from '../src/planner';
import type { GameSpec } from '@loom/core';

describe('PlannerAgent', () => {
  let planner: PlannerAgent;

  beforeEach(() => {
    planner = new PlannerAgent();
  });

  describe('plan()', () => {
    it('should generate graphs from minimal GameSpec', async () => {
      const spec: GameSpec = {
        meta: {
          title: 'Test Game',
          genre: 'runner',
          camera: 'side',
          dimension: '2D',
          version: '1.0',
        },
        settings: {
          gravity: 980,
        },
        scene: {
          type: 'single',
        },
        entities: [
          {
            id: 'player',
            type: 'player',
            sprite: 'player_sprite',
            components: ['jump'],
          },
        ],
        systems: ['physics'],
        mechanics: ['jump'],
        scoring: {
          type: 'distance',
        },
        ui: {},
        assets: [],
        extensions: {},
      };

      const result = await planner.plan(spec);

      expect(result).toBeDefined();
      expect(result.sceneGraph).toBeDefined();
      expect(result.entityGraph).toBeDefined();
      expect(result.componentGraph).toBeDefined();
      expect(result.systemGraph).toBeDefined();
      expect(result.diagnostics).toBeDefined();
    });

    it('should throw error if no player entity', async () => {
      const spec = {
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
            id: 'enemy',
            type: 'enemy',
            sprite: 'enemy',
            components: [],
          },
        ],
        systems: [],
        mechanics: [],
        scoring: { type: 'distance' },
        ui: {},
        assets: [],
        extensions: {},
      } as GameSpec;

      await expect(planner.plan(spec)).rejects.toThrow('must have at least one player entity');
    });

    it('should throw error on duplicate entity IDs', async () => {
      const spec = {
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
            sprite: 'player1',
            components: [],
          },
          {
            id: 'player',
            type: 'enemy',
            sprite: 'player2',
            components: [],
          },
        ],
        systems: [],
        mechanics: [],
        scoring: { type: 'distance' },
        ui: {},
        assets: [],
        extensions: {},
      } as GameSpec;

      await expect(planner.plan(spec)).rejects.toThrow('Duplicate entity IDs');
    });
  });

  describe('SceneGraph generation', () => {
    it('should create scene with correct entities', async () => {
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
            sprite: 'player',
            components: [],
          },
          {
            id: 'enemy1',
            type: 'enemy',
            sprite: 'enemy',
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

      const result = await planner.plan(spec);

      expect(result.sceneGraph.scenes).toHaveLength(1);
      expect(result.sceneGraph.scenes[0]!.id).toBe('main');
      expect(result.sceneGraph.scenes[0]!.entities).toContain('player');
      expect(result.sceneGraph.scenes[0]!.entities).toContain('enemy1');
    });

    it('should set camera to follow player', async () => {
      const spec: GameSpec = {
        meta: {
          title: 'Test',
          genre: 'runner',
          camera: 'side',
          dimension: '2D',
          version: '1.0',
        },
        settings: {},
        scene: { type: 'single', cameraFollow: 'player' },
        entities: [
          {
            id: 'player',
            type: 'player',
            sprite: 'player',
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

      const result = await planner.plan(spec);

      expect(result.sceneGraph.camera.follow).toBe('player');
    });
  });

  describe('EntityGraph generation', () => {
    it('should create entity nodes', async () => {
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
            sprite: 'player',
            position: { x: 100, y: 200 },
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

      const result = await planner.plan(spec);

      expect(result.entityGraph.nodes).toHaveLength(1);
      expect(result.entityGraph.nodes[0]!.id).toBe('player');
      expect(result.entityGraph.nodes[0]!.position).toEqual({ x: 100, y: 200 });
    });
  });

  describe('ComponentGraph generation', () => {
    it('should map components to entities', async () => {
      const spec: GameSpec = {
        meta: {
          title: 'Test',
          genre: 'runner',
          camera: 'side',
          dimension: '2D',
          version: '1.0',
        },
        settings: { gravity: 980 },
        scene: { type: 'single' },
        entities: [
          {
            id: 'player',
            type: 'player',
            sprite: 'player',
            components: ['jump'],
          },
        ],
        systems: [],
        mechanics: ['jump'],
        scoring: { type: 'distance' },
        ui: {},
        assets: [],
        extensions: {},
      };

      const result = await planner.plan(spec);

      expect(result.componentGraph.entityComponents['player']).toBeDefined();
      expect(result.componentGraph.entityComponents['player']).toContain('jump');
      // Should auto-add gravity dependency
      expect(result.componentGraph.entityComponents['player']).toContain('gravity');
    });
  });

  describe('SystemGraph generation', () => {
    it('should include physics when gravity is set', async () => {
      const spec: GameSpec = {
        meta: {
          title: 'Test',
          genre: 'runner',
          camera: 'side',
          dimension: '2D',
          version: '1.0',
        },
        settings: { gravity: 980 },
        scene: { type: 'single' },
        entities: [
          {
            id: 'player',
            type: 'player',
            sprite: 'player',
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

      const result = await planner.plan(spec);

      const physicsSystem = result.systemGraph.systems.find(
        (s) => s.type === 'physics'
      );
      expect(physicsSystem).toBeDefined();
      expect(physicsSystem?.enabled).toBe(true);
    });

    it('should include collision when entities are collidable', async () => {
      const spec: GameSpec = {
        meta: {
          title: 'Test',
          genre: 'runner',
          camera: 'side',
          dimension: '2D',
          version: '1.0',
        },
        settings: { gravity: 980 },
        scene: { type: 'single' },
        entities: [
          {
            id: 'player',
            type: 'player',
            sprite: 'player',
            components: [],
            physics: { collidable: true },
          },
        ],
        systems: [],
        mechanics: [],
        scoring: { type: 'distance' },
        ui: {},
        assets: [],
        extensions: {},
      };

      const result = await planner.plan(spec);

      const collisionSystem = result.systemGraph.systems.find(
        (s) => s.type === 'collision'
      );
      expect(collisionSystem).toBeDefined();
    });
  });

  describe('Auto-completion', () => {
    it('should auto-complete player position', async () => {
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
            sprite: 'player',
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

      const result = await planner.plan(spec);

      expect(result.diagnostics.autoFixes).toContainEqual(
        expect.stringContaining('default position')
      );
    });

    it('should infer components from mechanics', async () => {
      const spec: GameSpec = {
        meta: {
          title: 'Test',
          genre: 'runner',
          camera: 'side',
          dimension: '2D',
          version: '1.0',
        },
        settings: { gravity: 980 },
        scene: { type: 'single' },
        entities: [
          {
            id: 'player',
            type: 'player',
            sprite: 'player',
            components: [],
          },
        ],
        systems: [],
        mechanics: ['jump', 'shoot'],
        scoring: { type: 'distance' },
        ui: {},
        assets: [],
        extensions: {},
      };

      const result = await planner.plan(spec);

      expect(result.componentGraph.entityComponents['player']).toContain('jump');
      expect(result.componentGraph.entityComponents['player']).toContain('shoot');
      expect(result.componentGraph.entityComponents['player']).toContain('gravity');
      expect(result.componentGraph.entityComponents['player']).toContain(
        'keyboardInput'
      );
    });
  });
});
