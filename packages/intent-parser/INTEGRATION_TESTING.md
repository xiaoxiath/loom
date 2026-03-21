# Integration Testing Guide

This guide explains how to run integration tests for the Intent Parser.

## Prerequisites

Before running integration tests, you need to configure LLM API keys:

```bash
# Option 1: OpenAI
export OPENAI_API_KEY="sk-..."
export OPENAI_MODEL="gpt-4o"  # optional

# Option 2: Claude
export ANTHROPIC_API_KEY="sk-ant-..."
export CLAUDE_MODEL="claude-sonnet-4-6-20250514"  # optional
```

## Running Tests

### Quick Test (5 prompts)

Run a quick test with 5 prompts:

```bash
pnpm run test:integration:quick
```

### Easy Prompts Only

Test with easy prompts only (good for initial testing):

```bash
pnpm run test:integration:easy
```

### Full Integration Test (25 prompts)

Run the complete test suite:

```bash
pnpm run test:integration
```

### Test Specific Game Types

Test only specific game types:

```bash
# Jumper games only
ts-node src/integration-test.ts jumper

# Runner games only
ts-node src/integration-test.ts runner

# Shooter games only
ts-node src/integration-test.ts shooter
```

## Test Dataset

The test dataset includes 25 prompts:

- **5 Jumper games**: Flappy Bird-style, tap-to-jump, etc.
- **5 Runner games**: Endless runners, auto-scrolling, etc.
- **5 Shooter games**: Space shooters, tank battles, etc.
- **5 Mixed/Ambiguous**: Complex or unclear prompts
- **5 Edge cases**: Minimal, vague, or unusual prompts

### Difficulty Levels

- **Easy**: Clear, specific prompts (10 prompts)
- **Medium**: Moderate complexity (10 prompts)
- **Hard**: Vague, ambiguous, or complex prompts (5 prompts)

### Languages

- **English**: 20 prompts
- **Chinese**: 5 prompts

## Expected Output

```
🚀 Starting Integration Tests...

Total prompts: 25

✅ LLM Client configured: openai (gpt-4o)

[1/25] Testing: jumper-1
  Prompt: "Create a Flappy Bird-style game where a bird jumps between pipes"
  ✅ PASSED (confidence: 0.92, repairs: 2)

[2/25] Testing: jumper-2
  Prompt: "Make a game where I tap to make a character jump over obstacles"
  ✅ PASSED (confidence: 0.88, repairs: 3)

...

════════════════════════════════════════════════════════════
📊 Test Summary
════════════════════════════════════════════════════════════
Total Tests:        25
Passed:             23 (92.0%)
Failed:             2
Average Confidence: 0.85
Average Time:       2340ms
Total Repairs:      67
Total Time:         58.5s

By Game Type:
  jumper     4/5 passed, avg confidence: 0.89
  runner     5/5 passed, avg confidence: 0.87
  shooter    5/5 passed, avg confidence: 0.86
  mixed      3/5 passed, avg confidence: 0.79
  edge       2/5 passed, avg confidence: 0.71

By Difficulty:
  easy       10/10 passed, avg confidence: 0.91
  medium     10/10 passed, avg confidence: 0.84
  hard       3/5 passed, avg confidence: 0.72
════════════════════════════════════════════════════════════

📄 Report saved to: /path/to/reports/integration-test-1234567890.json

✅ Integration tests completed successfully!
```

## Test Report

A detailed JSON report is saved to `reports/integration-test-{timestamp}.json`:

```json
{
  "timestamp": "2026-03-22T00:30:00.000Z",
  "totalTests": 25,
  "passedTests": 23,
  "failedTests": 2,
  "averageConfidence": 0.85,
  "averageProcessingTime": 2340,
  "totalRepairs": 67,
  "results": [...],
  "summary": {
    "byGameType": {...},
    "byDifficulty": {...}
  }
}
```

## Success Criteria

Integration tests pass if:

- **Pass rate ≥ 70%**: At least 70% of prompts must pass
- **Average confidence ≥ 0.75**: Overall confidence should be reasonably high

If tests fail, the process exits with error code 1.

## Customizing Tests

### Add Custom Test Prompts

Edit `src/test-dataset.ts` to add custom prompts:

```typescript
{
  id: 'custom-1',
  text: 'Your custom prompt here',
  locale: 'en',
  expectedGameType: 'jumper',
  difficulty: 'medium',
  description: 'Description of your test case',
}
```

### Adjust Confidence Threshold

Edit `src/integration-test.ts` to adjust the confidence threshold:

```typescript
const success = result.confidence >= 0.7; // Change threshold here
```

## Troubleshooting

### "LLM Client not configured"

**Problem**: API keys not set

**Solution**: Set environment variables:
```bash
export OPENAI_API_KEY="sk-..."
# or
export ANTHROPIC_API_KEY="sk-ant-..."
```

### Rate Limit Errors

**Problem**: Too many requests to LLM API

**Solution**: Tests include delays between prompts. If still hitting limits, reduce test set size:
```bash
ts-node src/integration-test.ts quick  # Only 5 prompts
```

### Low Pass Rate

**Problem**: Many tests failing

**Solution**: Check the generated GameSpecs in the report file. Common issues:
- Prompts too vague
- Missing few-shot examples for specific patterns
- Repair rules not covering all cases

## Performance Benchmarks

Expected performance on a standard machine:

- **Average processing time**: 1-3 seconds per prompt
- **Total time for 25 prompts**: 30-90 seconds
- **API cost**: ~$0.10-0.30 for 25 prompts (depending on LLM provider)

## Next Steps

After running integration tests:

1. **Review failed tests**: Check the report for failed prompts
2. **Analyze low-confidence results**: Review GameSpecs with confidence < 0.7
3. **Optimize prompts**: Update system prompt or few-shot examples
4. **Add repair rules**: Add custom repair rules for common issues
5. **Re-run tests**: Validate improvements

## CI/CD Integration

To run in CI/CD pipeline:

```yaml
- name: Run Integration Tests
  env:
    OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
  run: pnpm run test:integration:easy
```

For faster CI runs, use `test:integration:quick` or `test:integration:easy`.
