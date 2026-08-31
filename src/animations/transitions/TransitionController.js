import gsap from "gsap";

import {
  useSceneStore,
} from "../../store/sceneStore";

import {
  cities,
} from "../../data/cities";

import {
  EASE,
  DURATION,
  CAMERA_RESTING,
  EARTH_PHASE_END,
  INDIA_PHASE_START,
} from "./cameraPaths";

/*
 * Mutable camera state.
 */
const cam = {
  px: 0,
  py: 0,
  pz:
    CAMERA_RESTING.earth
      .position[2],

  lx: 0,
  ly: 0,
  lz: 0,

  fov:
    CAMERA_RESTING
      .earth
      .fov,
};

function applyCamera() {
  useSceneStore
    .getState()
    .setCamera({
      position: [
        cam.px,
        cam.py,
        cam.pz,
      ],

      lookAt: [
        cam.lx,
        cam.ly,
        cam.lz,
      ],

      fov: cam.fov,
    });
}

function setParallax(
  value,
  duration = 0.6
) {
  const proxy = {
    v:
      useSceneStore
        .getState()
        .parallaxStrength,
  };

  gsap.to(proxy, {
    v: value,

    duration,

    ease:
      EASE.opacity,

    onUpdate: () => {
      useSceneStore
        .getState()
        .setParallaxStrength(
          proxy.v
        );
    },
  });
}

/*
 * EARTH → INDIA
 *
 * 0.00 → 0.18
 * Earth
 *
 * 0.18 → 0.58
 * cinematic transition
 *
 * 0.58 → 1.00
 * India
 */
export function earthToIndia(
  rawProgress
) {
  const store =
    useSceneStore.getState();

  /*
   * Do not allow the opening
   * animation to fight scroll.
   */
  if (
    store.phase === "intro"
  ) {
    return;
  }

  const p =
    gsap.utils.clamp(
      0,
      1,
      rawProgress
    );

  /*
   * Determine phase.
   */
  let phase;

  if (
    p < EARTH_PHASE_END
  ) {
    phase = "earth";
  } else if (
    p < INDIA_PHASE_START
  ) {
    phase =
      "india-transition";
  } else {
    phase = "india";
  }

  /*
   * Camera interpolation.
   */
  const localT =
    gsap.utils.clamp(
      0,
      1,
      (
        p -
        EARTH_PHASE_END
      ) /
        (
          INDIA_PHASE_START -
          EARTH_PHASE_END
        )
    );

  const eased =
    gsap.parseEase(
      EASE.camera
    )(localT);

  const from =
    CAMERA_RESTING.earth;

  const to =
    CAMERA_RESTING.india;

  cam.px =
    gsap.utils.interpolate(
      from.position[0],
      to.position[0],
      eased
    );

  cam.py =
    gsap.utils.interpolate(
      from.position[1],
      to.position[1],
      eased
    );

  cam.pz =
    gsap.utils.interpolate(
      from.position[2],
      to.position[2],
      eased
    );

  cam.lx =
    gsap.utils.interpolate(
      from.lookAt[0],
      to.lookAt[0],
      eased
    );

  cam.ly =
    gsap.utils.interpolate(
      from.lookAt[1],
      to.lookAt[1],
      eased
    );

  cam.lz =
    gsap.utils.interpolate(
      from.lookAt[2],
      to.lookAt[2],
      eased
    );

  cam.fov =
    gsap.utils.interpolate(
      from.fov,
      to.fov,
      eased
    );

  applyCamera();

  store.setPhase(
    phase
  );
}

/*
 * INDIA → CITY
 */
export function goToCity(
  cityId
) {
  if (!cities[cityId]) {
    return;
  }

  const store =
    useSceneStore.getState();

  store.setCity(
    cityId
  );

  store.setHighlightedMarker(
    cityId
  );

  store.setPhase(
    "city"
  );
}

/*
 * CITY → INDIA
 */
export function cityToIndia() {
  const store =
    useSceneStore.getState();

  const highlighted =
    store.highlightedMarker;

  store.setSelectedProject(
    null
  );

  store.setPhase(
    "india"
  );

  window.setTimeout(
    () => {
      if (
        useSceneStore
          .getState()
          .highlightedMarker ===
        highlighted
      ) {
        useSceneStore
          .getState()
          .setHighlightedMarker(
            null
          );
      }
    },
    900
  );
}

/*
 * CITY → PROJECT
 */
export function goToProject(
  project
) {
  if (!project) {
    return;
  }

  const store =
    useSceneStore.getState();

  store.setSelectedProject(
    project
  );

  store.setPhase(
    "project"
  );
}

/*
 * PROJECT → CITY
 */
export function projectToCity() {
  const store =
    useSceneStore.getState();

  store.setSelectedProject(
    null
  );

  store.setPhase(
    "city"
  );
}

/*
 * Opening cinematic.
 */
export function playOpening() {
  const store =
    useSceneStore.getState();

  cam.px = 0;
  cam.py = 0;
  cam.pz = 3.0;

  cam.lx = 0;
  cam.ly = 0;
  cam.lz = 0;

  cam.fov = 30;

  applyCamera();

  store.setPhase(
    "intro"
  );

  const tl =
    gsap.timeline({
      onComplete: () => {
        useSceneStore
          .getState()
          .setPhase(
            "earth"
          );
      },
    });

  tl.to(
    cam,
    {
      pz:
        CAMERA_RESTING
          .earth
          .position[2],

      fov:
        CAMERA_RESTING
          .earth
          .fov,

      duration:
        DURATION.opening,

      ease:
        EASE.camera,

      onUpdate:
        applyCamera,
    },
    0
  );

  return tl;
}

export const transitionController = {
  earthToIndia,
  goToCity,
  cityToIndia,
  goToProject,
  projectToCity,
  playOpening,
  setParallax,
};