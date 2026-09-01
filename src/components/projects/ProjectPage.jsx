import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { projects } from "../../data/projects";
import { useSceneStore } from "../../store/sceneStore";

/*
 * Rendered as a nested route on top of App (see main.jsx) so the Earth
 * -> India -> City -> Project experience underneath is never unmounted -
 * the Mapbox instance, camera state and city framing are all still
 * exactly where they were when the panel's "View project" link was
 * clicked, so going back needs no re-transition of its own.
 */
export function ProjectPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const ready = useSceneStore((s) => s.ready);

  const project = projects.find((p) => p.id === id);

  useEffect(() => {
    if (!project || !ready) return;

    const store = useSceneStore.getState();
    store.setCity(project.city);
    store.setSelectedProject(project);
    store.setPhase("city");
  }, [project, ready]);

  const goBackToCity = () => {
    if (project) {
      const store = useSceneStore.getState();
      store.setCity(project.city);
      store.setSelectedProject(null);
      store.setPhase("city");
    }

    navigate("/");
  };

  if (!project) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#05070a] text-white">
        <div className="text-center">
          <p className="text-sm text-white/50">Project not found.</p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 text-[9px] uppercase tracking-[0.35em] text-white/60 transition hover:text-white"
          >
            &larr; Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-[#05070a] text-white">
      <button
        onClick={goBackToCity}
        className="fixed left-6 top-6 z-10 flex items-center gap-2 text-[9px] uppercase tracking-[0.35em] text-white/60 transition hover:text-white md:left-12 md:top-10"
      >
        <span aria-hidden>&larr;</span> Back to city
      </button>

      <div className="relative h-[55vh] w-full overflow-hidden md:h-[65vh]">
        <img
          src={project.image}
          alt=""
          className="h-full w-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#05070a] via-transparent to-[#05070a]/50" />
      </div>

      <div className="mx-auto max-w-3xl px-6 pb-24 pt-10 md:px-12">
        <div className="mb-4 flex items-center gap-4 text-[9px] uppercase tracking-[0.3em] text-white/40">
          <span>{project.category}</span>
          <span className="h-px w-8 bg-white/20" />
          <span>{project.location}</span>
        </div>

        <h1 className="text-4xl font-light tracking-[-0.04em] md:text-6xl">
          {project.name}
        </h1>

        <p className="mt-6 max-w-xl text-sm leading-7 text-white/50">
          {project.description}
        </p>
      </div>
    </div>
  );
}
