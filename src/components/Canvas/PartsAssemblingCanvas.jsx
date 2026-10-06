import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useEffect, useRef } from "react";
import { useThemeStore } from "../../store/themeStore";
import { PartsAssembling } from "./PartsAssembling";

export default function PartsAssemblingCanvas() {
  const group = useRef();
  const animationActions = useRef(null);
  const progressRef = useRef(0);
  const { darkMode } = useThemeStore();

  useEffect(() => {
    const handleScrollAnimationProgress = (event) => {
      const progress = event.detail;
      progressRef.current = progress;
    };

    document.addEventListener(
      "scrollAnimationProgress",
      handleScrollAnimationProgress
    );

    return () => {
      document.removeEventListener(
        "scrollAnimationProgress",
        handleScrollAnimationProgress
      );
    };
  }, [darkMode]);

  // Smoothly scrub the animation frame by frame

  const AnimationSmoother = () => {
    useFrame(() => {
      if (animationActions.current) {
        const action = animationActions.current;
        const duration = action.getClip().duration;
        const newTime = duration * progressRef.current;

        // Debounce the animation time changes for smoother scrubbing
        if (Math.abs(action.time - newTime) > 0.01) {
          action.time = newTime;
        }
      }

      // Apply rotation based on scroll progress
      if (group.current) {
        const rotationSpeed = 0.5; // Adjust this value to control rotation speed
        group.current.rotation.y =
          progressRef.current * Math.PI * 2 * rotationSpeed; // Rotate around the Y-axis
      }
    });
  };

  return (
    <div className="parts-assembling"  data-drag-me={true}>
      <Canvas camera={{ position: [0, 50, 210], fov: 75 }}>
        <OrbitControls enableZoom={false} />
        <directionalLight
          position={[0, 10, 10]}
          intensity={darkMode ? 0.5 : 1.5}
        />
        <ambientLight intensity={darkMode ? 0.75 : 1} />
        <Suspense>
          <PartsAssembling
            setAnimationActions={(actions) =>
              (animationActions.current = actions)
            }
             groupRef={group}
          />
          <AnimationSmoother />
        </Suspense>
      </Canvas>
    </div>
  );
}
