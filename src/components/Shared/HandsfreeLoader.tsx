import { AnimatePresence, motion } from "motion/react";
import { useHandsfreeStore } from "../../store/handsfreeStore";

const HandsfreeLoader: React.FC = () => {
  const isEnabled = useHandsfreeStore((s) => s.isEnabled);
  const progress = useHandsfreeStore((s) => s.modelLoadProgress);

  const isLoading = isEnabled && progress < 100;

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="handsfree-loader-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div className="handsfree-loader-card">
            <div className="handsfree-loader-spinner" />
            <p className="handsfree-loader-text">Loading Model...</p>
            <div className="handsfree-loader-bar">
              <motion.div
                className="handsfree-loader-fill"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            </div>
            <p className="handsfree-loader-percent">{Math.round(progress)}%</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HandsfreeLoader;
