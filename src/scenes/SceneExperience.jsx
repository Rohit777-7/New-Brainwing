import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";

import { Earth } from "../components/globe/Earth";
import { Atmosphere } from "../components/globe/Atmosphere";
import { EarthClouds } from "../components/globe/EarthClouds";
import { Stars } from "../components/globe/Stars";
import { CameraRig } from "../components/globe/CameraRig";

import { useSceneStore } from "../store/sceneStore";
import { useMouseParallax } from "../hooks/useMouseParallax";

export function SceneExperience() {
  const root = useRef();

  const progress = useSceneStore(
    (s) => s.progress
  );

  const phase = useSceneStore(
    (s) => s.phase
  );

  const mouse = useMouseParallax(0.12);

  /*
   * Three.js space scene is visible only until
   * the India scene takes over.
   */
  const spaceVisible =
    phase === "intro" ||
    phase === "earth" ||
    phase === "india-transition";

  useEffect(() => {
    if (!root.current) return;

    root.current.position.set(
      0,
      0,
      0
    );
  }, []);

  useFrame(() => {
    if (!root.current) return;

    mouse.current.current.lerp(
      mouse.target.current,
      0.045
    );

    /*
     * Global mouse parallax.
     */
    root.current.rotation.x =
      mouse.current.current.y *
      mouse.strength;

    root.current.rotation.y =
      mouse.current.current.x *
      mouse.strength;
  });

  return (
    <group ref={root}>
      <color
        attach="background"
        args={["#05070a"]}
      />

      <ambientLight
        intensity={0.25}
      />

      <CameraRig />

      <group visible={spaceVisible}>
        <Stars />

        <Earth
          progress={progress}
        />

        <Atmosphere
          progress={progress}
        />

        <EarthClouds
          progress={progress}
        />
      </group>
    </group>
  );
}