import { NextRequest, NextResponse } from 'next/server';
import { Orchestrator } from '@loom/orchestrator';
import type { GameSpec } from '@loom/core';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { gameSpec } = body as { gameSpec: GameSpec };

    if (!gameSpec) {
      return NextResponse.json(
        { success: false, error: 'GameSpec is required' },
        { status: 400 }
      );
    }

    // 创建 Orchestrator（MVP 使用模板模式）
    const orchestrator = new Orchestrator({
      enableAssetResolution: false,
      enableLLMCodeGen: false,
      enableCodeReview: false,
    });

    // 生成游戏
    const result = await orchestrator.generate({ gameSpec });

    return NextResponse.json({
      success: true,
      files: result.codeOutput.files,
      diagnostics: result.diagnostics,
    });
  } catch (error) {
    console.error('Generation error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
