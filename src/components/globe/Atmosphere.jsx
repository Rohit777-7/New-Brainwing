import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import {
  atmosphereVertex,
  atmosphereFragment,
} from "../../shaders/earth/atmosphereShader";
import { EARTH_RADIUS } from "./earthConfig";

export function Atmosphere({ progress = 0 }) {
  const material = useRef();
  const mesh = useRef();

  useFrame((state) => {
    if (!material.current) return;

    material.current.uniforms.uTime.value =
      state.clock.elapsedTime;

    if (mesh.current) {
      const shrink = 1 - THREE.MathUtils.smoothstep(progress, 0.55, 0.85);
      mesh.current.scale.setScalar(1.045 * shrink);
    }
  });

  return (
    <mesh ref={mesh} scale={1.045}>
      <sphereGeometry
        args={[EARTH_RADIUS, 96, 96]}
      />

      <shaderMaterial
        ref={material}
        transparent
        depthWrite={false}
        side={1}
        blending={2}
        vertexShader={atmosphereVertex}
        fragmentShader={atmosphereFragment}
        uniforms={{
          uTime: {
            value: 0,
          },
        }}
      />
    </mesh>
  );
}