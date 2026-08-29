import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Earth } from "../components/globe/Earth";
import { Atmosphere } from "../components/globe/Atmosphere";
import { EarthClouds } from "../components/globe/EarthClouds";
import { Stars } from "../components/globe/Stars";
import { CameraRig } from "../components/globe/CameraRig";
import { IndiaMap } from "../components/maps/IndiaMap";
import { CityMap } from "../components/maps/CityMap";
import { useSceneStore } from "../store/sceneStore";
import { useMouseParallax } from "../hooks/useMouseParallax";

export function SceneExperience() {
  const root = useRef();
  const progress = useSceneStore((s) => s.progress);
  const phase = useSceneStore((s) => s.phase);
  const mouse = useMouseParallax(0.12);
  const earthVisible = phase === "intro" || phase === "earth";
  const three = useThree();
  if (typeof window !== "undefined") window.__three = three;

  useEffect(() => {
    if (!root.current) return;
    root.current.position.set(0, 0, 0);
  }, []);

  useFrame(() => {
    if (!root.current) return;
    mouse.current.current.lerp(mouse.target.current, 0.045);
    root.current.rotation.x = mouse.current.current.y * mouse.strength;
    root.current.rotation.y = mouse.current.current.x * mouse.strength;
  });

  return (
    <group ref={root}>
      <color attach="background" args={["#05070a"]} />
      <ambientLight intensity={0.25} />
      <CameraRig />
      <Stars />
      {/*
        Earth/Atmosphere shrink themselves to nothing as progress nears the
        India handoff (see Earth.jsx/Atmosphere.jsx) - kept as plain opaque
        materials since making Earth transparent looked washed out. This
        visible toggle is just a cheap safety net for once they're already
        an imperceptible speck, not the thing doing the fade itself.
      */}
      <group visible={earthVisible}>
        <Earth progress={progress} />
        <Atmosphere progress={progress} />
        <EarthClouds progress={progress} />
      </group>
      <IndiaMap />
      <CityMap />
    </group>
  );
}
