import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { earthVertex, earthFragment } from "../../shaders/earth/earthShader";
import { createDayTexture, createNightTexture, createTopographyTexture } from "../../shaders/earth/proceduralTextures";
import { useSceneStore } from "../../store/sceneStore";
import { EARTH_RADIUS } from "./earthConfig";

export function Earth({ progress = 0 }) {
  const earth = useRef();
  const material = useRef();

  /*
   * No Earth imagery ships with the starter (see
   * public/assets/earth/README.txt), so these are generated placeholders -
   * swap for real day/night/topography maps whenever they're ready, the
   * shader's uniforms stay the same either way.
   */
  const textures = useMemo(() => ({
    day: createDayTexture(),
    night: createNightTexture(),
    topography: createTopographyTexture(),
  }), []);

  textures.day.colorSpace = THREE.SRGBColorSpace;
  textures.night.colorSpace = THREE.SRGBColorSpace;
  textures.topography.colorSpace = THREE.SRGBColorSpace;

  useFrame((state, delta) => {
    if (!earth.current || !material.current) return;

    const parallax = useSceneStore.getState().parallaxStrength;

    /*
     * Slow cinematic rotation.
     */
    earth.current.rotation.y += delta * 0.035;

    /*
     * Mouse parallax - reduced by TransitionController while the camera
     * is mid-journey so the globe doesn't fight the camera move.
     */
    earth.current.rotation.x = THREE.MathUtils.lerp(
      earth.current.rotation.x,
      state.pointer.y * 0.08 * parallax,
      0.025
    );

    earth.current.rotation.z = THREE.MathUtils.lerp(
      earth.current.rotation.z,
      -state.pointer.x * 0.025 * parallax,
      0.025
    );

    /*
     * Scroll controls the Earth → India transition. The shader only dims
     * Earth's color (never true alpha - keeping it opaque looks right,
     * transparency made it look washed out), so it's shrunk down to
     * nothing here instead: by the time India's phase flip hides the
     * group outright, Earth is already an imperceptible speck, so there's
     * no pop and it can't occlude the map behind it either.
     */
    const shrink = 1 - THREE.MathUtils.smoothstep(progress, 0.55, 0.85);
    earth.current.scale.setScalar(EARTH_RADIUS * shrink);

    material.current.uniforms.uProgress.value = progress;
    material.current.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <group ref={earth}>
      <mesh>
        <sphereGeometry args={[1, 128, 128]} />

        <shaderMaterial
          ref={material}
          vertexShader={earthVertex}
          fragmentShader={earthFragment}
          uniforms={{
            uDayTexture: {
              value: textures.day,
            },

            uNightTexture: {
              value: textures.night,
            },

            uTopographyTexture: {
              value: textures.topography,
            },

            uTime: {
              value: 0,
            },

            uProgress: {
              value: 0,
            },

            uSunDirection: {
              value: new THREE.Vector3(
                -0.7,
                0.25,
                0.8
              ).normalize(),
            },
          }}
        />
      </mesh>
    </group>
  );
}