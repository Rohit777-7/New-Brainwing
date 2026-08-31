import { useSceneStore } from "../../store/sceneStore";

const labels = ["Earth", "India", "City", "Project"];

export function ProgressIndicator() {
  const phase = useSceneStore((s) => s.phase);
  const index = phase === "city" ? 2 : phase === "project" ? 3 : phase === "earth" || phase === "intro" ? 0 : 1;
  return (
    <div className="pointer-events-none fixed right-6 top-1/2 z-50 hidden -translate-y-1/2 md:right-12 md:block">
      <div className="mb-3 text-right text-[8px] uppercase tracking-[0.35em] text-white/30">0{index + 1}</div>
      <div className="flex flex-col items-end gap-2">
        {labels.map((label, i) => (
          <div key={label} className={`flex items-center gap-2 text-[8px] uppercase tracking-[0.25em] transition-opacity ${i === index ? "opacity-100" : "opacity-25"}`}>
            {label}<span className="h-px w-5 bg-white/50" />
          </div>
        ))}
      </div>
    </div>
  );
}