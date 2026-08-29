import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { indiaLocations } from "../../data/cities";
import { useSceneStore } from "../../store/sceneStore";
import { transitionController } from "../../animations/transitions/TransitionController";
import { indiaLocalPosition, INDIA_MAP_SCALE } from "../../animations/transitions/cameraPaths";

function Marker({ location }) {
  const group = useRef();
  const highlighted = useSceneStore((s) => s.highlightedMarker);
  const phase = useSceneStore((s) => s.phase);

  const isActive = highlighted === location.id;
  const isRendered = phase !== "earth" && phase !== "intro";
  const isDimmed = (phase === "city" || phase === "project") && !isActive;

  useFrame((state) => {
    if (!group.current) return;
    const pulseSpeed = isActive ? 3.4 : 2.5;
    const pulseAmount = isActive ? 0.16 : 0.08;
    const s = 1 + Math.sin(state.clock.elapsedTime * pulseSpeed) * pulseAmount;
    group.current.scale.setScalar(s);

    const targetOpacity = !isRendered ? 0 : isDimmed ? 0.06 : isActive ? 1 : 0.75;
    group.current.children.forEach((child) => {
      if (child.material) {
        child.material.opacity = THREE.MathUtils.lerp(child.material.opacity, targetOpacity, 0.07);
      }
    });
  });

  const [x, y] = indiaLocalPosition(location.coordinates);
  const labelOpacity = !isRendered ? 0 : isDimmed ? 0.15 : 1;

  return (
    <group
      ref={group}
      position={[x, y, 0.12]}
      onClick={(e) => {
        e.stopPropagation();
        transitionController.goToCity(location.id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
      }}
    >
      <mesh>
        <circleGeometry args={[0.032, 24]} />
        <meshBasicMaterial transparent opacity={0.85} />
      </mesh>
      <mesh position={[0, 0, -0.01]}>
        <ringGeometry args={[0.055, 0.061, 32]} />
        <meshBasicMaterial transparent opacity={0.35} />
      </mesh>
      <Html center={false} style={{ pointerEvents: "none" }}>
        <div
          className="whitespace-nowrap text-[9px] uppercase tracking-[0.3em] text-white transition-opacity duration-500"
          style={{ opacity: labelOpacity, transform: "translate(10px, -6px)" }}
        >
          {location.name}
        </div>
      </Html>
    </group>
  );
}

export function IndiaMap() {
  const group = useRef();
  const line = useRef();
  const phase = useSceneStore((s) => s.phase);

  const points = useMemo(() => [
    [-0.05, 0.98], [0.35, 0.68], [0.12, 0.32], [0.22, -0.05],
    [0.02, -0.58], [-0.24, -0.95], [-0.5, -0.58], [-0.62, -0.1],
    [-0.48, 0.28], [-0.66, 0.72], [-0.28, 1.05]
  ], []);

  useFrame(() => {
    if (!group.current) return;
    const visible = phase === "india";
    const rendered = phase !== "earth" && phase !== "intro";

    group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, -0.015, 0.04);

    const scaleTarget = visible ? INDIA_MAP_SCALE.active : INDIA_MAP_SCALE.idle;
    group.current.scale.lerp(new THREE.Vector3(scaleTarget, scaleTarget, 1), 0.05);

    if (line.current) {
      const targetOpacity = rendered ? (visible ? 0.28 : 0.06) : 0;
      line.current.material.opacity = THREE.MathUtils.lerp(line.current.material.opacity, targetOpacity, 0.06);
    }
  });

  return (
    <group ref={group}>
      <line ref={line}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={points.length} array={new Float32Array(points.flatMap(([x, y]) => [x, y, 0]))} itemSize={3} />
        </bufferGeometry>
        <lineBasicMaterial transparent opacity={0.28} />
      </line>
      {indiaLocations.map((location) => <Marker key={location.id} location={location} />)}
    </group>
  );
}
