import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect } from "react";
import useCanvasStore from "../../store/showCarStore";
import { Ball } from "./Ball";
function CarCanvas({ setShowCarCanvas }) {
  return (
    <div className="car-canvas">
      <Canvas
        camera={{
          position: [-0.34, 0.24, 0.51],
          fov: 50,
        }}
      >
        <OrbitControls enableZoom={false} />
        <directionalLight position={[0, 10, 10]} intensity={1} />
        <ambientLight intensity={0.2} />
        <Suspense>
          <Ball />
        </Suspense>
      </Canvas>
      <div className="ball-text">
        <p className="desc">
          Use <code>Arrow Keys</code> or <code>Hands</code> to control BB-8.
        </p>
        <p className="desc">
          Press <code onClick={() => setShowCarCanvas(false)}>Esc</code> to
          close the window.
        </p>
      </div>
    </div>
  );
}

function BallComponent() {
  const { showCarCanvas, setShowCarCanvas } = useCanvasStore();

  useEffect(() => {
    if (showCarCanvas) {
      document.body.style.overflowY = "hidden";
    } else {
      document.body.style.overflowY = "";
    }

    const handleKeyDown = (event) => {
      if ((event.ctrlKey && event.code === "KeyK" && !showCarCanvas) || (event.metaKey && event.code === "KeyK" && !showCarCanvas)) {
        setShowCarCanvas(true);
      } else if (
        (event.code === "Escape" && showCarCanvas) ||
        (event.ctrlKey && event.code === "KeyK" && showCarCanvas) ||
        (event.metaKey && event.code === "KeyK" && showCarCanvas)
      ) {
        setShowCarCanvas(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showCarCanvas]);

  return (
    <>{showCarCanvas && <CarCanvas setShowCarCanvas={setShowCarCanvas} />}</>
  );
}

export default BallComponent;
