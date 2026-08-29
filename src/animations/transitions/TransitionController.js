import gsap from "gsap";
import { useSceneStore } from "../../store/sceneStore";
import { cities } from "../../data/cities";
import {
  EASE,
  DURATION,
  PARALLAX,
  indiaLocalPosition,
  CITY_MAP_SCALE,
  CAMERA_RESTING,
} from "./cameraPaths";

/*
 * Single mutable camera state, tweened by gsap. gsap can't tween zustand
 * state directly (mutating it wouldn't notify subscribers), so every tween
 * writes into this plain object and pushes a snapshot into the store on
 * each tick via applyCamera().
 */
const cam = {
  px: 0, py: 0, pz: CAMERA_RESTING.earth.position[2],
  lx: 0, ly: 0, lz: 0,
  fov: CAMERA_RESTING.earth.fov,
};

let activeTimeline = null;
const cameraHistory = [];
let activeCityOffset = [0, 0];

function applyCamera() {
  useSceneStore.getState().setCamera({
    position: [cam.px, cam.py, cam.pz],
    lookAt: [cam.lx, cam.ly, cam.lz],
    fov: cam.fov,
  });
}

function snapshotCamera() {
  return { ...cam };
}

function setParallax(value, duration = 0.6) {
  const proxy = { v: useSceneStore.getState().parallaxStrength };
  gsap.to(proxy, {
    v: value,
    duration,
    ease: EASE.opacity,
    onUpdate: () => useSceneStore.getState().setParallaxStrength(proxy.v),
  });
}

/*
 * Transition 02 - Earth -> India. Driven by scroll (scrub), so this is a
 * direct progress -> state mapping rather than a discrete gsap timeline.
 * Eased so the camera doesn't move linearly with the scrollbar even
 * though the underlying scroll progress is linear.
 */
export function earthToIndia(rawProgress) {
  if (activeTimeline) return; // a click-driven camera move is already in flight
  const store = useSceneStore.getState();
  // Ignored during "intro" so a scroll fired while the opening cinematic is
  // still tweening the camera can't race it.
  if (store.phase === "intro") return;

  if (store.phase === "city" || store.phase === "project") {
    // Fully scrolled-in and looking at a city/project: leave the camera
    // under click-driven control until the user actually scrolls away.
    if (rawProgress > 0.98) return;
    // Scrolling back up is the "zoom back out to space" escape hatch -
    // drop out of the city/project view instead of leaving it stuck.
    store.setSelectedProject(null);
    store.setHighlightedMarker(null);
    cameraHistory.length = 0;
  }

  const p = gsap.utils.clamp(0, 1, rawProgress);
  const eased = gsap.parseEase(EASE.opacity)(p);
  const from = CAMERA_RESTING.earth;
  const to = CAMERA_RESTING.india;

  cam.px = gsap.utils.interpolate(from.position[0], to.position[0], eased);
  cam.py = gsap.utils.interpolate(from.position[1], to.position[1], eased);
  cam.pz = gsap.utils.interpolate(from.position[2], to.position[2], eased);
  cam.lx = gsap.utils.interpolate(from.lookAt[0], to.lookAt[0], eased);
  cam.ly = gsap.utils.interpolate(from.lookAt[1], to.lookAt[1], eased);
  cam.lz = gsap.utils.interpolate(from.lookAt[2], to.lookAt[2], eased);
  cam.fov = gsap.utils.interpolate(from.fov, to.fov, eased);
  applyCamera();

  store.setPhase(p > 0.92 ? "india" : "earth");
}

/*
 * Transition 03 - India -> City. Reusable for every city: only the
 * location (and therefore its derived camera target) changes.
 */
export function goToCity(cityId) {
  const location = cities[cityId];
  if (!location) return;
  activeTimeline?.kill();

  const store = useSceneStore.getState();
  const [mx, my] = indiaLocalPosition(location.coordinates);
  activeCityOffset = [mx, my];

  cameraHistory[0] = snapshotCamera();
  store.setCity(cityId);
  store.setHighlightedMarker(cityId);
  setParallax(PARALLAX.transition);

  const tl = gsap.timeline({
    defaults: { ease: EASE.camera, duration: DURATION.city, onUpdate: applyCamera },
    onComplete: () => {
      setParallax(PARALLAX.idle);
      activeTimeline = null;
    },
  });

  tl.to(cam, { px: mx * 0.5, py: my * 0.5, pz: 2.3, lx: mx, ly: my, lz: 0, fov: 37 }, 0);
  tl.call(() => store.setPhase("city"), null, DURATION.city * 0.4);

  activeTimeline = tl;
  return tl;
}

