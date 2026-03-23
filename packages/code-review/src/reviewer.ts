/**
 * Code Review Agent
 *
 * Reviews generated Phaser.js code and provides auto-fix capability
 */

import type { LLMClient, ChatMessage } from '@loom/llm-client';
import type { GeneratedFile } from '@loom/code-generator';
import type { GameSpec } from '@loom/core';
import type { ReviewResult, CodeReviewConfig } from './types';
import { REVIEW_SYSTEM_PROMPT } from './prompts/review-prompt';

export class CodeReviewAgent {
  private llmClient: LLMClient;
  private autoFix: boolean;
  private maxFixRounds: number;

  constructor(llmClient: LLMClient, config: CodeReviewConfig = {}) {
    this.llmClient = llmClient;
    this.autoFix = config.autoFix ?? true;
    this.maxFixRounds = config.maxFixRounds ?? 2;
  }

  /**
   * Review generated code
   */
  async review(sceneFile: GeneratedFile, gameSpec: GameSpec): Promise<ReviewResult> {
    const messages: ChatMessage[] = [
      { role: 'system', content: REVIEW_SYSTEM_PROMPT },
      {
        role: 'user',
        content: this.buildReviewPrompt(sceneFile.content, gameSpec),
      },
    ];

    const response = await this.llmClient.chat(messages, {
      temperature: 0.1,
      maxTokens: 4000,
      jsonMode: { enabled: true },
    });

    const result = JSON.parse(response.content) as ReviewResult;

    // If there are error-level issues and autoFix is enabled
    if (this.autoFix && result.issues.some(i => i.severity === 'error')) {
      return this.fixAndReReview(sceneFile, gameSpec, result, 0);
    }

    return result;
  }

  /**
   * Fix and re-review (recursive, max maxFixRounds rounds)
   */
  private async fixAndReReview(
    originalFile: GeneratedFile,
    gameSpec: GameSpec,
    previousReview: ReviewResult,
    round: number
  ): Promise<ReviewResult> {
    if (round >= this.maxFixRounds) {
      return previousReview; // Max rounds reached, return last review
    }

    // Let LLM fix the code
    const fixResponse = await this.llmClient.chat(
      [
        {
          role: 'system',
          content:
            'Fix the following Phaser.js code based on the review issues. '
            + 'Output ONLY the fixed TypeScript code, no explanations.',
        },
        {
          role: 'user',
          content: `## Current Code\n\`\`\`typescript\n${originalFile.content}\n\`\`\`\n\n`
            + `## Issues Found\n${JSON.stringify(previousReview.issues, null, 2)}\n\n`
            + 'Fix all error-level issues. Output the complete fixed code.',
        },
      ],
      { temperature: 0.1, maxTokens: 8000 }
    );

    const fixedCode = this.stripMarkdownFences(fixResponse.content);

    // Re-review the fixed code
    const fixedFile: GeneratedFile = {
      ...originalFile,
      content: fixedCode,
    };

    const reReview = await this.review(fixedFile, gameSpec);
    reReview.fixedCode = fixedCode;

    return reReview;
  }

  /**
   * Build review prompt
   */
  private buildReviewPrompt(code: string, gameSpec: GameSpec): string {
    return `## Code to Review
\`\`\`typescript
${code}
\`\`\`

## Expected Game Specification
- Title: ${gameSpec.meta.title}
- Genre: ${gameSpec.meta.genre}
- Entities: ${gameSpec.entities.map(e => `${e.id}(${e.type})`).join(', ')}
- Mechanics: ${gameSpec.mechanics.join(', ')}
- Systems: ${gameSpec.systems.join(', ')}

## Review Checklist
1. Does the code compile (no undefined variables, missing imports)?
2. Are all entities from the spec created?
3. Are collision relationships set up correctly?
4. Are all mechanics (${gameSpec.mechanics.join(', ')}) implemented?
5. Is input handling implemented for player?
6. Are there runtime errors (null access, missing Groups)?
7. Is the scoring system implemented (if specified)?
8. Does the camera follow the player?

Respond in JSON format:
{
  "passed": boolean,
  "issues": [{ "severity": "error"|"warning"|"info", "line": number|null, "message": string, "fix": string|null }],
  "suggestions": [string]
}`;
  }

  /**
   * Strip markdown code fences
   */
  private stripMarkdownFences(code: string): string {
    const fenceRegex = /^```(?:typescript|ts)?\s*\n?([\s\S]*?)\n?```$/;
    const match = code.match(fenceRegex);
    return match ? match[1]!.trim() : code;
  }
}
