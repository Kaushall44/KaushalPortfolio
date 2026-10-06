import { create } from "zustand";
import { useShallow } from "zustand/shallow";

export type WindowId = string;

export type WindowType =
  | "terminal"
  | "workcard"
  | "handsfree-intro"
  | "gesture-tutorial";

export interface WindowGeometry {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WindowState {
  id: WindowId;
  title: string;
  type: WindowType;
  status: "open" | "minimized" | "maximized";
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  previousGeometry?: WindowGeometry;
  minimizedFrom?: "open" | "maximized";
  meta?: Record<string, unknown>;
  thumbnail?: string; // data URL captured before minimize
}

// Use plain objects instead of Map for React 19 compatibility
type WindowsRecord = Record<WindowId, WindowState>;

interface WindowManagerState {
  windows: WindowsRecord;
  focusOrder: WindowId[];
  nextZIndex: number;

  openWindow: (win: Omit<WindowState, "zIndex">) => void;
  closeWindow: (id: WindowId) => void;
  minimizeWindow: (id: WindowId) => void;
  restoreWindow: (id: WindowId) => void;
  maximizeWindow: (id: WindowId) => void;
  unmaximizeWindow: (id: WindowId) => void;
  focusWindow: (id: WindowId) => void;
  updatePosition: (id: WindowId, pos: { x: number; y: number }) => void;
  updateSize: (id: WindowId, size: { width: number; height: number }) => void;
  setThumbnail: (id: WindowId, dataUrl: string) => void;
  acceptTransferredWindow: (win: Omit<WindowState, "zIndex">) => void;
}

// Dock icon rects stored outside Zustand (only read imperatively during animations)
const dockIconRects = new Map<WindowId, DOMRect>();

export function setDockIconRect(id: WindowId, rect: DOMRect) {
  dockIconRects.set(id, rect);
}

export function removeDockIconRect(id: WindowId) {
  if (!useWindowManagerStore.getState().windows[id]) dockIconRects.delete(id);
}

export function getDockIconRect(id: WindowId): DOMRect | undefined {
  return dockIconRects.get(id);
}

export const useWindowManagerStore = create<WindowManagerState>((set, get) => ({
  windows: {},
  focusOrder: [],
  nextZIndex: 10001,

  openWindow: (win) => {
    const state = get();
    const existing = state.windows[win.id];

    if (existing && existing.status !== "minimized") {
      get().focusWindow(win.id);
      return;
    }

    if (existing && existing.status === "minimized") {
      get().restoreWindow(win.id);
      return;
    }

    const zIndex = state.nextZIndex;
    set({
      windows: { ...state.windows, [win.id]: { ...win, zIndex } },
      focusOrder: [...state.focusOrder, win.id],
      nextZIndex: zIndex + 1,
    });
  },

  closeWindow: (id) => {
    dockIconRects.delete(id);
    const state = get();
    const { [id]: _, ...rest } = state.windows;
    set({
      windows: rest,
      focusOrder: state.focusOrder.filter((wid) => wid !== id),
    });
  },

  minimizeWindow: (id) => {
    const state = get();
    const win = state.windows[id];
    if (!win) return;

    set({
      windows: { ...state.windows, [id]: { ...win, status: "minimized", minimizedFrom: win.status === "maximized" ? "maximized" : "open" } },
      focusOrder: state.focusOrder.filter((wid) => wid !== id),
    });
  },

  restoreWindow: (id) => {
    const state = get();
    const win = state.windows[id];
    if (!win) return;

    const zIndex = state.nextZIndex;
    set({
      windows: {
        ...state.windows,
        [id]: { ...win, status: win.minimizedFrom || "open", zIndex, thumbnail: undefined },
      },
      focusOrder: [...state.focusOrder.filter((wid) => wid !== id), id],
      nextZIndex: zIndex + 1,
    });
  },

  maximizeWindow: (id) => {
    const state = get();
    const win = state.windows[id];
    if (!win || win.status === "maximized") return;

    const zIndex = state.nextZIndex;
    set({
      windows: {
        ...state.windows,
        [id]: {
          ...win,
          status: "maximized",
          zIndex,
          previousGeometry: {
            x: win.position.x,
            y: win.position.y,
            width: win.size.width,
            height: win.size.height,
          },
          position: { x: 0, y: 0 },
          size: { width: window.innerWidth, height: window.innerHeight },
        },
      },
      focusOrder: [...state.focusOrder.filter((wid) => wid !== id), id],
      nextZIndex: zIndex + 1,
    });
  },

  unmaximizeWindow: (id) => {
    const state = get();
    const win = state.windows[id];
    if (!win || win.status !== "maximized") return;

    const prev = win.previousGeometry;
    set({
      windows: {
        ...state.windows,
        [id]: {
          ...win,
          status: "open",
          position: prev ? { x: prev.x, y: prev.y } : { x: 100, y: 100 },
          size: prev ? { width: prev.width, height: prev.height } : { width: 800, height: 600 },
          previousGeometry: undefined,
        },
      },
    });
  },

  focusWindow: (id) => {
    const state = get();
    const win = state.windows[id];
    if (!win || win.status === "minimized") return;

    const zIndex = state.nextZIndex;
    set({
      windows: { ...state.windows, [id]: { ...win, zIndex } },
      focusOrder: [...state.focusOrder.filter((wid) => wid !== id), id],
      nextZIndex: zIndex + 1,
    });
  },

  updatePosition: (id, pos) => {
    const state = get();
    const win = state.windows[id];
    if (!win) return;

    set({
      windows: { ...state.windows, [id]: { ...win, position: pos } },
    });
  },

  updateSize: (id, size) => {
    const state = get();
    const win = state.windows[id];
    if (!win) return;

    set({
      windows: { ...state.windows, [id]: { ...win, size } },
    });
  },

  setThumbnail: (id, dataUrl) => {
    const state = get();
    const win = state.windows[id];
    if (!win) return;

    set({
      windows: { ...state.windows, [id]: { ...win, thumbnail: dataUrl } },
    });
  },

  acceptTransferredWindow: (win) => {
    const state = get();
    const zIndex = state.nextZIndex;
    set({
      windows: { ...state.windows, [win.id]: { ...win, zIndex } },
      focusOrder: [...state.focusOrder.filter((wid) => wid !== win.id), win.id],
      nextZIndex: zIndex + 1,
    });
  },
}));

// Convenience selectors - use useShallow to avoid infinite loops with React 19
export const useWindow = (id: WindowId) =>
  useWindowManagerStore((s) => s.windows[id]);

export const useMinimizedWindows = () =>
  useWindowManagerStore(
    useShallow((s) =>
      Object.values(s.windows).filter((w) => w.status === "minimized")
    )
  );

export const useOpenWindows = () =>
  useWindowManagerStore(
    useShallow((s) =>
      Object.values(s.windows).filter((w) => w.status !== "minimized")
    )
  );

export const useWindowIds = () =>
  useWindowManagerStore(
    useShallow((s) => Object.keys(s.windows))
  );
