import { lazy, Suspense } from "react";
import { createPortal } from "react-dom";
import {
  useWindowManagerStore,
  useWindowIds,
} from "../../store/windowManagerStore";
import Dock from "./Dock";
import WorkCardWindow from "./WorkCardWindow";
import DraggableWindow from "./DraggableWindow";
import { WindowOverlay } from "./DraggableWindow";
import EdgeGlow from "./EdgeGlow";
import { TabTransferProvider } from "../../hooks/useTabTransfer";

const Terminal = lazy(() => import("../Terminal/Terminal"));

function TerminalWindow() {
  const win = useWindowManagerStore((s) => s.windows["terminal"]);
  const closeWindow = useWindowManagerStore((s) => s.closeWindow);

  if (!win) return null;

  const meta = win.meta as
    | { terminalBuffer?: string[]; terminalState?: { commandHistory: string[]; currentDirectory: string } }
    | undefined;

  return (
    <DraggableWindow windowId="terminal" title="Terminal">
      <Suspense fallback={null}>
        <Terminal
          onClose={() => closeWindow("terminal")}
          hideHeader
          transferBuffer={meta?.terminalBuffer}
          transferState={meta?.terminalState}
        />
      </Suspense>
    </DraggableWindow>
  );
}

function WindowItem({ windowId }: { windowId: string }) {
  const win = useWindowManagerStore((s) => s.windows[windowId]);
  if (!win) return null;

  switch (win.type) {
    case "terminal":
      return <TerminalWindow />;
    case "workcard":
      return <WorkCardWindow windowId={win.id} />;
    default:
      return null;
  }
}

function WindowRenderer() {
  const windowIds = useWindowIds();

  return createPortal(
    <TabTransferProvider>
      <WindowOverlay>
        {windowIds.map((id) => (
          <WindowItem key={id} windowId={id} />
        ))}
        <Dock />
        <EdgeGlow />
      </WindowOverlay>
    </TabTransferProvider>, document.body
  );
}

export default WindowRenderer;
