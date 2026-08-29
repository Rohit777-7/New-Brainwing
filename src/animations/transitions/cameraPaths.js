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
  city: 1.6,
  project: 1.4,
  reverse: 1.3,
};

export const PARALLAX = {
  idle: 1,
  transition: 0.25,
};

/*
 * India map is a flat schematic layout centered at world origin.
 * This maps a [lon, lat] pair onto that same local space so markers,
 * the camera, and the city map handoff all agree on where a place is.
 * The reference point (76, 15) sits roughly in the middle of Brainwing's
 * current cities so the marker cluster lands centered in frame rather
 * than pushed toward one edge.
 */
export function indiaLocalPosition([lon, lat]) {
  return [(lon - 76) * 0.075, (lat - 15) * 0.075];
}

/*
 * Resting scale for each map layer's own group. Kept modest (rather than
 * dramatic) because the camera now carries most of the "getting closer"
 * feeling - these just keep each layer readable at its resting camera
 * distance.
 */
export const INDIA_MAP_SCALE = { idle: 1.6, active: 1.9 };
export const CITY_MAP_SCALE = { idle: 2.0, active: 2.4 };

export const CAMERA_RESTING = {
  earth: { position: [0, 0, 4.7], lookAt: [0, 0, 0], fov: 42 },
  india: { position: [0, 0, 3.4], lookAt: [0, 0, 0], fov: 40 },
};
