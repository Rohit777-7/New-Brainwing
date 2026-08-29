import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useSceneStore } from "../store/sceneStore";

/*
 * `baseStrength` is the layer's own parallax weight (e.g. a background
 * layer moves less than a foreground one). The effective strength is
 * always multiplied by sceneStore's global parallaxStrength, which
 * TransitionController pulls down to ~0.25 during a camera move so the
 * scene doesn't feel unstable while it's already travelling, then
 * restores to 1 once the camera settles.
 */
export function useMouseParallax(baseStrength = 0.12) {
  const target = useRef(new THREE.Vector2());
  const current = useRef(new THREE.Vector2());

  useEffect(() => {
    const onMove = (event) => {
      target.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      target.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return {
    target,
    current,
    get strength() {
      return baseStrength * useSceneStore.getState().parallaxStrength;
    },
  };
}
