import gsap from "gsap";
import { useSceneStore } from "../../store/sceneStore";
import { transitionController } from "../transitions/TransitionController";

/*
 * Snap controller: one wheel/swipe input plays the full Earth<->India
 * camera transition (no scrollbar, no scrub) - `progress` is tweened from
 * 0 to 1 (or back) and fed through the same phase-band logic
 * TransitionController already uses for scroll-scrubbed progress.
 */
const SNAP_DURATION = 2.2;
const WHEEL_THRESHOLD = 4;
const SWIPE_THRESHOLD = 30;

export function initScrollController(root) {
  if (!root) {
    return {
      destroy: () => {},
      goBack: () => {},
    };
  }

  const store = useSceneStore.getState();
  const copies = root.querySelectorAll(".scene-copy-scroll");

  gsap.set(copies, { autoAlpha: 0, y: 30 });
  gsap.set(copies[0], { autoAlpha: 1, y: 0 });

  const proxy = { p: 0 };
  let tween = null;

  function renderCopies(p) {
    copies.forEach((copy, index) => {
      const start = index / copies.length;
      const end = (index + 1) / copies.length;
      const local = gsap.utils.clamp(0, 1, (p - start) / (end - start));
      gsap.set(copy, { autoAlpha: local > 0.15 && local < 0.9 ? 1 : 0, y: (1 - local) * 30 });
    });
  }

  function applyProgress(p) {
    store.setProgress(p);
    store.setScene(p < 0.5 ? "earth" : "india");
    transitionController.earthToIndia(p);
    renderCopies(p);
  }

  function animateTo(target) {
    tween?.kill();
    tween = gsap.to(proxy, {
      p: target,
      duration: SNAP_DURATION,
      ease: "power2.inOut",
      onUpdate: () => applyProgress(proxy.p),
      onComplete: () => {
        tween = null;
      },
    });
  }

  function handleDirection(down) {
    if (tween) return;

    const phase = useSceneStore.getState().phase;
    if (phase === "intro") return;

    if (down) {
      if (phase === "earth") animateTo(1);
      return;
    }

    if (phase === "india") animateTo(0);
    else if (phase === "city") transitionController.cityToIndia();
    else if (phase === "project") transitionController.projectToCity();
  }

  /*
   * Interacting with the live Mapbox map (scroll-to-zoom, drag-pan,
   * pinch) must not also be read as a page-navigation gesture - skip
   * our snap handling entirely while the pointer is over the map, so
   * Mapbox keeps its own native zoom/pan behavior. Tracked via explicit
   * pointerenter/pointerleave on the map container (see
   * MapboxExperience.jsx) rather than resolving each event's target,
   * which isn't reliable across the map's layered/overscanned DOM.
   */
  const isOverMap = () =>
    useSceneStore.getState().isPointerOverMap;

  function onWheel(e) {
    if (isOverMap()) return;

    e.preventDefault();
    if (Math.abs(e.deltaY) < WHEEL_THRESHOLD) return;
    handleDirection(e.deltaY > 0);
  }

  let touchStartY = null;
  let touchOverMap = false;

  function onTouchStart(e) {
    touchOverMap = isOverMap();
    touchStartY = e.touches[0].clientY;
  }

  function onTouchMove(e) {
    if (touchOverMap) return;
    e.preventDefault();
  }

  function onTouchEnd(e) {
    if (touchStartY === null || touchOverMap) {
      touchStartY = null;
      return;
    }

    const deltaY = touchStartY - e.changedTouches[0].clientY;
    touchStartY = null;
    if (Math.abs(deltaY) < SWIPE_THRESHOLD) return;
    handleDirection(deltaY > 0);
  }

  window.addEventListener("wheel", onWheel, { passive: false });
  window.addEventListener("touchstart", onTouchStart, { passive: true });
  window.addEventListener("touchmove", onTouchMove, { passive: false });
  window.addEventListener("touchend", onTouchEnd);

  return {
    destroy: () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      tween?.kill();
    },
    // Same "step back a level" logic scroll-up already uses - exposed so
    // a plain click (the "<- Earth" button on the India view) can drive
    // the exact same smooth camera tween instead of duplicating it.
    goBack: () => handleDirection(false),
  };
}
