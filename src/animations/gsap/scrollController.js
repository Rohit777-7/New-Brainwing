import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSceneStore } from "../../store/sceneStore";
import { transitionController } from "../transitions/TransitionController";

gsap.registerPlugin(ScrollTrigger);

export function initScrollController(root) {
  if (!root) return () => {};

  const store = useSceneStore.getState();
  const copies = root.querySelectorAll(".scene-copy-scroll");

  gsap.set(copies, { autoAlpha: 0, y: 30 });
  gsap.set(copies[0], { autoAlpha: 1, y: 0 });

  const trigger = ScrollTrigger.create({
    trigger: root,
    start: "top top",
    end: "bottom bottom",
    scrub: 1,
    onUpdate: (self) => {
      const p = self.progress;
      store.setProgress(p);
      store.setScene(p < 0.5 ? "earth" : "india");
      transitionController.earthToIndia(p);

      copies.forEach((copy, index) => {
        const start = index / copies.length;
        const end = (index + 1) / copies.length;
        const local = gsap.utils.clamp(0, 1, (p - start) / (end - start));
        gsap.set(copy, { autoAlpha: local > 0.15 && local < 0.9 ? 1 : 0, y: (1 - local) * 30 });
      });
    },
  });

  return () => trigger.kill();
}
