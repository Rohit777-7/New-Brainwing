import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { createCloudsTexture } from "../../shaders/earth/proceduralTextures";
import { EARTH_RADIUS } from "./earthConfig";

export function EarthClouds({ progress = 0 }) {
  const clouds = useRef();

  const texture = useMemo(() => createCloudsTexture(), []);

  texture.colorSpace =
    THREE.SRGBColorSpace;

  useFrame((state, delta) => {
    if (!clouds.current) return;

    clouds.current.rotation.y +=
      delta * 0.012;

    clouds.current.rotation.x =
      THREE.MathUtils.lerp(
        clouds.current.rotation.x,
        state.pointer.y * 0.025,
        0.02
      );

    clouds.current.material.opacity =
      THREE.MathUtils.lerp(
        clouds.current.material.opacity,
        0.22 *
          (1 -
            THREE.MathUtils.clamp(
              progress * 1.5,
              0,
              1
            )),
        0.05
      );
  });

  return (
    <mesh
      ref={clouds}
      scale={EARTH_RADIUS * 1.015}
    >
      <sphereGeometry
        args={[1, 96, 96]}
      />

      <meshBasicMaterial
        map={texture}
        transparent
        opacity={0.22}
        depthWrite={false}
        blending={
          THREE.AdditiveBlending
        }
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}