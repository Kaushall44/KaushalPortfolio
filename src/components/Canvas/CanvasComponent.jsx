import { OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { useInputSourceStore } from "../../store/inputSourceStore";
import { useThemeStore } from "../../store/themeStore";

function Model({ onReady, ...props }) {
  const { nodes, materials } = useGLTF("/assets/3d/cute_robot.glb");
  const group = useRef();

  useEffect(() => {
    // Model is mounted = GLB is loaded and scene is ready
    onReady?.();
  }, []);

  useFrame(() => {
    const { headPosition } = useInputSourceStore.getState();
    group.current.rotation.y +=
      (headPosition.x * 0.4 - group.current.rotation.y) * 0.2;
    group.current.rotation.x +=
      (headPosition.y * 0.4 - group.current.rotation.x) * 0.2;
  });

  return (
    <group ref={group} {...props} dispose={null}>
      <group position={[0, 0, 0]}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Object_4.geometry}
          material={materials.Plastik}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Object_5.geometry}
          material={materials.Scratch_Metal}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Object_6.geometry}
          material={materials.Darker_Metal}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Object_7.geometry}
          material={materials.Layar}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Object_8.geometry}
          material={materials["Material.001"]}
        />
      </group>
    </group>
  );
}

useGLTF.preload("/assets/3d/cute_robot.glb");

export default function CanvasComponent({ onReady }) {
  const { darkMode } = useThemeStore();
  return (
    <Canvas
      camera={{ position: [0.4, 1.17, 11.35], fov: 25 }}
      className={`robot-canvas`}
      data-drag-me={true}
      gl={{ alpha: true, antialias: true }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={darkMode ? 0.25 : 1} />
      <directionalLight position={[10, 10, 10]} intensity={darkMode ? 0 : 2} />
      <Model onReady={onReady} />
      <OrbitControls enableZoom={false} />
    </Canvas>
  );
}
