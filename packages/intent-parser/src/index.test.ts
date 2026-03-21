/**
 * Tests for Intent Parser Agent
 */

import { IntentParserAgent } from '../src/intent-parser';
import { createMockLLMClient } from '@loom/llm-client';

describe('IntentParserAgent', () => {
  it('should parse a simple jumper game prompt', async () => {
    const mockClient = createMockLLMClient(
      JSON.stringify({
        meta: {
          title: 'Test Jumper',
          genre: 'jumper',
          camera: 'side',
          dimension: '2D',
          version: '1.0',
        },
        settings: {
          gravity: 980,
          backgroundColor: '#87CEEB',
          worldWidth: 1920,
          worldHeight: 1080,
        },
        scene: {
          type: 'single',
          cameraFollow: 'player',
          spawn: { x: 200, y: 400 },
        },
        entities: [
          {
            id: 'player',
            type: 'player',
            sprite: 'player_sprite',
            position: { x: 200, y: 400 },
            physics: { gravity: true, collidable: true },
            components: ['jump', 'health'],
          },
        ],
        systems: ['physics', 'collision', 'input'],
        mechanics: ['jump', 'gravity', 'collision'],
        scoring: { type: 'distance', increment: 1 },
        ui: { hud: ['score'], startScreen: true, gameOverScreen: true },
        assets: [],
        extensions: {},
      })
    );

    const parser = new IntentParserAgent({
      llmClient: mockClient,
      useExamples: true,
    });

    const result = await parser.parse({
      text: 'Create a simple jumping game',
    });

    expect(result.spec).toBeDefined();
    expect(result.spec.meta.genre).toBe('jumper');
    expect(result.spec.meta.title).toBe('Test Jumper');
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
    expect(result.diagnostics).toBeDefined();
    expect(result.diagnostics.llmProvider).toBe('openai');
  });

  it('should calculate confidence based on spec completeness', async () => {
    const mockClient = createMockLLMClient(
      JSON.stringify({
        meta: {
          title: 'Test Game',
          genre: 'shooter',
          camera: 'topdown',
          dimension: '2D',
          version: '1.0',
        },
        settings: {
          gravity: 0,
          backgroundColor: '#000000',
          worldWidth: 1920,
          worldHeight: 1080,
        },
        scene: {
          type: 'single',
          cameraFollow: 'player',
          spawn: { x: 960, y: 540 },
        },
        entities: [
          {
            id: 'player',
            type: 'player',
            sprite: 'player_sprite',
            position: { x: 960, y: 540 },
            physics: { gravity: false, collidable: true },
            components: ['shoot', 'health'],
          },
        ],
        systems: ['physics', 'collision', 'input'],
        mechanics: ['shoot', 'collision'],
        // Missing scoring, ui, assets - should reduce confidence
      })
    );

    const parser = new IntentParserAgent({
      llmClient: mockClient,
      useExamples: false,
    });

    const result = await parser.parse({
      text: 'Make a shooter game',
    });

    // Confidence should be reduced due to missing optional fields
    expect(result.confidence).toBeLessThan(1.0);
    expect(result.missingSlots).toContain('scoring');
    expect(result.missingSlots).toContain('assets');
    expect(result.missingSlots).toContain('ui.hud');
  });

  it('should validate spec and detect errors', async () => {
    const mockClient = createMockLLMClient(
      JSON.stringify({
        // Missing meta, settings, scene, entities - invalid spec
        systems: ['physics'],
        mechanics: ['gravity'],
      })
    );

    const parser = new IntentParserAgent({
      llmClient: mockClient,
      validateOutput: true,
    });

    const result = await parser.parse({
      text: 'Invalid game',
    });

    // Confidence should be low due to errors
    expect(result.confidence).toBeLessThan(0.5);
  });

  it('should detect missing player entity', async () => {
    const mockClient = createMockLLMClient(
      JSON.stringify({
        meta: {
          title: 'No Player Game',
          genre: 'runner',
          camera: 'side',
          dimension: '2D',
          version: '1.0',
        },
        settings: {
          gravity: 980,
          backgroundColor: '#87CEEB',
          worldWidth: 1920,
          worldHeight: 1080,
        },
        scene: {
          type: 'single',
          cameraFollow: 'player',
          spawn: { x: 200, y: 400 },
        },
        entities: [
          // No player entity
          {
            id: 'obstacle',
            type: 'obstacle',
            sprite: 'obstacle_sprite',
            position: { x: 800, y: 400 },
            physics: { gravity: false, collidable: true },
            components: [],
          },
        ],
        systems: ['physics', 'collision'],
        mechanics: ['gravity', 'collision'],
      })
    );

    const parser = new IntentParserAgent({
      llmClient: mockClient,
    });

    const result = await parser.parse({
      text: 'Game without player',
    });

    // Should have reduced confidence due to missing player
    expect(result.confidence).toBeLessThan(1.0);
    expect(result.confidence).toBeGreaterThan(0); // Still some confidence
  });

  it('should extract assumptions from auto-filled fields', async () => {
    const mockClient = createMockLLMClient(
      JSON.stringify({
        meta: {
          title: 'Assumed Game',
          genre: 'jumper',
          camera: 'side',
          dimension: '2D',
          version: '1.0',
        },
        settings: {
          gravity: 980,
          backgroundColor: '#000000',
          worldWidth: 1920,
          worldHeight: 1080,
        },
        scene: {
          type: 'single',
          cameraFollow: 'player', // Assumption
          spawn: { x: 200, y: 400 },
        },
        entities: [
          {
            id: 'player',
            type: 'player',
            sprite: 'player_sprite',
            position: { x: 200, y: 400 },
            physics: { gravity: true, collidable: true },
            components: ['jump'],
          },
        ],
        systems: ['physics', 'collision', 'input'],
        mechanics: ['jump', 'gravity'],
        scoring: { type: 'distance', increment: 1 }, // Assumption
        // Missing assets - assumption
        extensions: {},
      })
    );

    const parser = new IntentParserAgent({
      llmClient: mockClient,
    });

    const result = await parser.parse({
      text: 'Simple jumper',
    });

    expect(result.assumptions).toContain('cameraFollow(player)');
    expect(result.assumptions).toContain('defaultScoring(distance)');
    expect(result.assumptions).toContain('placeholderAssets()');
  });

  it('should throw error if LLM client is not configured', async () => {
    const unconfiguredClient = createMockLLMClient('{}');
    // Mock isConfigured to return false
    unconfiguredClient.isConfigured = () => false;

    const parser = new IntentParserAgent({
      llmClient: unconfiguredClient,
    });

    await expect(
      parser.parse({ text: 'Test' })
    ).rejects.toThrow('LLM client is not configured');
  });

  it('should handle malformed JSON response', async () => {
    const mockClient = createMockLLMClient('This is not valid JSON');

    const parser = new IntentParserAgent({
      llmClient: mockClient,
    });

    await expect(
      parser.parse({ text: 'Test' })
    ).rejects.toThrow('Failed to parse LLM response as JSON');
  });

  it('should include diagnostics with timing information', async () => {
    const mockClient = createMockLLMClient(
      JSON.stringify({
        meta: {
          title: 'Diagnostic Test',
          genre: 'runner',
          camera: 'side',
          dimension: '2D',
          version: '1.0',
        },
        settings: {
          gravity: 980,
          backgroundColor: '#000000',
          worldWidth: 1920,
          worldHeight: 1080,
        },
        scene: {
          type: 'single',
          cameraFollow: 'player',
          spawn: { x: 200, y: 400 },
        },
        entities: [
          {
            id: 'player',
            type: 'player',
            sprite: 'player_sprite',
            position: { x: 200, y: 400 },
            physics: { gravity: true, collidable: true },
            components: ['jump', 'health'],
          },
        ],
        systems: ['physics', 'collision', 'input'],
        mechanics: ['jump', 'gravity', 'collision'],
        scoring: { type: 'distance', increment: 1 },
        ui: { hud: ['score'], startScreen: true, gameOverScreen: true },
        assets: [],
        extensions: {},
      })
    );

    const parser = new IntentParserAgent({
      llmClient: mockClient,
    });

    const result = await parser.parse({
      text: 'Test diagnostics',
    });

    expect(result.diagnostics.promptLength).toBe('Test diagnostics'.length);
    expect(result.diagnostics.processingTime).toBeGreaterThanOrEqual(0);
    expect(result.diagnostics.llmProvider).toBeDefined();
    expect(result.diagnostics.llmModel).toBeDefined();
  });
});
