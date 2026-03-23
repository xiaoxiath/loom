/**
 * @loom/code-generator
 *
 * Code Generator for Loom game generation platform
 */

export { CodeGenerator, createCodeGenerator } from './generator';
export type {
  CodeGeneratorInput,
  CodeGeneratorOutput,
  CodeGeneratorOptions,
  GeneratedFile,
  GeneratorDiagnostics,
  TemplateContext,
  EntityTemplateData,
  ComponentTemplateData,
  SystemTemplateData,
} from './types';
