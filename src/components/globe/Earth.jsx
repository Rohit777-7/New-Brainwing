import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import {
  earthVertex,
  earthFragment,
} from "../../shaders/earth/earthShader";
import {
  createDayTexture,
  createNightTexture,
  createTopographyTexture,
} from "../../shaders/earth/proceduralTextures";
import { useSceneStore } from "../../store/sceneStore";
import { EARTH_PHASE_END, INDIA_PHASE_START } from "../../animations/transitions/cameraPaths";
import { EARTH_RADIUS } from "./earthConfig";

export function Earth({ progress = 0 }) {
  const earth = useRef();
  const material = useRef();

  const textures = useMemo(
    () => ({
      day: createDayTexture(),
      night: createNightTexture(),
      topography: createTopographyTexture(),
    }),
    []
  );

  textures.day.colorSpace = THREE.SRGBColorSpace;
  textures.night.colorSpace = THREE.SRGBColorSpace;
  textures.topography.colorSpace = THREE.SRGBColorSpace;

  useFrame((state, delta) => {
    if (!earth.current || !material.current) return;

    const parallax =
      useSceneStore.getState().parallaxStrength;

    /*
     * Slow Earth rotation.
     */
    earth.current.rotation.y += delta * 0.035;

    /*
     * Mouse parallax.
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
     * IMPORTANT:
     *
     * Do NOT shrink the Earth.
     *
     * During the Earth → India transition the Earth becomes
     * slightly larger, giving the feeling that the camera is
     * travelling toward Earth.
     */
    let scale = EARTH_RADIUS;

    if (progress >= EARTH_PHASE_END) {
      const transitionProgress = THREE.MathUtils.clamp(
        (progress - EARTH_PHASE_END) /
          (INDIA_PHASE_START - EARTH_PHASE_END),
        0,
        1
      );

      /*
       * Earth gets slightly larger during travel.
       */
      scale = THREE.MathUtils.lerp(
        EARTH_RADIUS,
        EARTH_RADIUS * 1.22,
        THREE.MathUtils.smoothstep(
          0,
          0.55,
          transitionProgress
        )
      );

      /*
       * Once the India map starts taking over,
       * hide the Earth completely.
       */
      if (transitionProgress > 0.62) {
        earth.current.visible = false;
      } else {
        earth.current.visible = true;
      }
    } else {
      earth.current.visible = true;
    }

    earth.current.scale.setScalar(scale);

    material.current.uniforms.uProgress.value =
      progress;

    material.current.uniforms.uTime.value =
      state.clock.elapsedTime;
  });

  return (
    <group ref={earth}>
      <mesh>
        <sphereGeometry
          args={[1, 128, 128]}
        />

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