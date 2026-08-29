import { useEffect, useMemo, useRef, useState } from "react";
import { useSceneStore } from "../../store/sceneStore";
import { playOpeningSequence } from "../../animations/gsap/openingSequence";

export function LoadingScreen() {
  const setReady = useSceneStore((s) => s.setReady);
  const [hidden, setHidden] = useState(false);
  const overlayRef = useRef(null);
  const glowRef = useRef(null);
  const logoRef = useRef(null);

  const particles = useMemo(
    () =>
      Array.from({ length: 26 }).map(() => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: 1 + Math.random() * 1.6,
        duration: 4 + Math.random() * 5,
        delay: Math.random() * 4,
      })),
    []
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      playOpeningSequence({
        glowRef: glowRef.current,
        logoRef: logoRef.current,
        overlayRef: overlayRef.current,
        onDone: () => {
          setReady(true);
          window.setTimeout(() => setHidden(true), 400);
        },
      });
    }, 400);

    return () => window.clearTimeout(timer);
  }, [setReady]);

  if (hidden) return null;

  return (
    <div ref={overlayRef} className="fixed inset-0 z-[100] overflow-hidden bg-[#05070a]">
      <div ref={glowRef} className="absolute left-1/2 top-1/2 h-[60vmax] w-[60vmax] -translate-x-1/2 -translate-y-1/2 opacity-0">
        <div
          className="h-full w-full rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(60,110,255,0.16) 0%, rgba(60,110,255,0.05) 40%, transparent 70%)",
            animation: "glow-pulse 6s ease-in-out infinite",
          }}
        />
      </div>

      {particles.map((p, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white/50"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            animation: `particle-drift ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}

      <div className="relative flex h-full items-center justify-center">
        <div ref={logoRef} className="translate-y-3 text-center opacity-0">
          <div className="mb-5 text-xs font-semibold tracking-[0.35em]">BRAINWING</div>
          <div className="mx-auto h-px w-32 overflow-hidden bg-white/10">
            <div className="h-full w-1/2 animate-pulse bg-white/70" />
          </div>
          <div className="mt-4 text-[8px] uppercase tracking-[0.4em] text-white/30">Loading atlas</div>
        </div>
      </div>
    </div>
  );
}
