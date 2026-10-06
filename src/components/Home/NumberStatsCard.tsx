import { motion, useMotionValue, useTransform } from "motion/react";
import React from "react";
import useIsMobile from "../../hooks/useIsMobile";

interface CardProps {
  frontCard: boolean;
  exitX: number;
  imgSrc?: string;
}

const NumberStatsCard: React.FC<CardProps> = ({ frontCard, exitX, imgSrc }) => {
  const isMobile = useIsMobile();
  const x = useMotionValue(0);
  const scale = useTransform(x, [-150, 0, 150], [0.5, 1, 0.5]);
  const rotate = useTransform(x, [-150, 0, 150], [-45, 0, 45], {
    clamp: false,
  });

  const variantsFrontCard = {
    animate: { scale: 1, y: 0, opacity: 1 },
    exit: { opacity: 0, scale: 0.5, transition: { duration: 0.5 } },
  };

  const variantsBackCard = {
    initial: { scale: 0, y: isMobile ? 80 : 105, opacity: 0 },
    animate: { scale: 0.75, y: isMobile ? 20 : 30, opacity: 0.5 },
  };

  return (
    <motion.div
      className={`card ${frontCard ? "front-card" : "back-card"}`}
      style={{
        x,
        rotate,
      }}
      variants={frontCard ? variantsFrontCard : variantsBackCard}
      initial="initial"
      animate="animate"
      exit="exit"
      custom={exitX}
      transition={
        frontCard
          ? { type: "spring", stiffness: 300, damping: 20 }
          : { scale: { duration: 0.5 }, opacity: { duration: 0.4 } }
      }
    >
      <motion.div className="card-content" style={{ scale }}>
        {imgSrc && <img src={imgSrc} alt="icon" className="icon-img" />}
      </motion.div>
    </motion.div>
  );
};

export default NumberStatsCard;
