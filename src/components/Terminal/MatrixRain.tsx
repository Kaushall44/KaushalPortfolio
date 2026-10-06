import { useEffect, useRef, useCallback } from "react";
import { useTerminalStore } from "../../store/terminalStore";

function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { setMatrixActive } = useTerminalStore();
  const animFrameRef = useRef<number>(0);

  const dismiss = useCallback(() => {
    setMatrixActive(false);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
  }, [setMatrixActive]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const parent = canvas.parentElement;
    if (!parent) return;
    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;

    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = new Array(columns).fill(1);
    const chars = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF";

    let lastTime = 0;
    const interval = 50;

    const draw = (time: number) => {
      if (time - lastTime < interval) {
        animFrameRef.current = requestAnimationFrame(draw);
        return;
      }
      lastTime = time;

      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#0F0";
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(char, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
      animFrameRef.current = requestAnimationFrame(draw);
    };

    animFrameRef.current = requestAnimationFrame(draw);

    const handleKey = () => dismiss();
    window.addEventListener("keydown", handleKey);

    return () => {
      window.removeEventListener("keydown", handleKey);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [dismiss]);

  return (
    <div className="matrix-rain" onClick={dismiss}>
      <canvas ref={canvasRef} />
      <div className="matrix-dismiss">Press any key or click to exit</div>
    </div>
  );
}

export default MatrixRain;
