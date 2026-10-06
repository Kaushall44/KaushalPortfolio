import { useEffect } from "react";
import { useHandsfreeStore } from "../../store/handsfreeStore";
import {
  useWindowManagerStore,
  useWindow,
} from "../../store/windowManagerStore";
import DraggableWindow from "../WindowManager/DraggableWindow";
import { motion } from "motion/react";

const HandsfreeIntroModal: React.FC = () => {
  const {
    showIntroModal,
    setShowIntroModal,
    setHasSeenIntro,
    setEnabled,
    cameraPermission,
    setCameraPermission,
    modelLoadProgress,
  } = useHandsfreeStore();

  const { setShowGestureTutorial } = useHandsfreeStore();
  const openWindow = useWindowManagerStore((s) => s.openWindow);
  const closeWindow = useWindowManagerStore((s) => s.closeWindow);
  const win = useWindow("handsfree-intro");

  // Bridge: handsfreeStore -> windowManagerStore
  useEffect(() => {
    if (showIntroModal && !win) {
      const modalWidth = Math.min(480, window.innerWidth - 40);
      openWindow({
        id: "handsfree-intro",
        title: "Handsfree Mode",
        type: "handsfree-intro",
        status: "open",
        position: {
          x: Math.max(20, (window.innerWidth - modalWidth) / 2),
          y: Math.max(20, (window.innerHeight - 400) / 2),
        },
        size: { width: modalWidth, height: 0 },
      });
    }
  }, [showIntroModal, win, openWindow]);

  // Bridge: windowManagerStore -> handsfreeStore (when window is closed via MacButtons)
  useEffect(() => {
    if (!win && showIntroModal) {
      setShowIntroModal(false);
    }
  }, [win, showIntroModal, setShowIntroModal]);

  const handleClose = () => {
    closeWindow("handsfree-intro");
    setShowIntroModal(false);
  };

  const handleEnable = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((t) => t.stop());
      setCameraPermission("granted");
      setHasSeenIntro(true);
      handleClose();
      setEnabled(true);
      setTimeout(() => setShowGestureTutorial(true), 1500);
    } catch {
      setCameraPermission("denied");
    }
  };

  if (!win || win.status === "minimized") return null;

  return (
    <DraggableWindow windowId="handsfree-intro" title="Handsfree Mode">
      <div className="handsfree-modal-body">
        <h2 className="heading">Handsfree Mode</h2>
        <p className="desc">
          Control this portfolio with your head and hands — no mouse needed.
        </p>
        <div className="features">
          <div className="feature">
            <span className="feature-icon">👤</span>
            <span>Move your head to control the robot</span>
          </div>
          <div className="feature">
            <span className="feature-icon">👌</span>
            <span>Pinch to click, pinch and drag to scroll</span>
          </div>
          <div className="feature">
            <span className="feature-icon">✋</span>
            <span>Activate chips mode to play with skill icons</span>
          </div>
        </div>
        <p className="desc subtle">
          Requires camera access. Video is processed locally and never
          leaves your device.
        </p>
        {cameraPermission === "denied" && (
          <p className="desc error">
            Camera access was denied. Please allow camera access in your
            browser settings and try again.
          </p>
        )}
        {modelLoadProgress > 0 && modelLoadProgress < 100 && (
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${modelLoadProgress}%` }}
            />
          </div>
        )}
        <motion.button
          className="enable-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleEnable}
        >
          Enable Handsfree
        </motion.button>
      </div>
    </DraggableWindow>
  );
};

export default HandsfreeIntroModal;
