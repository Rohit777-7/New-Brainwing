import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { getProjectsByCity } from "../../data/projects";
import { cities } from "../../data/cities";
import { useSceneStore } from "../../store/sceneStore";
import { transitionController } from "../../animations/transitions/TransitionController";
import { indiaLocalPosition, CITY_MAP_SCALE } from "../../animations/transitions/cameraPaths";

function Road({ rotation = 0, position = [0, 0, 0], scale = [3, 1, 1] }) {
  return (
    <mesh rotation={[0, 0, rotation]} position={position} scale={scale}>
      <planeGeometry args={[1, 0.008]} />
      <meshBasicMaterial transparent opacity={0.12} />
    </mesh>
  );
}

function ProjectMarker({ project, active }) {
  const ref = useRef();
  const [hovered, setHovered] = useState(false);
  const selectedProject = useSceneStore((s) => s.selectedProject);
  const isSelected = selectedProject?.id === project.id;
  const isDimmed = Boolean(selectedProject) && !isSelected;
  const showPopup = active && hovered && !selectedProject;

  useFrame((state) => {
    if (!ref.current) return;
    const pulseSpeed = isSelected ? 3.6 : 3;
    const pulseAmount = isSelected || hovered ? 0.18 : 0.12;
    ref.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * pulseSpeed + project.id.length) * pulseAmount);

    const targetOpacity = !active ? 0 : isDimmed ? 0.1 : isSelected || hovered ? 1 : 0.85;
    ref.current.children.forEach((child) => {
      if (child.material) {
        child.material.opacity = THREE.MathUtils.lerp(child.material.opacity, targetOpacity, 0.08);
      }
    });
  });

  return (
    <group
      ref={ref}
      position={[project.coordinates[0], project.coordinates[1], 0.16]}
      onClick={(e) => {
        if (!active) return;
        e.stopPropagation();
        transitionController.goToProject(project);
      }}
      onPointerOver={(e) => {
        if (!active) return;
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "auto";
      }}
    >
      <mesh>
        <circleGeometry args={[0.045, 24]} />
        <meshBasicMaterial transparent opacity={0.85} />
      </mesh>
      <mesh>
        <ringGeometry args={[0.075, 0.082, 32]} />
        <meshBasicMaterial transparent opacity={0.38} />
      </mesh>
      {showPopup && (
        <Html center={false} style={{ pointerEvents: "none" }}>
          <div
            className="w-40 rounded-lg border border-white/10 bg-[#0a0d11]/90 p-3 shadow-xl backdrop-blur-md"
            style={{ transform: "translate(-50%, calc(-100% - 14px))" }}
          >
            <div className="mb-1 text-[8px] uppercase tracking-[0.25em] text-white/40">{project.category}</div>
            <div className="text-xs font-light tracking-[-0.02em] text-white">{project.name}</div>
          </div>
        </Html>
      )}
    </group>
  );
}

export function CityMap() {
  const group = useRef();
  const background = useRef();
  const phase = useSceneStore((s) => s.phase);
  const city = useSceneStore((s) => s.city);
  const cityProjects = getProjectsByCity(city);
  const active = phase === "city" || phase === "project";

  useFrame((state) => {
    if (!group.current) return;

    const [mx, my] = indiaLocalPosition(cities[city].coordinates);
    group.current.position.x = THREE.MathUtils.lerp(group.current.position.x, mx, 0.08);
    group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, my, 0.08);

    const scaleTarget = active ? CITY_MAP_SCALE.active : CITY_MAP_SCALE.idle;
    group.current.scale.lerp(new THREE.Vector3(scaleTarget, scaleTarget, 1), 0.055);

    const parallax = useSceneStore.getState().parallaxStrength;
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -state.pointer.y * 0.04 * parallax, 0.03);
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, state.pointer.x * 0.04 * parallax, 0.03);

    if (background.current) {
      const targetOpacity = active ? 1 : 0;
      background.current.traverse((child) => {
        if (child.material && child.material.transparent) {
          child.material.opacity = THREE.MathUtils.lerp(child.material.opacity, targetOpacity, 0.06);
        }
      });
    }
  });

  return (
    <group ref={group}>
      <group ref={background}>
        <mesh position={[0, 0, -0.05]}>
          <planeGeometry args={[1.8, 1.3]} />
          <meshBasicMaterial transparent opacity={0.035} />
        </mesh>
        {Array.from({ length: 8 }).map((_, i) => <Road key={`h-${i}`} position={[0, -0.7 + i * 0.2, 0]} scale={[2.8, 1, 1]} />)}
        {Array.from({ length: 8 }).map((_, i) => <Road key={`v-${i}`} rotation={Math.PI / 2} position={[-1 + i * 0.28, 0, 0]} scale={[2.8, 1, 1]} />)}
      </group>
      {cityProjects.map((project) => <ProjectMarker key={project.id} project={project} active={active} />)}
    </group>
  );
}
