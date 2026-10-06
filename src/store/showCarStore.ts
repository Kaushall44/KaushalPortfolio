import { create } from "zustand";

interface CanvasState {
  showCarCanvas: boolean;
  setShowCarCanvas: (show: boolean) => void;
}

const useCanvasStore = create<CanvasState>((set) => ({
  showCarCanvas: false,
  setShowCarCanvas: (show: boolean) => set({ showCarCanvas: show }),
}));

export default useCanvasStore;
