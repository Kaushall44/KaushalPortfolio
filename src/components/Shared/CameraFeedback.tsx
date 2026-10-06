import { AnimatePresence, motion } from "motion/react";
import React, { useEffect, useRef } from "react";
import {
  getVideoElement,
  getFaceLandmarks,
  getHandLandmarks,
} from "../../providers/CameraInputProvider";
import useIsMobile from "../../hooks/useIsMobile";
import { useHandsfreeStore } from "../../store/handsfreeStore";

const PREVIEW_W = 200;
const PREVIEW_H = 150;
// Mobile: portrait preview to match front camera's natural orientation
const MOBILE_PREVIEW_W = 90;
const MOBILE_PREVIEW_H = 120;

// MediaPipe hand connections (pairs of landmark indices)
const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],       // thumb
  [0, 5], [5, 6], [6, 7], [7, 8],       // index
  [5, 9], [9, 10], [10, 11], [11, 12],  // middle
  [9, 13], [13, 14], [14, 15], [15, 16],// ring
  [13, 17], [17, 18], [18, 19], [19, 20],// pinky
  [0, 17],                                // palm base
];

// Key face mesh connections for a clean overlay (contour + brows + nose + lips)
const FACE_OVAL = [
  10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288,
  397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136,
  172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109, 10,
];
const LEFT_EYE = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398, 362];
const RIGHT_EYE = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246, 33];
const LIPS_OUTER = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 409, 270, 269, 267, 0, 37, 39, 40, 185, 61];

function drawFaceMesh(
  ctx: CanvasRenderingContext2D,
  landmarks: any[],
  w: number,
  h: number,
  lmX?: (rawX: number) => number,
  lmY?: (rawY: number) => number
) {
  ctx.strokeStyle = "rgba(240, 115, 45, 0.5)";
  ctx.lineWidth = 1;

  // Default: simple mirror mapping. With cover-fit: use crop-aware transform.
  const toX = lmX ? (raw: number) => w - lmX(raw) : (raw: number) => (1 - raw) * w;
  const toY = lmY ? lmY : (raw: number) => raw * h;

  const drawPath = (indices: number[]) => {
    ctx.beginPath();
    for (let i = 0; i < indices.length; i++) {
      const lm = landmarks[indices[i]];
      const x = toX(lm.x);
      const y = toY(lm.y);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  };

  drawPath(FACE_OVAL);
  drawPath(LEFT_EYE);
  drawPath(RIGHT_EYE);
  drawPath(LIPS_OUTER);

  // Draw key points as small dots
  ctx.fillStyle = "rgba(240, 115, 45, 0.7)";
  const keyPoints = [4, 1, 33, 263, 61, 291, 10, 152];
  for (const idx of keyPoints) {
    const lm = landmarks[idx];
    const x = toX(lm.x);
    const y = toY(lm.y);
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawHandSkeleton(
  ctx: CanvasRenderingContext2D,
  handsLandmarks: any[][],
  w: number,
  h: number,
  lmX?: (rawX: number) => number,
  lmY?: (rawY: number) => number
) {
  const colors = ["rgba(45, 200, 115, 0.8)", "rgba(45, 115, 240, 0.8)"];

  const toX = lmX ? (raw: number) => w - lmX(raw) : (raw: number) => (1 - raw) * w;
  const toY = lmY ? lmY : (raw: number) => raw * h;

  for (let hi = 0; hi < handsLandmarks.length; hi++) {
    const landmarks = handsLandmarks[hi];
    const color = colors[hi % 2];

    // Draw connections
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    for (const [a, b] of HAND_CONNECTIONS) {
      const lmA = landmarks[a];
      const lmB = landmarks[b];
      ctx.beginPath();
      ctx.moveTo(toX(lmA.x), toY(lmA.y));
      ctx.lineTo(toX(lmB.x), toY(lmB.y));
      ctx.stroke();
    }

    // Draw joints
    ctx.fillStyle = color;
    for (const lm of landmarks) {
      ctx.beginPath();
      ctx.arc(toX(lm.x), toY(lm.y), 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

const CameraFeedback: React.FC = () => {
  const isMobile = useIsMobile();
  const isEnabled = useHandsfreeStore((s) => s.isEnabled);
  const modelLoaded = useHandsfreeStore((s) => s.modelLoadProgress >= 100);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const pw = isMobile ? MOBILE_PREVIEW_W : PREVIEW_W;
  const ph = isMobile ? MOBILE_PREVIEW_H : PREVIEW_H;

  useEffect(() => {
    if (!isEnabled || !modelLoaded) return;

    let rafId: number;
    const draw = () => {
      const video = getVideoElement();
      const ctx = canvasRef.current?.getContext("2d");
      if (video && ctx && canvasRef.current) {
        const vw = video.videoWidth || 640;
        const vh = video.videoHeight || 480;
        const videoAspect = vw / vh;
        const previewAspect = pw / ph;

        // Cover-fit: crop source to match preview aspect ratio
        let sx: number, sy: number, sw: number, sh: number;
        if (videoAspect > previewAspect) {
          // Video wider than preview — crop sides
          sh = vh;
          sw = vh * previewAspect;
          sx = (vw - sw) / 2;
          sy = 0;
        } else {
          // Video taller than preview (portrait camera) — crop top/bottom
          sw = vw;
          sh = vw / previewAspect;
          sx = 0;
          sy = (vh - sh) / 2;
        }

        // Draw mirrored video with cover-fit
        ctx.save();
        ctx.scale(-1, 1);
        ctx.drawImage(video, sx, sy, sw, sh, -pw, 0, pw, ph);
        ctx.restore();

        // Landmark coordinate transform for cropped region
        const lmX = (rawX: number) => ((rawX * vw - sx) / sw) * pw;
        const lmY = (rawY: number) => ((rawY * vh - sy) / sh) * ph;

        // Draw face mesh overlay
        const faceLandmarks = getFaceLandmarks();
        if (faceLandmarks && faceLandmarks.length > 0) {
          drawFaceMesh(ctx, faceLandmarks, pw, ph, lmX, lmY);
        }

        // Draw hand skeleton overlay
        const handLandmarks = getHandLandmarks();
        if (handLandmarks && handLandmarks.length > 0) {
          drawHandSkeleton(ctx, handLandmarks, pw, ph, lmX, lmY);
        }
      }
      rafId = requestAnimationFrame(draw);
    };

    const startTimer = setTimeout(() => {
      rafId = requestAnimationFrame(draw);
    }, 500);

    return () => {
      clearTimeout(startTimer);
      cancelAnimationFrame(rafId);
    };
  }, [isEnabled, modelLoaded, pw, ph]);

  const positionStyle = { bottom: 16, left: 16 };

  return (
    <AnimatePresence>
      {isEnabled && modelLoaded && (
        <motion.div
          className="camera-feedback"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          style={{
            position: "fixed",
            ...positionStyle,
            width: pw,
            height: ph,
            borderRadius: isMobile ? 10 : 12,
            overflow: "hidden",
            zIndex: 9997,
            boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
            border: "2px solid rgba(240, 115, 45, 0.6)",
          }}
        >
          <canvas
            ref={canvasRef}
            width={pw}
            height={ph}
            style={{ width: "100%", height: "100%", display: "block" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CameraFeedback;
