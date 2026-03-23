import { NextRequest, NextResponse } from 'next/server';
import { Orchestrator } from '@loom/orchestrator';
import type { GameSpec } from '@loom/core';
import * as esbuild from 'esbuild';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

/**
 * Bundle TypeScript game code using esbuild
 *
 * Architecture:
 * 1. Orchestrator generates TypeScript project (main.ts, config.ts, MainScene.ts)
 * 2. Write files to temporary directory
 * 3. esbuild bundles all dependencies into single bundle.js
 * 4. Return bundle to client for browser execution
 */
export async function POST(request: NextRequest) {
  const tempDir = path.join(os.tmpdir(), `loom-game-${Date.now()}`);

  try {
    const body = await request.json();
    const { gameSpec } = body as { gameSpec: GameSpec };

    if (!gameSpec) {
      return NextResponse.json(
        { success: false, error: 'GameSpec is required' },
        { status: 400 }
      );
    }

    // 1. Generate TypeScript code
    const orchestrator = new Orchestrator({
      enableAssetResolution: false,
      enableLLMCodeGen: false,
      enableCodeReview: false,
    });

    const result = await orchestrator.generate({ gameSpec });

    // 2. Create temporary project directory
    await fs.mkdir(tempDir, { recursive: true });
    await fs.mkdir(path.join(tempDir, 'src'), { recursive: true });
    await fs.mkdir(path.join(tempDir, 'src/scenes'), { recursive: true });

    // 3. Write generated files
    for (const file of result.codeOutput.files) {
      const filePath = path.join(tempDir, file.path);
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, file.content, 'utf-8');
    }

    // 4. Create package.json for dependency resolution
    const packageJson = {
      name: 'loom-game',
      version: '1.0.0',
      type: 'module',
      dependencies: {
        phaser: '^3.60.0',
      },
    };
    await fs.writeFile(
      path.join(tempDir, 'package.json'),
      JSON.stringify(packageJson, null, 2),
      'utf-8'
    );

    // 5. Bundle with esbuild
    const entryPoint = path.join(tempDir, 'src/main.ts');

    // Check if main.ts exists, if not use config.ts
    const mainExists = await fs
      .access(entryPoint)
      .then(() => true)
      .catch(() => false);
    const actualEntry = mainExists
      ? entryPoint
      : path.join(tempDir, 'src/config.ts');

    const bundleResult = await esbuild.build({
      entryPoints: [actualEntry],
      bundle: true,
      minify: true,
      format: 'iife', // Immediately Invoked Function Expression for browser
      globalName: 'GameBundle',
      platform: 'browser',
      target: ['es2020'],
      outfile: 'bundle.js',
      write: false, // Return result instead of writing to disk
      external: [], // Bundle everything including Phaser
      loader: {
        '.png': 'file',
        '.jpg': 'file',
        '.json': 'json',
      },
      define: {
        'process.env.NODE_ENV': '"production"',
      },
    });

    // 6. Extract bundle content
    const bundleFile = bundleResult.outputFiles?.[0];
    if (!bundleFile) {
      throw new Error('esbuild did not produce output');
    }

    const bundleContent = bundleFile.text;

    // 7. Return bundled code
    return NextResponse.json({
      success: true,
      files: [
        {
          path: 'bundle.js',
          content: bundleContent,
          type: 'bundle',
        },
        ...result.codeOutput.files.map((f) => ({
          ...f,
          type: f.type === 'scene' ? 'scene' : 'source',
        })),
      ],
      diagnostics: {
        ...result.diagnostics,
        bundleMethod: 'esbuild',
        bundleSize: bundleContent.length,
      },
    });
  } catch (error) {
    console.error('Bundle error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  } finally {
    // 8. Clean up temporary directory
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (cleanupError) {
      console.error('Cleanup error:', cleanupError);
    }
  }
}
