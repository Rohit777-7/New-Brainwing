import gsap from "gsap";
import { transitionController } from "../transitions/TransitionController";

/*
 * Transition 01 - darkness -> logo -> Earth reveal. Runs once on mount.
 * `refs` are the DOM nodes LoadingScreen exposes for the overlay pieces;
 * the camera/Earth-visibility half of this lives in the controller so it
 * stays reusable and framework-agnostic.
 */
export function playOpeningSequence({ glowRef, logoRef, overlayRef, onDone }) {
  transitionController.playOpening();

  const tl = gsap.timeline({ onComplete: onDone });

  tl.to(glowRef, { opacity: 1, duration: 1.1, ease: "power2.out" }, 0.1);
  tl.to(logoRef, { opacity: 1, y: 0, duration: 1.1, ease: "power2.out" }, 0.5);
  tl.to(logoRef, { opacity: 0, y: -32, duration: 0.9, ease: "power2.inOut" }, 1.9);
  tl.to(overlayRef, { opacity: 0, duration: 1.2, ease: "power2.inOut" }, 2.0);

  return tl;
}
