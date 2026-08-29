import { useMemo } from "react";
import * as THREE from "three";

export function Stars() {
  const positions = useMemo(() => {
    const array = new Float32Array(1800 * 3);
    for (let i = 0; i < array.length; i += 3) {
      const r = 7 + Math.random() * 9;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      array[i] = r * Math.sin(phi) * Math.cos(theta);
      array[i + 1] = r * Math.cos(phi);
      array[i + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    return array;
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.018} transparent opacity={0.62} depthWrite={false} />
    </points>
  );
}