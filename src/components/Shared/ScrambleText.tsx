import { useCallback, useEffect, useRef, useState } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

interface ScrambleTextProps {
  texts: string[];
  speed?: number;
  pauseDuration?: number;
  style?: React.CSSProperties;
}

function ScrambleText({
  texts,
  speed = 100,
  pauseDuration = 1000,
  style,
}: ScrambleTextProps) {
  const [display, setDisplay] = useState(texts[0]);
  const indexRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const scrambleTo = useCallback(
    (target: string) => {
      let iteration = 0;
      const maxIterations = target.length;

      const interval = setInterval(() => {
        setDisplay(
          target
            .split("")
            .map((char, i) => {
              if (i < iteration) return char;
              return CHARS[Math.floor(Math.random() * CHARS.length)];
            })
            .join("")
        );

        iteration += 1;
        if (iteration > maxIterations) {
          clearInterval(interval);
          setDisplay(target);
        }
      }, speed / 2);
    },
    [speed]
  );

  useEffect(() => {
    const cycle = () => {
      indexRef.current = (indexRef.current + 1) % texts.length;
      scrambleTo(texts[indexRef.current]);
      timeoutRef.current = setTimeout(cycle, pauseDuration + speed * 3);
    };

    timeoutRef.current = setTimeout(cycle, pauseDuration);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [texts, speed, pauseDuration, scrambleTo]);

  return <span style={style}>{display}</span>;
}

export default ScrambleText;
