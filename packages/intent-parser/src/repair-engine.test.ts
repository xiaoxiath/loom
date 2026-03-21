/**
 * Tests for Semantic Repair Engine
 */

import { repairSpec } from '../src/repair-engine';

describe('Semantic Repair Engine', () => {
  describe('add-gravity-for-jump', () => {
    it('should add gravity when jump component is used', () => {
      const spec = {
        meta: { title: 'Test', genre: 'jumper' },
        settings: { gravity: 0 },
        entities: [
          {
            id: 'player',
            type: 'player',
            components: ['jump'],
          },
        ],
      };

      const { spec: repaired, repairs } = repairSpec(spec);

      expect(repairs).toContain('add-gravity-for-jump');
      expect(repaired.settings.gravity).toBe(980);
      expect(repaired.mechanics).toContain('gravity');
    });

    it('should not modify if gravity already exists', () => {
      const spec = {
        meta: { title: 'Test' },
        settings: { gravity: 980 },
        entities: [{ id: 'player', type: 'player', components: ['jump'] }],
      };

      const { repairs } = repairSpec(spec);

      expect(repairs).not.toContain('add-gravity-for-jump');
    });
  });

  describe('add-input-system-for-movement', () => {
    it('should add input system when movement is used', () => {
      const spec = {
        meta: { title: 'Test' },
        entities: [{ id: 'player', type: 'player', components: ['movement'] }],
        systems: [],
      };

      const { spec: repaired, repairs } = repairSpec(spec);

      expect(repairs).toContain('add-input-system-for-movement');
      expect(repaired.systems).toContain('input');
    });

    it('should add input system when jump is used', () => {
      const spec = {
        meta: { title: 'Test' },
        entities: [{ id: 'player', type: 'player', components: ['jump'] }],
        systems: [],
      };

      const { spec: repaired, repairs } = repairSpec(spec);

      expect(repairs).toContain('add-input-system-for-movement');
      expect(repaired.systems).toContain('input');
    });
  });

  describe('add-collision-system', () => {
    it('should add collision system for collidable entities', () => {
      const spec = {
        meta: { title: 'Test' },
        entities: [
          {
            id: 'player',
            type: 'player',
            physics: { collidable: true },
          },
        ],
        systems: [],
      };

      const { spec: repaired, repairs } = repairSpec(spec);

      expect(repairs).toContain('add-collision-system');
      expect(repaired.systems).toContain('collision');
    });
  });

  describe('add-physics-system', () => {
    it('should add physics system when gravity is enabled', () => {
      const spec = {
        meta: { title: 'Test' },
        settings: { gravity: 980 },
        systems: [],
      };

      const { spec: repaired, repairs } = repairSpec(spec);

      expect(repairs).toContain('add-physics-system');
      expect(repaired.systems).toContain('physics');
    });
  });

  describe('add-default-scoring', () => {
    it('should add default scoring if missing', () => {
      const spec = {
        meta: { title: 'Test' },
      };

      const { spec: repaired, repairs } = repairSpec(spec);

      expect(repairs).toContain('add-default-scoring');
      expect(repaired.scoring).toEqual({
        type: 'distance',
        increment: 1,
      });
    });
  });

  describe('add-default-ui', () => {
    it('should add default UI if missing', () => {
      const spec = {
        meta: { title: 'Test' },
      };

      const { spec: repaired, repairs } = repairSpec(spec);

      expect(repairs).toContain('add-default-ui');
      expect(repaired.ui).toEqual({
        hud: ['score'],
        startScreen: true,
        gameOverScreen: true,
      });
    });
  });

  describe('add-default-camera-follow', () => {
    it('should add camera follow if missing', () => {
      const spec = {
        scene: { type: 'single' },
      };

      const { spec: repaired, repairs } = repairSpec(spec);

      expect(repairs).toContain('add-default-camera-follow');
      expect(repaired.scene.cameraFollow).toBe('player');
    });
  });

  describe('fix-topdown-gravity', () => {
    it('should remove gravity for topdown games', () => {
      const spec = {
        meta: { camera: 'topdown' },
        settings: { gravity: 980 },
      };

      const { spec: repaired, repairs } = repairSpec(spec);

      expect(repairs).toContain('fix-topdown-gravity');
      expect(repaired.settings.gravity).toBe(0);
    });

    it('should not modify gravity for side games', () => {
      const spec = {
        meta: { camera: 'side' },
        settings: { gravity: 980 },
      };

      const { repairs } = repairSpec(spec);

      expect(repairs).not.toContain('fix-topdown-gravity');
    });
  });

  describe('ensure-player-exists', () => {
    it('should add player entity if missing', () => {
      const spec = {
        meta: { title: 'Test' },
        entities: [],
      };

      const { spec: repaired, repairs } = repairSpec(spec);

      expect(repairs).toContain('ensure-player-exists');
      expect(repaired.entities).toHaveLength(1);
      expect(repaired.entities[0].type).toBe('player');
    });

    it('should not add player if already exists', () => {
      const spec = {
        meta: { title: 'Test' },
        entities: [{ id: 'player', type: 'player' }],
      };

      const { repairs } = repairSpec(spec);

      expect(repairs).not.toContain('ensure-player-exists');
    });
  });

  describe('multiple repairs', () => {
    it('should apply multiple repairs in sequence', () => {
      const spec = {
        meta: { title: 'Test', camera: 'side' },
        settings: {},
        entities: [{ id: 'player', type: 'player', components: ['jump'], physics: { collidable: true } }],
        systems: [],
      };

      const { spec: repaired, repairs } = repairSpec(spec);

      expect(repairs).toContain('add-gravity-for-jump');
      expect(repairs).toContain('add-input-system-for-movement');
      expect(repairs).toContain('add-collision-system');
      expect(repairs).toContain('add-physics-system');
      expect(repairs).toContain('add-default-scoring');
      expect(repairs).toContain('add-default-ui');

      expect(repaired.settings.gravity).toBe(980);
      expect(repaired.systems).toContain('input');
      expect(repaired.systems).toContain('collision');
      expect(repaired.systems).toContain('physics');
      expect(repaired.scoring).toBeDefined();
      expect(repaired.ui).toBeDefined();
    });
  });

  describe('immutable repair', () => {
    it('should not modify original spec', () => {
      const spec = {
        meta: { title: 'Test' },
        entities: [],
      };

      const originalJson = JSON.stringify(spec);
      repairSpec(spec);

      expect(JSON.stringify(spec)).toBe(originalJson);
    });
  });
});
