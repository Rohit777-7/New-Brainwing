import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useSceneStore } from "../../store/sceneStore";

const targetPosition = new THREE.Vector3();
const targetLookAt = new THREE.Vector3();

/*
 * The only thing in the scene allowed to move the real three.js camera.
 * Every transition (scroll-driven or click-driven) writes its target into
 * sceneStore's `camera` field; this just smooths the physical camera
 * toward that target every frame so gsap's own easing isn't fighting an
 * additional lerp step further down the pipeline.
 */
export function CameraRig() {
  const { camera } = useThree();
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));

  useFrame(() => {
    const state = useSceneStore.getState().camera;
    targetPosition.set(state.position[0], state.position[1], state.position[2]);
    targetLookAt.set(state.lookAt[0], state.lookAt[1], state.lookAt[2]);

    camera.position.lerp(targetPosition, 0.07);
    currentLookAt.current.lerp(targetLookAt, 0.07);
    camera.lookAt(currentLookAt.current);

    if (Math.abs(camera.fov - state.fov) > 0.01) {
      camera.fov = THREE.MathUtils.lerp(camera.fov, state.fov, 0.09);
      camera.updateProjectionMatrix();
    }
  });

  return null;
}
