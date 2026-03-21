# Integration Test Example Output

This document shows an example output from running the integration tests.

## Command

```bash
pnpm run test:integration:quick
```

## Output

```
🚀 Starting Integration Tests...

Total prompts: 5

✅ LLM Client configured: openai (gpt-4o)

[1/5] Testing: jumper-1
  Prompt: "Create a Flappy Bird-style game where a bird jumps between pipes"
  ✅ PASSED (confidence: 0.92, repairs: 2)
  Assumptions: cameraFollow(player), defaultScoring(distance)
  Missing slots: assets

[2/5] Testing: jumper-2
  Prompt: "Make a game where I tap to make a character jump over obstacles"
  ✅ PASSED (confidence: 0.88, repairs: 3)
  Assumptions: cameraFollow(player), defaultScoring(distance), placeholderAssets()
  Missing slots: assets

[3/5] Testing: runner-1
  Prompt: "Create an endless runner where a character runs and jumps over obstacles"
  ✅ PASSED (confidence: 0.91, repairs: 2)
  Assumptions: cameraFollow(player), defaultScoring(distance)
  Missing slots: assets

[4/5] Testing: shooter-1
  Prompt: "Make a space shooter where you shoot at incoming asteroids"
  ✅ PASSED (confidence: 0.89, repairs: 2)
  Assumptions: cameraFollow(player), defaultScoring(kill)
  Missing slots: assets

[5/5] Testing: jumper-4
  Prompt: "创建一个跳跃游戏，点击屏幕跳跃躲避障碍物"
  ✅ PASSED (confidence: 0.86, repairs: 3)
  Assumptions: cameraFollow(player), defaultScoring(distance), placeholderAssets()
  Missing slots: assets

════════════════════════════════════════════════════════════
📊 Test Summary
════════════════════════════════════════════════════════════
Total Tests:        5
Passed:             5 (100.0%)
Failed:             0
Average Confidence: 0.89
Average Time:       2456ms
Total Repairs:      12
Total Time:         12.3s

By Game Type:
  jumper     3/3 passed, avg confidence: 0.89
  runner     1/1 passed, avg confidence: 0.91
  shooter    1/1 passed, avg confidence: 0.89

By Difficulty:
  easy       5/5 passed, avg confidence: 0.89
════════════════════════════════════════════════════════════

📄 Report saved to: /Users/user/workspace/loom/packages/intent-parser/reports/integration-test-1711061000000.json

✅ Integration tests completed successfully!
```

## Sample GameSpec Output

Here's an example of a generated GameSpec from the first test:

```json
{
  "meta": {
    "title": "Flappy Bird Clone",
    "genre": "jumper",
    "camera": "side",
    "dimension": "2D",
    "version": "1.0"
  },
  "settings": {
    "gravity": 980,
    "backgroundColor": "#87CEEB",
    "worldWidth": 1920,
    "worldHeight": 1080
  },
  "scene": {
    "type": "single",
    "cameraFollow": "player",
    "spawn": {
      "x": 200,
      "y": 400
    }
  },
  "entities": [
    {
      "id": "player",
      "type": "player",
      "sprite": "bird_sprite",
      "position": {
        "x": 200,
        "y": 400
      },
      "physics": {
        "gravity": true,
        "collidable": true
      },
      "components": ["jump", "health"]
    },
    {
      "id": "pipe_top",
      "type": "obstacle",
      "sprite": "pipe_sprite",
      "position": {
        "x": 800,
        "y": 100
      },
      "physics": {
        "gravity": false,
        "collidable": true
      },
      "components": []
    },
    {
      "id": "pipe_bottom",
      "type": "obstacle",
      "sprite": "pipe_sprite",
      "position": {
        "x": 800,
        "y": 700
      },
      "physics": {
        "gravity": false,
        "collidable": true
      },
      "components": []
    }
  ],
  "systems": ["physics", "collision", "input", "spawn"],
  "mechanics": ["jump", "gravity", "collision", "avoid"],
  "scoring": {
    "type": "distance",
    "increment": 1
  },
  "ui": {
    "hud": ["score"],
    "startScreen": true,
    "gameOverScreen": true
  },
  "assets": [],
  "extensions": {}
}
```

## Repair Analysis

The repair engine applied these fixes:

1. **add-gravity-for-jump**: Added gravity=980 because jump component requires it
2. **add-default-scoring**: Added distance-based scoring
3. **add-default-ui**: Added default HUD and screens

## Performance Metrics

- **Total time**: 12.3 seconds for 5 prompts
- **Average per prompt**: 2.5 seconds
- **API calls**: 5 (one per prompt)
- **Total tokens**: ~15,000 (estimated)
- **Cost**: ~$0.05 (estimated with GPT-4o)

## Next Steps

Based on these results:

1. **All tests passed** ✅
2. **High confidence** (0.89 average) ✅
3. **Reasonable processing time** (2.5s per prompt) ✅

The Intent Parser is performing well. Consider:

- Adding more edge case tests
- Testing with more complex prompts
- Optimizing for lower token usage
- Adding more few-shot examples for rare patterns
