import { create } from "zustand";

interface TerminalState {
  currentDirectory: string;
  commandHistory: string[];
  historyIndex: number;
  isBooted: boolean;
  matrixActive: boolean;
  isAiLoading: boolean;

  setDirectory: (dir: string) => void;
  addToHistory: (command: string) => void;
  setHistoryIndex: (index: number) => void;
  setBooted: (booted: boolean) => void;
  setMatrixActive: (active: boolean) => void;
  setAiLoading: (loading: boolean) => void;
}

export const useTerminalStore = create<TerminalState>((set) => ({
  currentDirectory: "~",
  commandHistory: [],
  historyIndex: -1,
  isBooted: false,
  matrixActive: false,
  isAiLoading: false,

  setDirectory: (dir) => set({ currentDirectory: dir }),

  addToHistory: (command) =>
    set((state) => ({
      commandHistory: [...state.commandHistory, command],
      historyIndex: -1,
    })),

  setHistoryIndex: (index) => set({ historyIndex: index }),
  setBooted: (booted) => set({ isBooted: booted }),
  setMatrixActive: (active) => set({ matrixActive: active }),
  setAiLoading: (loading) => set({ isAiLoading: loading }),
}));
