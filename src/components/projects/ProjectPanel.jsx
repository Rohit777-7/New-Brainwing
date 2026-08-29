import { useEffect, useState } from "react";
import { ArrowUpRight, X } from "lucide-react";
import { useSceneStore } from "../../store/sceneStore";
import { transitionController } from "../../animations/transitions/TransitionController";

export function ProjectPanel() {
  const project = useSceneStore((s) => s.selectedProject);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [displayProject, setDisplayProject] = useState(null);

  useEffect(() => {
    if (project) {
      setDisplayProject(project);
      setMounted(true);
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    }

    setVisible(false);
    const timer = setTimeout(() => setMounted(false), 550);
    return () => clearTimeout(timer);
  }, [project]);

  if (!mounted || !displayProject) return null;

  return (
    <aside
      className={`absolute bottom-6 right-6 z-50 w-[min(420px,calc(100vw-3rem))] overflow-hidden rounded-2xl border border-white/10 bg-[#0a0d11]/90 shadow-2xl backdrop-blur-xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] md:bottom-10 md:right-12 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      }`}
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-[#11161c]">
        <img
          src={displayProject.image}
          alt=""
          className={`h-full w-full object-cover transition-all duration-700 ${visible ? "scale-100 opacity-80" : "scale-105 opacity-0"}`}
        />
        <button
          onClick={() => transitionController.projectToCity()}
          className="absolute right-3 top-3 rounded-full border border-white/10 bg-black/30 p-2 text-white/70 backdrop-blur-md transition hover:bg-white hover:text-black"
        >
          <X size={14} />
        </button>
      </div>
      <div className={`p-5 transition-all delay-100 duration-500 md:p-6 ${visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}>
        <div className="mb-3 flex items-center justify-between text-[9px] uppercase tracking-[0.3em] text-white/35">
          <span>{displayProject.category}</span><span>{displayProject.location}</span>
        </div>
        <h3 className="text-2xl font-light tracking-[-0.04em]">{displayProject.name}</h3>
        <p className="mt-3 text-sm leading-6 text-white/45">{displayProject.description}</p>
        <button className="mt-5 inline-flex items-center gap-2 text-[9px] uppercase tracking-[0.3em] text-white transition hover:text-white/60">
          View project <ArrowUpRight size={13} />
        </button>
      </div>
    </aside>
  );
}
