import { useSceneStore } from "../../store/sceneStore";

export function Header() {
  const phase = useSceneStore((s) => s.phase);
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex items-center justify-between px-6 py-6 md:px-12">
      <div className="pointer-events-auto text-sm font-semibold tracking-[-0.03em]">BRAINWING<span className="text-white/30">.IN</span></div>
      <div className="hidden text-[9px] uppercase tracking-[0.4em] text-white/35 md:block">
        Interactive Project Atlas / {phase}
      </div>
      <div className="pointer-events-auto flex items-center gap-2 text-[9px] uppercase tracking-[0.35em] text-white/50">
        <span className="h-1.5 w-1.5 rounded-full bg-white" /> Explore
      </div>
    </header>
  );
}