import { useEffect, useRef, useState } from "react";
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

  const [loaded, setLoaded] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!project || !ready) return;

    const store = useSceneStore.getState();
    store.setCity(project.city);
    store.setSelectedProject(project);
    store.setPhase("city");
  }, [project, ready]);

  useEffect(() => {
    setLoaded(false);
    setTimedOut(false);

    /*
     * Some sites block being framed (X-Frame-Options / CSP
     * frame-ancestors) and the browser gives no error event for that -
     * the iframe just stays blank forever. If "load" hasn't fired in a
     * few seconds, offer the direct link instead of leaving a dead page.
     */
    timeoutRef.current = window.setTimeout(
      () => setTimedOut(true),
      6000
    );

    return () =>
      window.clearTimeout(timeoutRef.current);
  }, [id]);

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
    <div className="fixed inset-0 z-[60] bg-[#05070a] text-white">
      <button
        onClick={goBackToCity}
        className="fixed left-6 top-6 z-10 flex items-center gap-2 rounded-full border border-white/10 bg-[#05070a]/80 px-4 py-2 text-[9px] uppercase tracking-[0.35em] text-white/70 backdrop-blur-md transition hover:border-white/30 hover:text-white md:left-12 md:top-10"
      >
        <span aria-hidden>&larr;</span> Back to city
      </button>

      {!loaded && !timedOut && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border border-white/15 border-t-white/60" />
        </div>
      )}

      {timedOut && !loaded ? (
        <div className="flex h-full w-full items-center justify-center px-6 text-center">
          <div>
            <p className="text-sm text-white/50">
              This project's page couldn't be embedded here.
            </p>
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block text-[9px] uppercase tracking-[0.35em] text-white transition hover:text-white/60"
            >
              Open {project.name} in a new tab
            </a>
          </div>
        </div>
      ) : (
        <iframe
          key={id}
          src={project.url}
          title={project.name}
          onLoad={() => setLoaded(true)}
          className="h-full w-full border-0"
        />
      )}
    </div>
  );
}
