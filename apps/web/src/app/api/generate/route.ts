import { NextRequest, NextResponse } from 'next/server';
import { Orchestrator } from '@loom/orchestrator';
import type { GameSpec } from '@loom/core';
import { transform } from 'sucrase';

/**
 * Compile TypeScript code to JavaScript using Sucrase
 * @param code TypeScript code
 * @param filename File path for error messages
 * @returns Compiled JavaScript code
 */
function compileTypeScript(code: string, filename: string): string {
  try {
    const result = transform(code, {
      transforms: ['typescript'],
      filePath: filename,
      production: true,
    });
    return result.code;
  } catch (error) {
    console.error(`Failed to compile ${filename}:`, error);
    throw new Error(
      `TypeScript compilation failed for ${filename}: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}

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

    // Create Orchestrator (MVP uses template mode)
    const orchestrator = new Orchestrator({
      enableAssetResolution: false,
      enableLLMCodeGen: false,
      enableCodeReview: false,
    });

    // Generate game code (TypeScript)
    const result = await orchestrator.generate({ gameSpec });

    // Compile TypeScript to JavaScript on server side
    const compiledFiles = result.codeOutput.files.map((file) => {
      // Only compile .ts files
      if (file.path.endsWith('.ts')) {
        try {
          const compiledCode = compileTypeScript(file.content, file.path);
          return {
            path: file.path.replace(/\.ts$/, '.js'),
            content: compiledCode,
            type: file.type,
          };
        } catch (error) {
          // If compilation fails, return error message in the file
          console.error(`Compilation error in ${file.path}:`, error);
          return {
            ...file,
            content: `// COMPILATION ERROR\n// ${
              error instanceof Error ? error.message : 'Unknown error'
            }\n\n// Original TypeScript code:\n${file.content}`,
          };
        }
      }
      return file;
    });

    return NextResponse.json({
      success: true,
      files: compiledFiles,
      diagnostics: {
        ...result.diagnostics,
        compilationMethod: 'sucrase',
      },
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
