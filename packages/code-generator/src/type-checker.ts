/**
 * Simple Phaser API Validator
 *
 * Validates generated code against known Phaser API constraints
 * without requiring full TypeScript compilation
 */

import type { GeneratedFile, GeneratorDiagnostics } from './types';

export interface TypeCheckResult {
  valid: boolean;
  errors: Array<{
    file: string;
    line?: number;
    message: string;
  }>;
  warnings: Array<{
    file: string;
    line?: number;
    message: string;
  }>;
}

/**
 * Common Phaser API mistakes to check for
 */
const API_ERRORS = [
  {
    pattern: /\.setImmovable\(true\)/g,
    disallowedAfter: 'staticSprite',
    message:
      'StaticBody does not have setImmovable() method. Static sprites are already immovable.',
  },
  {
    pattern: /\.setCollideWorldBounds\(true\)/g,
    disallowedAfter: 'staticSprite',
    message:
      'StaticBody does not have setCollideWorldBounds() method. Static sprites do not move.',
  },
  {
    pattern: /this\.load\.image\([^,]+,\s*['"]data:/g,
    message:
      'Phaser 3.60 does not support data URIs in load.image(). Generate textures at runtime instead.',
  },
  {
    pattern: /this\.physics\.add\.staticSprite\(.*\)\s*;/g,
    check: (code: string, match: string) => {
      // Check if setImmovable or setCollideWorldBounds is called after staticSprite
      const afterMatch = code.substring(code.indexOf(match) + match.length, code.indexOf(match) + match.length + 200);
      if (/\.setImmovable\(/.test(afterMatch)) {
        return 'StaticBody does not have setImmovable() method';
      }
      if (/\.setCollideWorldBounds\(/.test(afterMatch)) {
        return 'StaticBody does not have setCollideWorldBounds() method';
      }
      return null;
    },
  },
];

/**
 * Simple regex-based API validator for generated code
 */
export function typeCheckGeneratedCode(
  files: GeneratedFile[],
  diagnostics: GeneratorDiagnostics
): TypeCheckResult {
  const result: TypeCheckResult = {
    valid: true,
    errors: [],
    warnings: [],
  };

  // Filter TypeScript files
  const tsFiles = files.filter(
    f => f.path.endsWith('.ts') || f.path.endsWith('.tsx')
  );

  if (tsFiles.length === 0) {
    return result;
  }

  // Check each file
  for (const file of tsFiles) {
    for (const check of API_ERRORS) {
      if (typeof check.check === 'function') {
        // Custom check function
        const matches = file.content.match(check.pattern);
        if (matches) {
          for (const match of matches) {
            const error = check.check(file.content, match);
            if (error) {
              // Find line number
              const matchIndex = file.content.indexOf(match);
              const lineNumber = file.content.substring(0, matchIndex).split('\n').length;

              result.errors.push({
                file: file.path,
                line: lineNumber,
                message: error,
              });
              result.valid = false;
              diagnostics.errors.push(`${file.path}:${lineNumber} - ${error}`);
            }
          }
        }
      } else if (check.disallowedAfter) {
        // Check for disallowed method calls after specific patterns
        const pattern = new RegExp(
          `${check.disallowedAfter}\\([^)]*\\)[^;]*${check.pattern.source}`,
          'g'
        );
        const matches = file.content.match(pattern);

        if (matches) {
          for (const match of matches) {
            const matchIndex = file.content.indexOf(match);
            const lineNumber = file.content.substring(0, matchIndex).split('\n').length;

            result.errors.push({
              file: file.path,
              line: lineNumber,
              message: check.message,
            });
            result.valid = false;
            diagnostics.errors.push(`${file.path}:${lineNumber} - ${check.message}`);
          }
        }
      } else {
        // Simple pattern match
        const matches = file.content.match(check.pattern);

        if (matches) {
          for (const match of matches) {
            const matchIndex = file.content.indexOf(match);
            const lineNumber = file.content.substring(0, matchIndex).split('\n').length;

            result.errors.push({
              file: file.path,
              line: lineNumber,
              message: check.message,
            });
            result.valid = false;
            diagnostics.errors.push(`${file.path}:${lineNumber} - ${check.message}`);
          }
        }
      }
    }
  }

  return result;
}
