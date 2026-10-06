import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import {
  initTabChannel,
  destroyTabChannel,
  hasPeerTab,
  postMessage,
  onMessage,
  type TabChannelMessage,
} from "../services/tabChannel";
import {
  useWindowManagerStore,
  type WindowId,
  type WindowState,
} from "../store/windowManagerStore";
import { getTerminalBuffer } from "../services/terminalBridge";
import { useTerminalStore } from "../store/terminalStore";

// Map for DraggableWindow to check on mount — signals "animate from edge"
export const pendingTransferEntries = new Map<
  WindowId,
  { fromEdge: "left" | "right" }
>();

interface TabTransferContextValue {
  hasPeer: boolean;
  transferWindow: (id: WindowId, edge: "left" | "right") => void;
  signalNearEdge: (id: WindowId, edge: "left" | "right") => void;
  signalLeftEdge: (id: WindowId) => void;
  peerGlowEdge: "left" | "right" | null;
}

const TabTransferContext = createContext<TabTransferContextValue>({
  hasPeer: false,
  transferWindow: () => {},
  signalNearEdge: () => {},
  signalLeftEdge: () => {},
  peerGlowEdge: null,
});

export function useTabTransfer() {
  return useContext(TabTransferContext);
}

export function TabTransferProvider({ children }: { children: ReactNode }) {
  const [hasPeer, setHasPeer] = useState(false);
  const [peerGlowEdge, setPeerGlowEdge] = useState<"left" | "right" | null>(
    null
  );
  const peerCheckRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Init/destroy channel
  useEffect(() => {
    initTabChannel();

    // Periodically check peer status
    peerCheckRef.current = setInterval(() => {
      setHasPeer(hasPeerTab());
    }, 1000);

    return () => {
      if (peerCheckRef.current) clearInterval(peerCheckRef.current);
      destroyTabChannel();
    };
  }, []);

  // Listen for incoming window transfers
  useEffect(() => {
    const cleanup = onMessage(
      "TRANSFER_WINDOW",
      (msg: TabChannelMessage) => {
        if (msg.type !== "TRANSFER_WINDOW") return;

        const { edge, windowState } = msg;
        const oppositeEdge = edge === "right" ? "left" : "right";

        // Compute entry position at the opposite edge
        const entryX =
          oppositeEdge === "left"
            ? -(windowState.size.width - 60)
            : window.innerWidth - 60;

        const adjustedState: Omit<WindowState, "zIndex"> = {
          ...windowState,
          status: "open",
          position: { x: entryX, y: windowState.position.y },
        };

        // Signal for DraggableWindow to animate entry
        pendingTransferEntries.set(windowState.id, {
          fromEdge: oppositeEdge,
        });

        // Accept into store
        useWindowManagerStore
          .getState()
          .acceptTransferredWindow(adjustedState);

        // Clear peer glow
        setPeerGlowEdge(null);
      }
    );
    return cleanup;
  }, []);

  // Listen for edge proximity signals from peer tabs
  useEffect(() => {
    const cleanupNear = onMessage(
      "WINDOW_NEAR_EDGE",
      (msg: TabChannelMessage) => {
        if (msg.type !== "WINDOW_NEAR_EDGE") return;
        // Show glow on the OPPOSITE edge of this tab
        setPeerGlowEdge(msg.edge === "right" ? "left" : "right");
      }
    );

    const cleanupLeft = onMessage(
      "WINDOW_LEFT_EDGE",
      (_msg: TabChannelMessage) => {
        setPeerGlowEdge(null);
      }
    );

    return () => {
      cleanupNear();
      cleanupLeft();
    };
  }, []);

  const transferWindow = useCallback(
    (id: WindowId, edge: "left" | "right") => {
      const state = useWindowManagerStore.getState();
      const win = state.windows[id];
      if (!win) return;

      // For terminal windows, capture buffer + store state into meta
      let windowState = win;
      if (win.type === "terminal") {
        const buffer = getTerminalBuffer();
        const termState = useTerminalStore.getState();
        windowState = {
          ...win,
          meta: {
            ...win.meta,
            terminalBuffer: buffer,
            terminalState: {
              commandHistory: termState.commandHistory,
              currentDirectory: termState.currentDirectory,
            },
          },
        };
      }

      // Send the full window state to peer tabs
      postMessage({
        type: "TRANSFER_WINDOW",
        edge,
        windowState,
      });

      // Remove from local store
      state.closeWindow(id);
    },
    []
  );

  const signalNearEdge = useCallback(
    (id: WindowId, edge: "left" | "right") => {
      postMessage({
        type: "WINDOW_NEAR_EDGE",
        edge,
        windowId: id,
      });
    },
    []
  );

  const signalLeftEdge = useCallback((id: WindowId) => {
    postMessage({
      type: "WINDOW_LEFT_EDGE",
      windowId: id,
    });
  }, []);

  return (
    <TabTransferContext.Provider
      value={{
        hasPeer,
        transferWindow,
        signalNearEdge,
        signalLeftEdge,
        peerGlowEdge,
      }}
    >
      {children}
    </TabTransferContext.Provider>
  );
}
