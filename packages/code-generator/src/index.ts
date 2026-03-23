/**
 * @loom/code-generator
 *
 * Code Generator for Loom game generation platform
 */

export { CodeGenerator, createCodeGenerator, type CodeGeneratorConfig } from './generator';
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
