/**
 * Placeholder Asset Generator
 *
 * Generates simple SVG placeholder assets for testing and prototyping
 */

import * as fs from 'fs';
import * as path from 'path';

interface PlaceholderConfig {
  id: string;
  type: 'sprite' | 'background' | 'ui';
  width: number;
  height: number;
  color: string;
  name: string;
}

const SPRITE_PLACEHOLDERS: PlaceholderConfig[] = [
  {
    id: 'player_default',
    type: 'sprite',
    width: 32,
    height: 32,
    color: '#4CAF50',
    name: 'Default Player',
  },
  {
    id: 'player_bird',
    type: 'sprite',
    width: 34,
    height: 24,
    color: '#FFC107',
    name: 'Bird Player',
  },
  {
    id: 'player_ship',
    type: 'sprite',
    width: 32,
    height: 32,
    color: '#2196F3',
    name: 'Spaceship Player',
  },
  {
    id: 'player_runner',
    type: 'sprite',
    width: 32,
    height: 32,
    color: '#9C27B0',
    name: 'Runner Player',
  },
  {
    id: 'enemy_default',
    type: 'sprite',
    width: 32,
    height: 32,
    color: '#F44336',
    name: 'Default Enemy',
  },
  {
    id: 'obstacle_pipe',
    type: 'sprite',
    width: 52,
    height: 320,
    color: '#8BC34A',
    name: 'Pipe Obstacle',
  },
  {
    id: 'obstacle_asteroid',
    type: 'sprite',
    width: 48,
    height: 48,
    color: '#9E9E9E',
    name: 'Asteroid Obstacle',
  },
  {
    id: 'obstacle_spike',
    type: 'sprite',
    width: 32,
    height: 32,
    color: '#FF5722',
    name: 'Spike Obstacle',
  },
];

const BACKGROUND_PLACEHOLDERS: PlaceholderConfig[] = [
  {
    id: 'sky_blue',
    type: 'background',
    width: 1920,
    height: 1080,
    color: '#87CEEB',
    name: 'Blue Sky',
  },
  {
    id: 'space_stars',
    type: 'background',
    width: 1920,
    height: 1080,
    color: '#0a0e27',
    name: 'Starfield Space',
  },
  {
    id: 'ground_grass',
    type: 'background',
    width: 1920,
    height: 1080,
    color: '#7CB342',
    name: 'Grass Ground',
  },
];

const UI_PLACEHOLDERS: PlaceholderConfig[] = [
  {
    id: 'button_default',
    type: 'ui',
    width: 200,
    height: 50,
    color: '#3F51B5',
    name: 'Default Button',
  },
  {
    id: 'icon_heart',
    type: 'ui',
    width: 32,
    height: 32,
    color: '#E91E63',
    name: 'Heart Icon',
  },
  {
    id: 'icon_coin',
    type: 'ui',
    width: 32,
    height: 32,
    color: '#FFD700',
    name: 'Coin Icon',
  },
];

function generateSVG(config: PlaceholderConfig): string {
  const { width, height, color, name } = config;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="${color}"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="12">
    ${name}
  </text>
</svg>`;
}

function generatePlaceholders() {
  const assetsDir = path.join(__dirname, '..', '..', 'assets');

  // Generate sprites
  const spritesDir = path.join(assetsDir, 'sprites');
  fs.mkdirSync(spritesDir, { recursive: true });

  SPRITE_PLACEHOLDERS.forEach((config) => {
    const svg = generateSVG(config);
    const filename = `${config.id}.svg`;
    fs.writeFileSync(path.join(spritesDir, filename), svg);
    console.log(`✓ Generated ${filename}`);
  });

  // Generate backgrounds
  const backgroundsDir = path.join(assetsDir, 'backgrounds');
  fs.mkdirSync(backgroundsDir, { recursive: true });

  BACKGROUND_PLACEHOLDERS.forEach((config) => {
    const svg = generateSVG(config);
    const filename = `${config.id}.svg`;
    fs.writeFileSync(path.join(backgroundsDir, filename), svg);
    console.log(`✓ Generated ${filename}`);
  });

  // Generate UI
  const uiDir = path.join(assetsDir, 'ui');
  fs.mkdirSync(uiDir, { recursive: true });

  UI_PLACEHOLDERS.forEach((config) => {
    const svg = generateSVG(config);
    const filename = `${config.id}.svg`;
    fs.writeFileSync(path.join(uiDir, filename), svg);
    console.log(`✓ Generated ${filename}`);
  });

  console.log(`\n✅ Generated ${SPRITE_PLACEHOLDERS.length + BACKGROUND_PLACEHOLDERS.length + UI_PLACEHOLDERS.length} placeholder assets`);
}

// Run if called directly
if (require.main === module) {
  generatePlaceholders();
}

export { generatePlaceholders };
