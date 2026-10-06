import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useCallback, useState } from "react";
import { FiX } from "react-icons/fi";
import {
  useMinimizedWindows,
  useWindowManagerStore,
  setDockIconRect,
  removeDockIconRect,
  WindowState,
} from "../../store/windowManagerStore";

const MAX_VISIBLE = 5;

function DockItem({
  win,
  onRestore,
  onClose,
}: {
  win: WindowState;
  onRestore: (id: string) => void;
  onClose: (id: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // Register position for genie animation targeting
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      setDockIconRect(win.id, el.getBoundingClientRect());
    };

    update();
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("resize", update);
      removeDockIconRect(win.id);
    };
  }, [win.id]);

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose(win.id);
  };

  return (
    <motion.div
      ref={ref}
      className="dock__item"
      layout
      data-window-id={win.id}
      role="button"
      tabIndex={0}
      aria-label={`Restore ${win.title}`}
      onKeyDown={e => { if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onRestore(win.id); } }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      whileHover={{ scale: 1.08, y: -3 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      onClick={() => onRestore(win.id)}
    >
      <div className="dock__preview">
        {win.thumbnail ? (
          <img
            src={win.thumbnail}
            alt={win.title}
            className="dock__thumbnail"
            draggable={false}
          />
        ) : (
          <div className={`dock__placeholder dock__placeholder--${win.type}`}>
            <span className="dock__placeholder-title">{win.title}</span>
          </div>
        )}
      </div>
      <button className="dock__close" aria-label={`Close ${win.title}`} onClick={handleClose}>
        <FiX />
      </button>
      <span className="dock__label">{win.title}</span>
    </motion.div>
  );
}

function Dock() {
  const minimizedWindows = useMinimizedWindows();
  const restoreWindow = useWindowManagerStore((s) => s.restoreWindow);
  const closeWindow = useWindowManagerStore((s) => s.closeWindow);
  const [expanded, setExpanded] = useState(false);

  const handleRestore = useCallback(
    (id: string) => {
      restoreWindow(id);
    },
    [restoreWindow]
  );

  const handleClose = useCallback(
    (id: string) => {
      closeWindow(id);
    },
    [closeWindow]
  );

  // Reset expanded state when we drop below the threshold
  useEffect(() => {
    if (minimizedWindows.length <= MAX_VISIBLE) {
      setExpanded(false);
    }
  }, [minimizedWindows.length]);

  const hasOverflow = minimizedWindows.length > MAX_VISIBLE;
  const visibleWindows = expanded
    ? minimizedWindows
    : minimizedWindows.slice(0, MAX_VISIBLE);
  const hiddenCount = minimizedWindows.length - MAX_VISIBLE;

  return (
    <AnimatePresence>
      {minimizedWindows.length > 0 && (
        <motion.div
          className={`dock ${expanded ? "dock--expanded" : ""}`}
          layout
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 28,
            layout: { type: "spring", stiffness: 300, damping: 30 },
          }}
          onMouseEnter={() => hasOverflow && setExpanded(true)}
          onMouseLeave={() => setExpanded(false)}
        >
          <AnimatePresence mode="popLayout">
            {visibleWindows.map((win) => (
              <DockItem
                key={win.id}
                win={win}
                onRestore={handleRestore}
                onClose={handleClose}
              />
            ))}
          </AnimatePresence>
          {hasOverflow && !expanded && (
            <motion.div
              className="dock__overflow-badge"
              layout
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
            >
              +{hiddenCount}
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Dock;