/*
 * Transition 06 - City -> India. Reverses the camera along the same path
 * it arrived on, and keeps the origin marker highlighted briefly.
 */
export function cityToIndia() {
  activeTimeline?.kill();
  const store = useSceneStore.getState();
  const prev = cameraHistory[0] ?? { ...CAMERA_RESTING.india, px: 0, py: 0, pz: CAMERA_RESTING.india.position[2], lx: 0, ly: 0, lz: 0, fov: CAMERA_RESTING.india.fov };
  const highlighted = store.highlightedMarker;
  setParallax(PARALLAX.transition);

  const tl = gsap.timeline({
    defaults: { ease: EASE.camera, duration: DURATION.reverse, onUpdate: applyCamera },
    onComplete: () => {
      setParallax(PARALLAX.idle);
      window.setTimeout(() => {
        if (useSceneStore.getState().highlightedMarker === highlighted) {
          useSceneStore.getState().setHighlightedMarker(null);
        }
      }, 900);
      activeTimeline = null;
    },
  });

  tl.to(cam, { px: prev.px, py: prev.py, pz: prev.pz, lx: prev.lx, ly: prev.ly, lz: prev.lz, fov: prev.fov }, 0);
  tl.call(() => store.setPhase("india"), null, DURATION.reverse * 0.25);

  activeTimeline = tl;
  return tl;
}

/*
 * Transition 04 - City -> Project. Reusable for every project marker.
 */
export function goToProject(project) {
  if (!project) return;
  activeTimeline?.kill();

  const store = useSceneStore.getState();
  const [ox, oy] = activeCityOffset;
  const worldX = ox + project.coordinates[0] * CITY_MAP_SCALE.active;
  const worldY = oy + project.coordinates[1] * CITY_MAP_SCALE.active;

  cameraHistory[1] = snapshotCamera();
  store.setSelectedProject(project);
  setParallax(PARALLAX.transition);

  const tl = gsap.timeline({
    defaults: { ease: EASE.camera, duration: DURATION.project, onUpdate: applyCamera },
    onComplete: () => {
      setParallax(PARALLAX.idle);
      activeTimeline = null;
    },
  });

  tl.to(cam, { px: worldX * 0.6, py: worldY * 0.6, pz: 1.5, lx: worldX, ly: worldY, lz: 0, fov: 32 }, 0);
  tl.call(() => store.setPhase("project"), null, DURATION.project * 0.5);

  activeTimeline = tl;
  return tl;
}

/*
 * Transition 05 - Project -> City. Preserves the camera position the
 * city was left at, rather than resetting to a generic city view.
 */
export function projectToCity() {
  activeTimeline?.kill();
  const store = useSceneStore.getState();
  const prev = cameraHistory[1] ?? snapshotCamera();
  setParallax(PARALLAX.transition);

  const tl = gsap.timeline({
    defaults: { ease: EASE.camera, duration: DURATION.reverse, onUpdate: applyCamera },
    onComplete: () => {
      setParallax(PARALLAX.idle);
      activeTimeline = null;
    },
  });

  tl.call(() => store.setSelectedProject(null), null, 0);
  tl.to(cam, { px: prev.px, py: prev.py, pz: prev.pz, lx: prev.lx, ly: prev.ly, lz: prev.lz, fov: prev.fov }, 0);
  tl.call(() => store.setPhase("city"), null, DURATION.reverse * 0.2);

  activeTimeline = tl;
  return tl;
}

/*
 * Transition 01 - opening reveal. Starts tight and dark, pulls back to
 * the resting Earth framing.
 */
export function playOpening() {
  const store = useSceneStore.getState();
  cam.px = 0; cam.py = 0; cam.pz = 3.0;
  cam.lx = 0; cam.ly = 0; cam.lz = 0;
  cam.fov = 30;
  applyCamera();
  store.setPhase("intro");

  const tl = gsap.timeline({
    onComplete: () => {
      useSceneStore.getState().setPhase("earth");
    },
  });

  tl.to(cam, {
    pz: CAMERA_RESTING.earth.position[2],
    fov: CAMERA_RESTING.earth.fov,
    duration: DURATION.opening,
    ease: EASE.camera,
    onUpdate: applyCamera,
  }, 0);

  return tl;
}

export const transitionController = {
  earthToIndia,
  goToCity,
  cityToIndia,
  goToProject,
  projectToCity,
  playOpening,
};
