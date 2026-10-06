import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useThemeStore } from "../../store/themeStore";
import NumberStatsCard from "./NumberStatsCard";

const NumbersAndStats = () => {
  const [index, setIndex] = useState(0);
  const { darkMode } = useThemeStore();
  const containerRef = useRef<HTMLDivElement>(null);

  const dataArray = useMemo(() => {
    if (!darkMode) {
      return [
        {
          imgUrl: "/assets/skills/react.svg",
          text: `<span class="orange"> Full Stack </span>Web Development`,
        },
        {
          imgUrl: "/assets/skills/github.svg",
          text: `<span class="orange"> Open Source </span>Projects on GitHub`,
        },
        {
          imgUrl: "/assets/skills/python.svg",
          text: `<span class="orange"> AI </span>Tools & Experiments`,
        },
        {
          imgUrl: "/assets/skills/security.svg",
          text: `<span class="orange"> Cybersecurity </span>Always Learning`,
        },
      ];
    }
    return [
      {
        imgUrl: "/assets/skills/react.svg",
        text: `<span class="orange"> Full Stack </span>Web Development`,
      },
      {
        imgUrl: "/assets/skills/github.svg",
        text: `<span class="orange"> Open Source </span>Projects on GitHub`,
      },
      {
        imgUrl: "/assets/skills/python.svg",
        text: `<span class="orange"> AI </span>Tools & Experiments`,
      },
      {
        imgUrl: "/assets/skills/security.svg",
        text: `<span class="orange"> Cybersecurity </span>Always Learning`,
      },
    ];
  }, [darkMode]);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % dataArray.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [dataArray]);

  return (
    <motion.div ref={containerRef} className="numbers-and-stats">
      <div className="center-text">
        <p className="text-p">What Drives My Work</p>
      </div>
      <motion.div className="card-container">
        <AnimatePresence initial={false}>
          <NumberStatsCard
            key={index}
            frontCard={true}
            exitX={250}
            imgSrc={dataArray[index].imgUrl}
          />
          <NumberStatsCard key={index + 1} frontCard={false} exitX={-250} />
        </AnimatePresence>
      </motion.div>
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="card-text"
        dangerouslySetInnerHTML={{ __html: dataArray[index].text }}
      />
    </motion.div>
  );
};

export default NumbersAndStats;
