/**
 * Few-shot Examples for Intent Parser
 *
 * These examples demonstrate how to convert natural language descriptions
 * into valid GameSpec JSON for different game types.
 */

export interface FewShotExample {
  input: string;
  output: object;
  description: string;
}

/**
 * Example 1: Flappy Bird-style Jumper Game
 */
export const JUMPER_EXAMPLE: FewShotExample = {
  input: "Create a Flappy Bird-style game where a bird jumps between pipes",
  description: "Side-scrolling jumper game with obstacle avoidance",
  output: {
    meta: {
      title: "Flappy Bird Clone",
      genre: "jumper",
      camera: "side",
      dimension: "2D",
      version: "1.0",
    },
    settings: {
      gravity: 980,
      backgroundColor: "#87CEEB",
      worldWidth: 1920,
      worldHeight: 1080,
    },
    scene: {
      type: "single",
      cameraFollow: "player",
      spawn: {
        x: 200,
        y: 400,
      },
    },
    entities: [
      {
        id: "player",
        type: "player",
        sprite: "bird_sprite",
        position: {
          x: 200,
          y: 400,
        },
        physics: {
          gravity: true,
          collidable: true,
        },
        components: ["jump", "health"],
      },
      {
        id: "pipe_top",
        type: "obstacle",
        sprite: "pipe_sprite",
        position: {
          x: 800,
          y: 100,
        },
        physics: {
          gravity: false,
          collidable: true,
        },
        components: [],
      },
      {
        id: "pipe_bottom",
        type: "obstacle",
        sprite: "pipe_sprite",
        position: {
          x: 800,
          y: 700,
        },
        physics: {
          gravity: false,
          collidable: true,
        },
        components: [],
      },
    ],
    systems: ["physics", "collision", "input", "spawn"],
    mechanics: ["jump", "gravity", "collision", "avoid"],
    scoring: {
      type: "distance",
      increment: 1,
    },
    ui: {
      hud: ["score"],
      startScreen: true,
      gameOverScreen: true,
    },
    assets: [
      {
        id: "bird_sprite",
        type: "sprite",
        source: "kenney",
      },
      {
        id: "pipe_sprite",
        type: "sprite",
        source: "kenney",
      },
    ],
    extensions: {},
  },
};

/**
 * Example 2: Space Shooter Game
 */
export const SHOOTER_EXAMPLE: FewShotExample = {
  input: "Make a space shooter where a spaceship shoots at incoming asteroids and enemy ships",
  description: "Top-down space shooter with projectiles and enemies",
  output: {
    meta: {
      title: "Space Shooter",
      genre: "shooter",
      camera: "topdown",
      dimension: "2D",
      version: "1.0",
    },
    settings: {
      gravity: 0,
      backgroundColor: "#000000",
      worldWidth: 1920,
      worldHeight: 1080,
    },
    scene: {
      type: "single",
      cameraFollow: "player",
      spawn: {
        x: 960,
        y: 800,
      },
    },
    entities: [
      {
        id: "player",
        type: "player",
        sprite: "player_ship",
        position: {
          x: 960,
          y: 800,
        },
        physics: {
          gravity: false,
          collidable: true,
        },
        components: ["shoot", "health", "movement"],
      },
      {
        id: "asteroid",
        type: "enemy",
        sprite: "asteroid_sprite",
        position: {
          x: 400,
          y: 200,
        },
        physics: {
          gravity: false,
          collidable: true,
        },
        components: ["health"],
      },
      {
        id: "enemy_ship",
        type: "enemy",
        sprite: "enemy_ship_sprite",
        position: {
          x: 1200,
          y: 300,
        },
        physics: {
          gravity: false,
          collidable: true,
        },
        components: ["health", "shoot"],
      },
      {
        id: "player_bullet",
        type: "projectile",
        sprite: "bullet_sprite",
        position: {
          x: 960,
          y: 750,
        },
        physics: {
          gravity: false,
          collidable: true,
        },
        components: ["movement"],
      },
    ],
    systems: ["physics", "collision", "input", "spawn"],
    mechanics: ["shoot", "collision", "avoid"],
    scoring: {
      type: "kill",
      increment: 100,
    },
    ui: {
      hud: ["score", "health"],
      startScreen: true,
      gameOverScreen: true,
    },
    assets: [
      {
        id: "player_ship",
        type: "sprite",
        source: "kenney",
      },
      {
        id: "asteroid_sprite",
        type: "sprite",
        source: "kenney",
      },
      {
        id: "enemy_ship_sprite",
        type: "sprite",
        source: "kenney",
      },
      {
        id: "bullet_sprite",
        type: "sprite",
        source: "kenney",
      },
    ],
    extensions: {},
  },
};

/**
 * Example 3: Endless Runner Game
 */
export const RUNNER_EXAMPLE: FewShotExample = {
  input: "Build an endless runner game with a character that jumps over obstacles and collects coins",
  description: "Side-scrolling endless runner with jumping and collecting",
  output: {
    meta: {
      title: "Endless Runner",
      genre: "runner",
      camera: "side",
      dimension: "2D",
      version: "1.0",
    },
    settings: {
      gravity: 980,
      backgroundColor: "#87CEEB",
      worldWidth: 3840,
      worldHeight: 1080,
    },
    scene: {
      type: "single",
      cameraFollow: "player",
      spawn: {
        x: 200,
        y: 800,
      },
    },
    entities: [
      {
        id: "player",
        type: "player",
        sprite: "runner_sprite",
        position: {
          x: 200,
          y: 800,
        },
        physics: {
          gravity: true,
          collidable: true,
        },
        components: ["jump", "health"],
      },
      {
        id: "ground",
        type: "platform",
        sprite: "ground_sprite",
        position: {
          x: 1920,
          y: 950,
        },
        physics: {
          gravity: false,
          collidable: true,
        },
        components: [],
      },
      {
        id: "obstacle",
        type: "obstacle",
        sprite: "spike_sprite",
        position: {
          x: 800,
          y: 850,
        },
        physics: {
          gravity: false,
          collidable: true,
        },
        components: [],
      },
      {
        id: "coin",
        type: "pickup",
        sprite: "coin_sprite",
        position: {
          x: 600,
          y: 700,
        },
        physics: {
          gravity: false,
          collidable: true,
        },
        components: [],
      },
    ],
    systems: ["physics", "collision", "input", "spawn", "camera"],
    mechanics: ["jump", "gravity", "collision", "collect", "avoid"],
    scoring: {
      type: "collect",
      increment: 10,
    },
    ui: {
      hud: ["score"],
      startScreen: true,
      gameOverScreen: true,
    },
    assets: [
      {
        id: "runner_sprite",
        type: "sprite",
        source: "kenney",
      },
      {
        id: "ground_sprite",
        type: "sprite",
        source: "kenney",
      },
      {
        id: "spike_sprite",
        type: "sprite",
        source: "kenney",
      },
      {
        id: "coin_sprite",
        type: "sprite",
        source: "kenney",
      },
    ],
    extensions: {},
  },
};

/**
 * All few-shot examples
 */
export const FEW_SHOT_EXAMPLES: FewShotExample[] = [
  JUMPER_EXAMPLE,
  SHOOTER_EXAMPLE,
  RUNNER_EXAMPLE,
];

/**
 * Format few-shot examples for inclusion in a prompt
 */
export function formatFewShotExamples(examples: FewShotExample[]): string {
  return examples
    .map((example) => {
      return `## Example: ${example.description}

User Input:
${example.input}

Output:
${JSON.stringify(example.output, null, 2)}`;
    })
    .join('\n\n');
}
