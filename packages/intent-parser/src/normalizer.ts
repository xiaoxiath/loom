/**
 * Prompt Normalizer
 *
 * Standardizes and normalizes user input prompts
 */

export interface NormalizedPrompt {
  original: string;
  normalized: string;
  locale: string;
  keywords: string[];
  gameType: string | null;
  style: string | null;
}

/**
 * Normalize user prompt
 */
export function normalizePrompt(input: string): NormalizedPrompt {
  const original = input;
  let normalized = input;

  // 1. Trim and clean whitespace
  normalized = normalized.trim().replace(/\s+/g, ' ');

  // 2. Detect locale
  const locale = detectLocale(normalized);

  // 3. Extract keywords
  const keywords = extractKeywords(normalized);

  // 4. Detect game type
  const gameType = detectGameType(normalized);

  // 5. Detect style
  const style = detectStyle(normalized);

  // 6. Normalize common phrases
  normalized = normalizePhrases(normalized);

  return {
    original,
    normalized,
    locale,
    keywords,
    gameType,
    style,
  };
}

/**
 * Detect language locale
 */
function detectLocale(text: string): string {
  // Simple heuristic - check for Chinese characters
  const chinesePattern = /[\u4e00-\u9fa5]/;
  if (chinesePattern.test(text)) {
    return 'zh-CN';
  }
  return 'en';
}

/**
 * Extract important keywords
 */
function extractKeywords(text: string): string[] {
  const keywords: string[] = [];

  // Game genre keywords
  const genreKeywords = [
    'jumper',
    'runner',
    'shooter',
    'puzzle',
    'platformer',
    'flappy',
    'endless',
    'space',
    'tank',
  ];

  // Mechanic keywords
  const mechanicKeywords = [
    'jump',
    'shoot',
    'collect',
    'avoid',
    'run',
    'fly',
    'dodge',
  ];

  // Entity keywords
  const entityKeywords = [
    'player',
    'enemy',
    'obstacle',
    'coin',
    'asteroid',
    'bird',
    'ship',
    'tank',
  ];

  const allKeywords = [
    ...genreKeywords,
    ...mechanicKeywords,
    ...entityKeywords,
  ];

  const lowerText = text.toLowerCase();
  for (const keyword of allKeywords) {
    if (lowerText.includes(keyword)) {
      keywords.push(keyword);
    }
  }

  return keywords;
}

/**
 * Detect game type from prompt
 */
function detectGameType(text: string): string | null {
  const lowerText = text.toLowerCase();

  // Jumper games
  if (
    lowerText.includes('flappy') ||
    lowerText.includes('jump') ||
    (lowerText.includes('tap') && lowerText.includes('avoid'))
  ) {
    return 'jumper';
  }

  // Runner games
  if (
    lowerText.includes('runner') ||
    lowerText.includes('endless') ||
    (lowerText.includes('run') && lowerText.includes('obstacle'))
  ) {
    return 'runner';
  }

  // Shooter games
  if (
    lowerText.includes('shoot') ||
    lowerText.includes('shooter') ||
    lowerText.includes('space') ||
    lowerText.includes('tank')
  ) {
    return 'shooter';
  }

  return null;
}

/**
 * Detect visual style
 */
function detectStyle(text: string): string | null {
  const lowerText = text.toLowerCase();

  if (lowerText.includes('pixel')) return 'pixel';
  if (lowerText.includes('space')) return 'space';
  if (lowerText.includes('retro')) return 'retro';
  if (lowerText.includes('cartoon')) return 'cartoon';
  if (lowerText.includes('minimalist')) return 'minimalist';

  return null;
}

/**
 * Normalize common phrases
 */
function normalizePhrases(text: string): string {
  let normalized = text;

  // Normalize "like X" patterns
  const likePatterns = [
    { pattern: /like\s+flappy\s+bird/i, replacement: 'Flappy Bird-style' },
    { pattern: /similar\s+to\s+flappy\s+bird/i, replacement: 'Flappy Bird-style' },
    { pattern: /like\s+mario/i, replacement: 'Mario-style platformer' },
    { pattern: /like\s+space\s+invaders/i, replacement: 'Space Invaders-style shooter' },
  ];

  for (const { pattern, replacement } of likePatterns) {
    normalized = normalized.replace(pattern, replacement);
  }

  return normalized;
}
