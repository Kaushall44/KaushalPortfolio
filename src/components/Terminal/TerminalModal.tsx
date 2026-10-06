import { useEffect, useCallback } from "react";
import {
  useWindowManagerStore,
  useWindow,
} from "../../store/windowManagerStore";
import useIsMobile from "../../hooks/useIsMobile";

function TerminalModal() {
  const terminalWindow = useWindow("terminal");
  const openWindow = useWindowManagerStore((s) => s.openWindow);
  const closeWindow = useWindowManagerStore((s) => s.closeWindow);
  const isMobile = useIsMobile();

  const toggle = useCallback(() => {
    if (terminalWindow) {
      closeWindow("terminal");
    } else {
      openWindow({
        id: "terminal",
        title: "Terminal",
        type: "terminal",
        status: "open",
        position: {
          x: Math.max(0, window.innerWidth / 2 - 480),
          y: Math.max(0, window.innerHeight / 2 - 300),
        },
        size: { width: 960, height: 0 },
      });
    }
  }, [terminalWindow, openWindow, closeWindow]);

  // Lock scroll only on mobile (desktop windows float over scrollable content)
  useEffect(() => {
    const isVisible = terminalWindow && terminalWindow.status !== "minimized";
    if (isMobile && isVisible) {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    }
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [terminalWindow?.status, isMobile]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+J (Mac) or Ctrl+J (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === "j") {
        e.preventDefault();
        toggle();
      }
      if (e.key === "Escape" && terminalWindow && terminalWindow.status !== "minimized") {
        closeWindow("terminal");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [terminalWindow, toggle, closeWindow]);

  // Rendering is handled by WindowRenderer
  return null;
}

export default TerminalModal;
