import { create } from "zustand";

export const useSceneStore = create((set) => ({
  ready: false,
  progress: 0,
  scene: "earth",
  phase: "intro",
  city: "mumbai",
  selectedProject: null,
  highlightedMarker: null,
  parallaxStrength: 1,
  camera: {
    position: [0, 0, 6.5],
    lookAt: [0, 0, 0],
    fov: 38,
  },
  setReady: (ready) => set({ ready }),
  setProgress: (progress) => set({ progress }),
  setScene: (scene) => set({ scene }),
  setPhase: (phase) => set({ phase }),
  setCity: (city) => set({ city }),
  setSelectedProject: (selectedProject) => set({ selectedProject }),
  setHighlightedMarker: (highlightedMarker) => set({ highlightedMarker }),
  setParallaxStrength: (parallaxStrength) => set({ parallaxStrength }),
  setCamera: (camera) => set({ camera }),
}));
