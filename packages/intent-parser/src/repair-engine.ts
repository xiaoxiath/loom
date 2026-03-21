/**
 * Semantic Repair Engine
 *
 * Automatically fixes common issues in generated GameSpecs
 */

export interface RepairRule {
  name: string;
  description: string;
  match: (spec: any) => boolean;
  repair: (spec: any) => any;
}

/**
 * Built-in repair rules
 */
export const REPAIR_RULES: RepairRule[] = [
  {
    name: 'add-gravity-for-jump',
    description: 'Add gravity to settings when jump component is used',
    match: (spec: any) => {
      if (!spec.entities || !Array.isArray(spec.entities)) return false;

      const hasJump = spec.entities.some((e: any) =>
        e.components && e.components.includes('jump')
      );

      const hasGravity = spec.settings?.gravity && spec.settings.gravity > 0;

      return hasJump && !hasGravity;
    },
    repair: (spec: any) => {
      if (!spec.settings) spec.settings = {};
      spec.settings.gravity = 980;

      if (!spec.mechanics) spec.mechanics = [];
      if (!spec.mechanics.includes('gravity')) {
        spec.mechanics.push('gravity');
      }

      return spec;
    },
  },

  {
    name: 'add-input-system-for-movement',
    description: 'Add input system when movement or jump components are used',
    match: (spec: any) => {
      if (!spec.entities || !Array.isArray(spec.entities)) return false;

      const hasMovement = spec.entities.some(
        (e: any) =>
          e.components &&
          (e.components.includes('movement') || e.components.includes('jump'))
      );

      const hasInput = spec.systems && spec.systems.includes('input');

      return hasMovement && !hasInput;
    },
    repair: (spec: any) => {
      if (!spec.systems) spec.systems = [];
      if (!spec.systems.includes('input')) {
        spec.systems.push('input');
      }
      return spec;
    },
  },

  {
    name: 'add-collision-system',
    description: 'Add collision system when entities are collidable',
    match: (spec: any) => {
      if (!spec.entities || !Array.isArray(spec.entities)) return false;

      const hasCollidables = spec.entities.some(
        (e: any) => e.physics && e.physics.collidable
      );

      const hasCollision = spec.systems && spec.systems.includes('collision');

      return hasCollidables && !hasCollision;
    },
    repair: (spec: any) => {
      if (!spec.systems) spec.systems = [];
      if (!spec.systems.includes('collision')) {
        spec.systems.push('collision');
      }
      return spec;
    },
  },

  {
    name: 'add-physics-system',
    description: 'Add physics system when gravity is enabled',
    match: (spec: any) => {
      const hasGravity = spec.settings?.gravity && spec.settings.gravity > 0;
      const hasPhysics = spec.systems && spec.systems.includes('physics');

      return hasGravity && !hasPhysics;
    },
    repair: (spec: any) => {
      if (!spec.systems) spec.systems = [];
      if (!spec.systems.includes('physics')) {
        spec.systems.push('physics');
      }
      return spec;
    },
  },

  {
    name: 'add-default-scoring',
    description: 'Add default distance scoring if missing',
    match: (spec: any) => {
      return !spec.scoring;
    },
    repair: (spec: any) => {
      spec.scoring = {
        type: 'distance',
        increment: 1,
      };
      return spec;
    },
  },

  {
    name: 'add-default-ui',
    description: 'Add default UI configuration if missing',
    match: (spec: any) => {
      return !spec.ui;
    },
    repair: (spec: any) => {
      spec.ui = {
        hud: ['score'],
        startScreen: true,
        gameOverScreen: true,
      };
      return spec;
    },
  },

  {
    name: 'add-default-camera-follow',
    description: 'Add camera follow if missing',
    match: (spec: any) => {
      return spec.scene && !spec.scene.cameraFollow;
    },
    repair: (spec: any) => {
      spec.scene.cameraFollow = 'player';
      return spec;
    },
  },

  {
    name: 'fix-topdown-gravity',
    description: 'Remove gravity for topdown games',
    match: (spec: any) => {
      return (
        spec.meta?.camera === 'topdown' &&
        spec.settings?.gravity &&
        spec.settings.gravity > 0
      );
    },
    repair: (spec: any) => {
      spec.settings.gravity = 0;
      return spec;
    },
  },

  {
    name: 'ensure-player-exists',
    description: 'Add player entity if missing',
    match: (spec: any) => {
      if (!spec.entities || !Array.isArray(spec.entities)) return true;

      return !spec.entities.some((e: any) => e.type === 'player');
    },
    repair: (spec: any) => {
      if (!spec.entities) spec.entities = [];

      spec.entities.unshift({
        id: 'player',
        type: 'player',
        sprite: 'player_sprite',
        position: { x: 200, y: 400 },
        physics: { gravity: true, collidable: true },
        components: ['health'],
      });

      return spec;
    },
  },
];

/**
 * Apply repair rules to GameSpec
 */
export function repairSpec(
  spec: any,
  rules: RepairRule[] = REPAIR_RULES
): { spec: any; repairs: string[] } {
  const repairs: string[] = [];
  let repairedSpec = spec;
  let hasCloned = false;

  for (const rule of rules) {
    if (rule.match(repairedSpec)) {
      // Clone only when first repair is needed (lazy cloning)
      if (!hasCloned) {
        repairedSpec = JSON.parse(JSON.stringify(spec));
        hasCloned = true;
      }

      repairedSpec = rule.repair(repairedSpec);
      repairs.push(rule.name);
    }
  }

  return { spec: repairedSpec, repairs };
}
