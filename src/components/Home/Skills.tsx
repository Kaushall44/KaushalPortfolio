import { useInView } from "motion/react";
import React, { useEffect, useMemo, useRef, useState } from "react";

import useIsMobile from "../../hooks/useIsMobile";
import { useThemeStore } from "../../store/themeStore";
import SkillsCanvas from "./SkillsCanvas";

const lightIcons = ["/assets/skills/react.svg","/assets/skills/nextjs.svg","/assets/skills/typescript.svg","/assets/skills/javascript.svg","/assets/skills/html5.svg","/assets/skills/css3.svg","/assets/skills/tailwindcss.svg","/assets/skills/nodejs.svg","/assets/skills/python.svg","/assets/skills/firebase.svg","/assets/skills/git.svg","/assets/skills/github.svg","/assets/skills/vite.svg"];
const darkIcons = lightIcons;

const deskstopFinalPositions = [
  { x: -500, y: 0 },
  { x: 650, y: 100 },
  { x: 600, y: -50 },
  { x: -600, y: -150 },
  { x: -600, y: 250 },
  { x: 100, y: -250 },
  { x: -400, y: -300 },
  { x: 500, y: 200 },
  { x: -300, y: 0 },
  { x: 300, y: 0 },
  { x: 250, y: 300 },
  { x: 550, y: -300 },
  { x: -250, y: 250 },
];

const mobileFinalPositions = [
  { x: -100, y: 120 },
  { x: 150, y: 110 },
  { x: 120, y: -150 },
  { x: -120, y: -275 },
  { x: 0, y: 325 },
  { x: 10, y: -280 },
  { x: -100, y: -150 },
  { x: 5, y: 150 },
  { x: -150, y: 300 },
  { x: 150, y: 380 },
  { x: 125, y: -360 },
  { x: -150, y: -370 },
  { x: 100, y: 250 },
];

const Skills: React.FC = () => {
  const isMobile = useIsMobile();
  const { darkMode } = useThemeStore();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, {
    margin: "0px 0px -40% 0px",
    amount: 0.1,
    once: true,
  });

  const [vpWidth, setVpWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1400
  );
  useEffect(() => {
    const onResize = () => setVpWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const finalPositions = useMemo(() => {
    if (isMobile) return mobileFinalPositions;
    const scale = Math.max(1, vpWidth / 1400);
    return deskstopFinalPositions.map((p) => ({
      x: p.x * scale,
      y: p.y,
    }));
  }, [isMobile, vpWidth]);

  const iconUrls = useMemo(
    () => (darkMode ? darkIcons : lightIcons),
    [darkMode]
  );

  return (
    <div className="skills-container" ref={ref} id="skills">
      <p className="sr-only">React, Next.js, TypeScript, JavaScript, HTML, CSS, Tailwind CSS, Node.js, Python, Firebase, Git, GitHub, and Vite.</p>
      <p className="main-text" data-color-inverted={"true"}>
        Always Building, <br />
        Always Growing.
      </p>
      <SkillsCanvas
        iconUrls={iconUrls}
        finalPositions={finalPositions}
        isMobile={isMobile}
        triggerEntrance={inView}
      />
    </div>
  );
};

export default Skills;
