/**
 * Tests for Prompt Normalizer
 */

import { normalizePrompt } from '../src/normalizer';

describe('Prompt Normalizer', () => {
  it('should normalize whitespace', () => {
    const result = normalizePrompt('  Create   a   game  ');

    expect(result.normalized).toBe('Create a game');
    expect(result.original).toBe('  Create   a   game  ');
  });

  it('should detect Chinese locale', () => {
    const result = normalizePrompt('创建一个跳跃游戏');

    expect(result.locale).toBe('zh-CN');
  });

  it('should detect English locale', () => {
    const result = normalizePrompt('Create a jumping game');

    expect(result.locale).toBe('en');
  });

  it('should extract game-related keywords', () => {
    const result = normalizePrompt('Create a Flappy Bird-style jumping game with obstacles');

    expect(result.keywords).toContain('flappy');
    expect(result.keywords).toContain('jump');
  });

  it('should detect jumper game type', () => {
    const result = normalizePrompt('Create a Flappy Bird-style game');

    expect(result.gameType).toBe('jumper');
  });

  it('should detect runner game type', () => {
    const result = normalizePrompt('Build an endless runner with obstacles');

    expect(result.gameType).toBe('runner');
  });

  it('should detect shooter game type', () => {
    const result = normalizePrompt('Make a space shooter game');

    expect(result.gameType).toBe('shooter');
  });

  it('should detect game type from mechanics', () => {
    const result = normalizePrompt('Create a game where I tap to jump and avoid obstacles');

    expect(result.gameType).toBe('jumper');
  });

  it('should detect visual style', () => {
    const result = normalizePrompt('Create a pixel art platformer game');

    expect(result.style).toBe('pixel');
  });

  it('should detect space style', () => {
    const result = normalizePrompt('Make a space-themed shooter');

    expect(result.style).toBe('space');
  });

  it('should normalize "like X" patterns', () => {
    const result = normalizePrompt('Create a game like Flappy Bird');

    expect(result.normalized).toContain('Flappy Bird-style');
  });

  it('should normalize "similar to X" patterns', () => {
    const result = normalizePrompt('Create a game similar to Flappy Bird');

    expect(result.normalized).toContain('Flappy Bird-style');
  });

  it('should extract multiple keywords', () => {
    const result = normalizePrompt('Create a space shooter where you shoot asteroids and collect coins');

    expect(result.keywords).toContain('space');
    expect(result.keywords).toContain('shoot');
    expect(result.keywords).toContain('shooter');
    expect(result.keywords).toContain('asteroid');
    expect(result.keywords).toContain('collect');
    expect(result.keywords).toContain('coin');
  });

  it('should return null game type for unclear prompts', () => {
    const result = normalizePrompt('Make something fun');

    expect(result.gameType).toBeNull();
  });

  it('should return null style when not specified', () => {
    const result = normalizePrompt('Create a jumping game');

    expect(result.style).toBeNull();
  });
});
