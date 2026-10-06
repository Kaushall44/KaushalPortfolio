import { motion } from "motion/react";
import { useEffect } from "react";
import { useHandsfreeStore } from "../../store/handsfreeStore";
import {
  useWindowManagerStore,
  useWindow,
} from "../../store/windowManagerStore";
import DraggableWindow from "../WindowManager/DraggableWindow";

const gestures = [
  {
    icon: "👤",
    title: "Head Tracking",
    desc: "Move your head to control the robot cursor",
  },
  {
    icon: "👌",
    title: "Pinch to Click",
    desc: "Quick pinch and release to click on elements",
  },
  {
    icon: "👌",
    title: "Pinch & Drag Scroll",
    desc: "Pinch and drag up/down to scroll — with momentum!",
  },
  {
    icon: "🖐",
    title: "Open Hand",
    desc: "Show your palm to move the cursor around the page",
  },
];

const GestureTutorial: React.FC = () => {
  const show = useHandsfreeStore((s) => s.showGestureTutorial);
  const openWindow = useWindowManagerStore((s) => s.openWindow);
  const closeWindow = useWindowManagerStore((s) => s.closeWindow);
  const win = useWindow("gesture-tutorial");

  // Bridge: handsfreeStore -> windowManagerStore
  useEffect(() => {
    if (show && !win) {
      const modalWidth = Math.min(540, window.innerWidth - 40);
      openWindow({
        id: "gesture-tutorial",
        title: "Hand Gestures",
        type: "gesture-tutorial",
        status: "open",
        position: {
          x: Math.max(20, (window.innerWidth - modalWidth) / 2),
          y: Math.max(20, (window.innerHeight - 440) / 2),
        },
        size: { width: modalWidth, height: 0 },
      });
    }
  }, [show, win, openWindow]);

  // Bridge: windowManagerStore -> handsfreeStore
  useEffect(() => {
    if (!win && show) {
      useHandsfreeStore.getState().setShowGestureTutorial(false);
    }
  }, [win, show]);

  const dismiss = () => {
    closeWindow("gesture-tutorial");
    useHandsfreeStore.getState().setShowGestureTutorial(false);
  };

  if (!win || win.status === "minimized") return null;

  return (
    <DraggableWindow windowId="gesture-tutorial" title="Hand Gestures">
      <div className="gesture-tutorial-body">
        <h2 className="gesture-tutorial__title">Hand Gestures</h2>
        <p className="gesture-tutorial__subtitle">
          Here's how to navigate hands-free
        </p>

        <div className="gesture-tutorial__grid">
          {gestures.map((g, i) => (
            <motion.div
              key={g.title}
              className="gesture-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: 1,
                y: 0,
                transition: { delay: 0.1 + i * 0.1 },
              }}
            >
              <div className="gesture-card__icon">{g.icon}</div>
              <div className="gesture-card__info">
                <span className="gesture-card__name">{g.title}</span>
                <span className="gesture-card__desc">{g.desc}</span>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.button
          className="gesture-tutorial__dismiss"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={dismiss}
        >
          Got it!
        </motion.button>
      </div>
    </DraggableWindow>
  );
};

export default GestureTutorial;
