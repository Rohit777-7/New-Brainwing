/*
 * Shared easing/duration/scale constants so every transition in
 * TransitionController pulls from one place instead of magic numbers
 * scattered per-file.
 */

export const EASE = {
  camera: "power3.inOut",
  scale: "power3.inOut",
  opacity: "power2.inOut",
  ui: "power2.out",
  markers: "power2.out",
};

export const DURATION = {
  opening: 2.4,
};

export const PARALLAX = {
  idle: 1,
  transition: 0.25,
};

export const CAMERA_RESTING = {
  earth: { position: [0, 0, 4.7], lookAt: [0, 0, 0], fov: 42 },
  india: { position: [0, 0, 3.4], lookAt: [0, 0, 0], fov: 40 },
};

/*
 * Earth -> India scroll bands, shared between TransitionController (which
 * sets phase/camera from these) and Earth/Atmosphere (which fade out over
 * the same range) so they stay in lockstep:
 *   0            - EARTH_PHASE_END    -> phase "earth"
 *   EARTH_PHASE_END - INDIA_PHASE_START -> phase "india-transition"
 *   INDIA_PHASE_START - 1             -> phase "india"
 */
export const EARTH_PHASE_END = 0.18;
export const INDIA_PHASE_START = 0.58;

/*
 * Earth and the India map must never be visible at once - Earth fades
 * away over EARTH_PHASE_END..EARTH_INDIA_MIDPOINT, then the Mapbox map
 * fades in over EARTH_INDIA_MIDPOINT..INDIA_PHASE_START. Two sequential
 * halves, not one overlapping cross-fade.
 */
export const EARTH_INDIA_MIDPOINT = (EARTH_PHASE_END + INDIA_PHASE_START) / 2;
