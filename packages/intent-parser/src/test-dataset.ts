/**
 * Integration Test Dataset
 *
 * 20+ test prompts for end-to-end testing
 */

export interface TestPrompt {
  id: string;
  text: string;
  locale: string;
  expectedGameType: string;
  difficulty: 'easy' | 'medium' | 'hard';
  description: string;
}

export const TEST_PROMPTS: TestPrompt[] = [
  // Jumper Games (5)
  {
    id: 'jumper-1',
    text: 'Create a Flappy Bird-style game where a bird jumps between pipes',
    locale: 'en',
    expectedGameType: 'jumper',
    difficulty: 'easy',
    description: 'Classic Flappy Bird clone',
  },
  {
    id: 'jumper-2',
    text: 'Make a game where I tap to make a character jump over obstacles',
    locale: 'en',
    expectedGameType: 'jumper',
    difficulty: 'easy',
    description: 'Simple tap-to-jump mechanic',
  },
  {
    id: 'jumper-3',
    text: 'Build a game like Flappy Bird but with a space theme',
    locale: 'en',
    expectedGameType: 'jumper',
    difficulty: 'medium',
    description: 'Flappy Bird with space theme',
  },
  {
    id: 'jumper-4',
    text: '创建一个跳跃游戏，点击屏幕跳跃躲避障碍物',
    locale: 'zh-CN',
    expectedGameType: 'jumper',
    difficulty: 'easy',
    description: 'Chinese: Tap to jump and avoid obstacles',
  },
  {
    id: 'jumper-5',
    text: 'Design a pixel art jumping game where you avoid spikes and collect coins',
    locale: 'en',
    expectedGameType: 'jumper',
    difficulty: 'medium',
    description: 'Pixel art jumper with coins',
  },

  // Runner Games (5)
  {
    id: 'runner-1',
    text: 'Create an endless runner where a character runs and jumps over obstacles',
    locale: 'en',
    expectedGameType: 'runner',
    difficulty: 'easy',
    description: 'Classic endless runner',
  },
  {
    id: 'runner-2',
    text: 'Build a runner game with coins to collect and enemies to avoid',
    locale: 'en',
    expectedGameType: 'runner',
    difficulty: 'medium',
    description: 'Runner with coins and enemies',
  },
  {
    id: 'runner-3',
    text: 'Make a game like Mario but auto-scrolling',
    locale: 'en',
    expectedGameType: 'runner',
    difficulty: 'medium',
    description: 'Auto-scrolling platformer',
  },
  {
    id: 'runner-4',
    text: '制作一个无尽奔跑游戏，收集金币并跳跃躲避障碍',
    locale: 'zh-CN',
    expectedGameType: 'runner',
    difficulty: 'medium',
    description: 'Chinese: Endless runner with coins',
  },
  {
    id: 'runner-5',
    text: 'Create a space-themed endless runner where you dodge asteroids',
    locale: 'en',
    expectedGameType: 'runner',
    difficulty: 'medium',
    description: 'Space-themed runner with asteroids',
  },

  // Shooter Games (5)
  {
    id: 'shooter-1',
    text: 'Make a space shooter where you shoot at incoming asteroids',
    locale: 'en',
    expectedGameType: 'shooter',
    difficulty: 'easy',
    description: 'Simple space shooter',
  },
  {
    id: 'shooter-2',
    text: 'Create a top-down tank battle game where you shoot enemy tanks',
    locale: 'en',
    expectedGameType: 'shooter',
    difficulty: 'medium',
    description: 'Top-down tank shooter',
  },
  {
    id: 'shooter-3',
    text: 'Build a space shooter with enemy ships and power-ups',
    locale: 'en',
    expectedGameType: 'shooter',
    difficulty: 'medium',
    description: 'Space shooter with power-ups',
  },
  {
    id: 'shooter-4',
    text: '创建一个太空射击游戏，击落陨石和敌机',
    locale: 'zh-CN',
    expectedGameType: 'shooter',
    difficulty: 'medium',
    description: 'Chinese: Space shooter with asteroids and enemies',
  },
  {
    id: 'shooter-5',
    text: 'Design a retro-style shooter where you defend against waves of enemies',
    locale: 'en',
    expectedGameType: 'shooter',
    difficulty: 'hard',
    description: 'Retro wave-based shooter',
  },

  // Mixed/Ambiguous (5)
  {
    id: 'mixed-1',
    text: 'Create a game where you fly through space and avoid obstacles',
    locale: 'en',
    expectedGameType: 'jumper', // or runner
    difficulty: 'medium',
    description: 'Ambiguous: could be jumper or runner',
  },
  {
    id: 'mixed-2',
    text: 'Build a game with jumping and shooting mechanics',
    locale: 'en',
    expectedGameType: 'shooter', // platformer shooter
    difficulty: 'hard',
    description: 'Mixed mechanics: jump + shoot',
  },
  {
    id: 'mixed-3',
    text: '做一个简单的游戏',
    locale: 'zh-CN',
    expectedGameType: 'jumper', // default
    difficulty: 'hard',
    description: 'Chinese: Very vague prompt',
  },
  {
    id: 'mixed-4',
    text: 'Create a fun game',
    locale: 'en',
    expectedGameType: 'jumper', // default
    difficulty: 'hard',
    description: 'Very vague prompt',
  },
  {
    id: 'mixed-5',
    text: 'Make a platformer with shooting and collecting',
    locale: 'en',
    expectedGameType: 'shooter',
    difficulty: 'hard',
    description: 'Complex: platformer + shoot + collect',
  },

  // Edge Cases (5)
  {
    id: 'edge-1',
    text: 'Create a minimal jumping game with just a player and ground',
    locale: 'en',
    expectedGameType: 'jumper',
    difficulty: 'easy',
    description: 'Minimal viable jumper',
  },
  {
    id: 'edge-2',
    text: 'Build a shooter with only enemies, no player',
    locale: 'en',
    expectedGameType: 'shooter',
    difficulty: 'hard',
    description: 'Edge case: no player specified',
  },
  {
    id: 'edge-3',
    text: 'Make a game where everything is red',
    locale: 'en',
    expectedGameType: 'jumper',
    difficulty: 'hard',
    description: 'Style-only prompt',
  },
  {
    id: 'edge-4',
    text: 'Create a 3D jumping game',
    locale: 'en',
    expectedGameType: 'jumper',
    difficulty: 'hard',
    description: '3D request (should fallback to 2D)',
  },
  {
    id: 'edge-5',
    text: 'Build a game with no gravity',
    locale: 'en',
    expectedGameType: 'shooter',
    difficulty: 'medium',
    description: 'No gravity specified',
  },
];

/**
 * Get prompts by game type
 */
export function getPromptsByType(gameType: string): TestPrompt[] {
  return TEST_PROMPTS.filter((p) => p.expectedGameType === gameType);
}

/**
 * Get prompts by difficulty
 */
export function getPromptsByDifficulty(difficulty: string): TestPrompt[] {
  return TEST_PROMPTS.filter((p) => p.difficulty === difficulty);
}

/**
 * Get prompts by locale
 */
export function getPromptsByLocale(locale: string): TestPrompt[] {
  return TEST_PROMPTS.filter((p) => p.locale === locale);
}

/**
 * Get easy prompts for quick testing
 */
export function getEasyPrompts(): TestPrompt[] {
  return getPromptsByDifficulty('easy');
}
