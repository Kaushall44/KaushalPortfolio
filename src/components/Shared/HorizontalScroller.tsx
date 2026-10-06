import { motion, useScroll, useSpring } from "motion/react";
function HorizontalScroller() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });
  return <motion.div className="horizontal-scroller" style={{ scaleX }} />;
}

export default HorizontalScroller;
