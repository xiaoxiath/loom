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
  let normalized = input.trim().replace(/\s+/g, ' ');

  // Lowercase once for all detection functions
  const lowerNormalized = normalized.toLowerCase();

  // Detect locale
  const locale = detectLocale(normalized);

  // Extract keywords
  const keywords = extractKeywords(lowerNormalized);

  // Detect game type
  const gameType = detectGameType(lowerNormalized);

  // Detect style
  const style = detectStyle(lowerNormalized);

  // Normalize common phrases
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

  for (const keyword of allKeywords) {
    if (text.includes(keyword)) {
      keywords.push(keyword);
    }
  }

  return keywords;
}

/**
 * Detect game type from prompt (text should be lowercase)
 */
function detectGameType(text: string): string | null {
  // Rules by priority (higher priority first)
  // Multi-word combinations first, then single words to avoid misclassification
  const rules: Array<{
    keywords: string[];
    excludes?: string[];
    type: string;
  }> = [
    // Exact game names
    { keywords: ['flappy bird'], type: 'jumper' },
    { keywords: ['space invaders'], type: 'shooter' },

    // Multi-word combinations (more specific, higher priority)
    { keywords: ['space', 'runner'], type: 'runner' },
    { keywords: ['space', 'run'], type: 'runner' },
    { keywords: ['run', 'obstacle'], type: 'runner' },
    { keywords: ['tap', 'avoid'], type: 'jumper' },

    // Single words (fallback rules)
    { keywords: ['flappy'], type: 'jumper' },
    { keywords: ['jump'], excludes: ['run', 'runner'], type: 'jumper' },
    { keywords: ['platformer'], type: 'jumper' },
    { keywords: ['runner'], type: 'runner' },
    { keywords: ['endless'], type: 'runner' },
    { keywords: ['shooter'], type: 'shooter' },
    { keywords: ['shoot'], type: 'shooter' },
    { keywords: ['tank'], type: 'shooter' },
    { keywords: ['space'], type: 'shooter' },
  ];

  for (const rule of rules) {
    const allMatch = rule.keywords.every(kw => text.includes(kw));
    const noExclude = !rule.excludes?.some(ex => text.includes(ex));
    if (allMatch && noExclude) {
      return rule.type;
    }
  }

  return null;
}

/**
 * Detect visual style (text should be lowercase)
 */
function detectStyle(text: string): string | null {
  if (text.includes('pixel')) return 'pixel';
  if (text.includes('space')) return 'space';
  if (text.includes('retro')) return 'retro';
  if (text.includes('cartoon')) return 'cartoon';
  if (text.includes('minimalist')) return 'minimalist';

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
