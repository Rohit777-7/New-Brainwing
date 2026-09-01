import { useEffect, useRef } from "react";
import { Outlet } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import { SceneExperience } from "../scenes/SceneExperience";
import { Header } from "../components/navigation/Header";
import { ProgressIndicator } from "../components/navigation/ProgressIndicator";
import { ProjectPanel } from "../components/projects/ProjectPanel";
import { MapboxExperience } from "../components/maps/MapboxExperience";
import { LoadingScreen } from "../components/ui/LoadingScreen";
import { CustomCursor } from "../components/ui/CustomCursor";
import { useSceneStore } from "../store/sceneStore";
import { initScrollController } from "../animations/gsap/scrollController";
import { transitionController } from "../animations/transitions/TransitionController";

export function App() {
  const stageRef = useRef(null);
  const scrollControllerRef = useRef(null);
  const phase = useSceneStore((s) => s.phase);
  const isMapTransitioning = useSceneStore((s) => s.isMapTransitioning);

  useEffect(() => {
    const controller = initScrollController(stageRef.current);
    scrollControllerRef.current = controller;
    return () => controller.destroy();
  }, []);

  return (
    <main ref={stageRef} className="relative h-screen w-full overflow-hidden bg-[#05070a] text-white">
      <LoadingScreen />
      <CustomCursor />
      <Header />
      <ProgressIndicator />

      <section className="relative z-10 h-screen w-full overflow-hidden">
        <Canvas
          dpr={[1, 1.75]}
          camera={{ position: [0, 0, 3.0], fov: 30, near: 0.1, far: 100 }}
          gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        >
          <SceneExperience />
        </Canvas>

        <MapboxExperience />

        <div className="pointer-events-none absolute inset-0 z-30">
          <div className="scene-copy scene-copy-scroll h-screen px-6 md:px-12">
            <div className="flex h-full items-end pb-16 md:pb-20">
              <div>
                <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.45em] text-white/40">Brainwing / Global Portfolio</p>
                <h1 className="max-w-3xl text-4xl font-light tracking-[-0.04em] md:text-7xl">
                  Projects, connected<br />to <span className="text-white/40">place.</span>
                </h1>
              </div>
            </div>
          </div>

          <div className="scene-copy scene-copy-scroll absolute inset-0 flex h-screen items-center px-6 md:px-12">
            <div className="max-w-md pt-20">
              <p className="mb-3 text-[10px] uppercase tracking-[0.45em] text-white/40">01 / India</p>
              <h2 className="text-4xl font-light tracking-[-0.04em] md:text-6xl">Explore our locations.</h2>
              <p className="mt-5 text-sm leading-7 text-white/45">Select a marker to move from country scale to city scale.</p>
            </div>
          </div>

          <div className={`absolute inset-0 flex h-screen items-center justify-end px-6 transition-opacity duration-700 md:px-12 ${phase === "city" && !isMapTransitioning ? "opacity-100" : "opacity-0"}`}>
            <div className="max-w-md pr-0 pt-24 md:pr-16">
              <p className="mb-3 text-[10px] uppercase tracking-[0.45em] text-white/40">02 / City</p>
              <h2 className="text-4xl font-light tracking-[-0.04em] md:text-6xl">Go closer.</h2>
              <p className="mt-5 text-sm leading-7 text-white/45">Select a project marker to move from city scale to project scale.</p>
            </div>
          </div>

          <div className={`absolute inset-0 flex h-screen items-end px-6 pb-20 transition-opacity duration-700 md:px-12 ${phase === "project" && !isMapTransitioning ? "opacity-100" : "opacity-0"}`}>
            <div className="max-w-md">
              <p className="mb-3 text-[10px] uppercase tracking-[0.45em] text-white/40">03 / Project</p>
              <h2 className="text-4xl font-light tracking-[-0.04em] md:text-6xl">Every project has a point of view.</h2>
            </div>
          </div>
        </div>

        {(phase === "city" || phase === "project") && (
          <button
            onClick={() => transitionController.cityToIndia()}
            className="pointer-events-auto absolute left-6 top-24 z-40 flex items-center gap-2 text-[9px] uppercase tracking-[0.35em] text-white/50 transition hover:text-white md:left-12"
          >
            <span aria-hidden>&larr;</span> India
          </button>
        )}

        {phase === "india" && (
          <button
            onClick={() => scrollControllerRef.current?.goBack()}
            className="pointer-events-auto absolute left-6 top-24 z-40 flex items-center gap-2 text-[9px] uppercase tracking-[0.35em] text-white/50 transition hover:text-white md:left-12"
          >
            <span aria-hidden>&larr;</span> Earth
          </button>
        )}

        <ProjectPanel />
      </section>

      <div className={`pointer-events-none fixed bottom-8 left-1/2 z-40 -translate-x-1/2 text-[9px] uppercase tracking-[0.4em] text-white/30 transition-opacity duration-500 ${phase === "earth" || phase === "india" ? "opacity-100" : "opacity-0"}`}>
        Scroll to explore
      </div>

      {/* Renders ProjectPage on top when /projects/:id matches - App stays mounted underneath either way. */}
      <Outlet />
    </main>
  );
}
