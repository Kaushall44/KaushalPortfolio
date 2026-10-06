import { AnimatePresence, motion } from "motion/react";
import { useTabTransfer } from "../../hooks/useTabTransfer";

function EdgeGlow() {
  const { peerGlowEdge } = useTabTransfer();

  return (
    <>
      <AnimatePresence>
        {peerGlowEdge === "left" && (
          <motion.div
            key="glow-left"
            className="window-glow window-glow--left"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {peerGlowEdge === "right" && (
          <motion.div
            key="glow-right"
            className="window-glow window-glow--right"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

export default EdgeGlow;
