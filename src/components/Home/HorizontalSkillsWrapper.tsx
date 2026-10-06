import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useMemo, useRef } from "react";
import { useThemeStore } from "../../store/themeStore";
import HorizontalSkills from "./HorizontalSkills";

gsap.registerPlugin(ScrollTrigger);

const lightIcons = ["/assets/skills/react.svg","/assets/skills/nextjs.svg","/assets/skills/typescript.svg","/assets/skills/javascript.svg","/assets/skills/html5.svg","/assets/skills/css3.svg","/assets/skills/tailwindcss.svg","/assets/skills/nodejs.svg","/assets/skills/python.svg","/assets/skills/firebase.svg","/assets/skills/git.svg","/assets/skills/github.svg","/assets/skills/vite.svg"];
const darkIcons = lightIcons;

const lightIcons1 = lightIcons.slice(0, 7);
const lightIcons2 = lightIcons.slice(7);
const darkIcons1 = lightIcons1;
const darkIcons2 = lightIcons2;

function HorizontalSkillsWrapper() {
  const { darkMode } = useThemeStore();
  const containerRef1 = useRef<HTMLDivElement | null>(null);
  const containerRef2 = useRef<HTMLDivElement | null>(null);

  const icons1 = useMemo(
    () => (darkMode ? darkIcons1 : lightIcons1),
    [darkMode]
  );
  const icons2 = useMemo(
    () => (darkMode ? darkIcons2 : lightIcons2),
    [darkMode]
  );

  return (
    <div className="horizontal-skills-parent">
      <HorizontalSkills icons={icons1} ref={containerRef1} />
      <HorizontalSkills icons={icons2} reverse={true} ref={containerRef2} />
    </div>
  );
}

export default HorizontalSkillsWrapper;
