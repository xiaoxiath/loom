import { create } from 'zustand';

type EditorMode = 'json' | 'form';

interface UIState {
  editorMode: EditorMode;
  selectedFilePath: string | null;
  showPreview: boolean;

  // Actions
  setEditorMode: (mode: EditorMode) => void;
  setSelectedFile: (path: string | null) => void;
  togglePreview: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  editorMode: 'json',
  selectedFilePath: null,
  showPreview: true,

  setEditorMode: (mode) => set({ editorMode: mode }),
  setSelectedFile: (path) => set({ selectedFilePath: path }),
  togglePreview: () => set((state) => ({ showPreview: !state.showPreview })),
}));
