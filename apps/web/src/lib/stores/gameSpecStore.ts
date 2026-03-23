import { create } from 'zustand';
import type { GameSpec } from '@loom/core';

interface GameSpecState {
  currentSpec: GameSpec | null;
  history: GameSpec[];
  historyIndex: number;

  // Actions
  setGameSpec: (spec: GameSpec) => void;
  updateGameSpec: (updates: Partial<GameSpec>) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  reset: () => void;
}

export const useGameSpecStore = create<GameSpecState>((set, get) => ({
  currentSpec: null,
  history: [],
  historyIndex: -1,

  setGameSpec: (spec) =>
    set((state) => ({
      currentSpec: spec,
      history: [...state.history.slice(0, state.historyIndex + 1), spec],
      historyIndex: state.historyIndex + 1,
    })),

  updateGameSpec: (updates) =>
    set((state) => {
      if (!state.currentSpec) return state;
      const newSpec = { ...state.currentSpec, ...updates };
      return {
        currentSpec: newSpec,
        history: [
          ...state.history.slice(0, state.historyIndex + 1),
          newSpec,
        ],
        historyIndex: state.historyIndex + 1,
      };
    }),

  undo: () =>
    set((state) => {
      if (state.historyIndex <= 0) return state;
      const newIndex = state.historyIndex - 1;
      return {
        historyIndex: newIndex,
        currentSpec: state.history[newIndex]!,
      };
    }),

  redo: () =>
    set((state) => {
      if (state.historyIndex >= state.history.length - 1) return state;
      const newIndex = state.historyIndex + 1;
      return {
        historyIndex: newIndex,
        currentSpec: state.history[newIndex]!,
      };
    }),

  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,

  reset: () =>
    set({
      currentSpec: null,
      history: [],
      historyIndex: -1,
    }),
}));
