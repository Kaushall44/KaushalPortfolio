import { useInputSourceStore } from "../store/inputSourceStore";

let rafId: number | null = null;
let pendingX = 0;
let pendingY = 0;
let dirty = false;
let listening = false;

function onMouseMove(event: MouseEvent) {
  pendingX = (event.clientX / window.innerWidth) * 2 - 1;
  pendingY = (event.clientY / window.innerHeight) * 2 - 1;
  dirty = true;
}

function flush() {
  if (dirty) {
    const { inputSource } = useInputSourceStore.getState();
    if (inputSource === "mouse") {
      useInputSourceStore.getState().setHeadPosition({
        x: pendingX,
        y: pendingY,
      });
    }
    dirty = false;
  }
  rafId = requestAnimationFrame(flush);
}

export function startMouseInputProvider() {
  if (listening) return;
  listening = true;
  window.addEventListener("mousemove", onMouseMove, { passive: true });
  rafId = requestAnimationFrame(flush);
}

export function stopMouseInputProvider() {
  listening = false;
  window.removeEventListener("mousemove", onMouseMove);
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}
