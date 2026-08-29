import { useEffect, useRef } from "react";

export function CustomCursor() {
  const ref = useRef();
  useEffect(() => {
    const move = (e) => {
      if (ref.current) {
        ref.current.style.transform = `translate3d(${e.clientX}px,${e.clientY}px,0)`;
      }
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);

  return (
    <div ref={ref} className="pointer-events-none fixed left-0 top-0 z-[90] hidden h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/70 md:block" />
  );
}