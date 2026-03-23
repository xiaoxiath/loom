/**
 * TypeScript to JavaScript code transformer for browser preview
 *
 * WHY: Generated Phaser code contains TypeScript syntax that browsers cannot execute.
 * This utility strips TS-specific syntax to create plain JavaScript for iframe preview.
 *
 * LIMITATIONS:
 * - Uses regex-based approach for MVP simplicity
 * - Handles common patterns but may fail on complex TS (multiline generics, type imports, enums)
 * - For production, consider using esbuild/sucrase for robust transformation
 */

// Pre-compiled regex patterns for performance
const PATTERNS = {
  // Remove ES6 module syntax
  exportStatement: /export\s+(default\s+)?/g,
  importStatement: /import\s+.*?from\s+['"].*?['"];?\n?/g,

  // Remove TypeScript class field declarations (no initializer)
  privateFieldNoInit: /^\s*(?:private|public)\s+\w+!:\s*[^;]+;\s*$/gm,

  // Transform class fields with initializers (preserve the value)
  privateFieldWithInit: /^\s*(?:private|public)\s+(\w+)\s*(?::\s*[^;=]+)?\s*=\s*/gm,

  // Remove function parameter type annotations
  parameterType: /\((\w+):\s*[^,)]+\)/g,

  // Remove return type annotations
  returnType: /\):\s*[A-Za-z.<>[\]|]+\s*{/g,

  // Remove generic type parameters (e.g., <T>, <T extends U>)
  genericParameter: /<[^>]+>/g,

  // Clean up excessive blank lines
  multipleBlankLines: /\n\s*\n\s*\n/g,
};

/**
 * Strip TypeScript-specific syntax from code to make it browser-executable
 * @param code TypeScript code
 * @returns JavaScript code suitable for browser execution
 */
export function stripTypeScript(code: string): string {
  if (!code) return '';

  return code
    .replace(PATTERNS.exportStatement, '')
    .replace(PATTERNS.importStatement, '')
    .replace(PATTERNS.privateFieldNoInit, '')
    .replace(PATTERNS.privateFieldWithInit, '  $1 = ')
    .replace(PATTERNS.parameterType, '($1)')
    .replace(PATTERNS.returnType, '): {')
    .replace(PATTERNS.genericParameter, '')
    .replace(PATTERNS.multipleBlankLines, '\n\n');
}
