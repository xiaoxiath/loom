/**
 * End-to-End Integration Test
 *
 * Tests the complete pipeline:
 * Natural Language → Intent Parser → GameSpec → Planner → Graphs → Code Generator → Game
 */

import { IntentParserAgent } from './intent-parser';
import { createMockLLMClient } from '@loom/llm-client';
import { PlannerAgent } from '@loom/planner';
import { CodeGenerator } from '@loom/code-generator';
import { generateAdapterBindings } from './adapter-bindings';

describe('E2E Pipeline', () => {
  const testCases = [
    {
      prompt: 'Create a Flappy Bird-style game where a bird jumps between pipes',
      expectedGenre: 'jumper',
    },
    {
      prompt: 'Make a space shooter where you shoot asteroids',
      expectedGenre: 'shooter',
    },
    {
      prompt: 'Build an endless runner with jumping and obstacles',
      expectedGenre: 'runner',
    },
  ];

  testCases.forEach(({ prompt, expectedGenre }) => {
    it(`should generate game from: "${prompt}"`, async () => {
      // Mock GameSpec
      const mockGameSpec = {
        meta: {
          title: 'Test Game',
          genre: expectedGenre,
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
            components: ['jump'],
          },
        ],
        systems: ['physics', 'collision', 'input'],
        mechanics: ['jump'],
        scoring: { type: 'distance', increment: 1 },
        ui: { hud: ['score'], startScreen: true, gameOverScreen: true },
        assets: [],
        extensions: {},
      };

      // Step 1: Intent Parsing
      const mockClient = createMockLLMClient(JSON.stringify(mockGameSpec));
      const parser = new IntentParserAgent({
        llmClient: mockClient,
        useExamples: true,
      });

      const parseResult = await parser.parse({ text: prompt });
      expect(parseResult.spec).toBeDefined();
      expect(parseResult.confidence).toBeGreaterThan(0);

      // Step 2: Planning
      const planner = new PlannerAgent();
      const planResult = planner.plan(parseResult.spec);
      expect(planResult.sceneGraph).toBeDefined();
      expect(planResult.entityGraph).toBeDefined();
      expect(planResult.componentGraph).toBeDefined();
      expect(planResult.systemGraph).toBeDefined();

      // Step 3: Generate Adapter Bindings
      const adapterBindings = generateAdapterBindings(planResult.componentGraph);
      expect(adapterBindings).toBeInstanceOf(Array);

      // Step 4: Code Generation
      const codeGenerator = new CodeGenerator();
      const genResult = codeGenerator.generate({
        gameSpec: parseResult.spec,
        sceneGraph: planResult.sceneGraph,
        entityGraph: planResult.entityGraph,
        componentGraph: planResult.componentGraph,
        systemGraph: planResult.systemGraph,
        adapterBindings,
      });

      expect(genResult.files).toBeDefined();
      expect(genResult.files.length).toBeGreaterThan(0);

      // Verify generated files have content
      genResult.files.forEach((file) => {
        expect(file.path).toBeDefined();
        expect(file.content).toBeDefined();
        expect(file.content.length).toBeGreaterThan(0);
      });
    });
  });
});
