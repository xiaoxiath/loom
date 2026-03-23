import { create } from 'zustand';

interface GeneratedFile {
  path: string;
  content: string;
  type: 'scene' | 'entity' | 'system' | 'config' | 'asset' | 'html' | 'package';
}

interface PipelineDiagnostics {
  warnings: string[];
  errors: string[];
  generatedFiles: string[];
  skippedFiles: string[];
  generationMethod?: 'llm' | 'template' | 'template-fallback';
  llmLatencyMs?: number;
  llmTokenUsage?: {
    prompt: number;
    completion: number;
    total: number;
  };
}

interface GenerationState {
  isGenerating: boolean;
  files: GeneratedFile[];
  diagnostics: PipelineDiagnostics | null;
  error: string | null;

  // Actions
  startGeneration: () => void;
  setResults: (files: GeneratedFile[], diagnostics: PipelineDiagnostics) => void;
  setError: (error: string) => void;
  clear: () => void;
}

export const useGenerationStore = create<GenerationState>((set) => ({
  isGenerating: false,
  files: [],
  diagnostics: null,
  error: null,

  startGeneration: () =>
    set({
      isGenerating: true,
      files: [],
      diagnostics: null,
      error: null,
    }),

  setResults: (files, diagnostics) =>
    set({
      isGenerating: false,
      files,
      diagnostics,
      error: null,
    }),

  setError: (error) =>
    set({
      isGenerating: false,
      error,
    }),

  clear: () =>
    set({
      isGenerating: false,
      files: [],
      diagnostics: null,
      error: null,
    }),
}));
