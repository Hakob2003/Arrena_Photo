"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { useUIStore } from "@/store";

export function InnerScrollLenis({ children }: { children: React.ReactNode }) {
  const { preferences } = useUIStore();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!preferences.animationsEnabled || preferences.skin !== 'PREMIUM') return;
    if (!wrapperRef.current || !contentRef.current) return;

    const lenis = new Lenis({
      wrapper: wrapperRef.current,
      content: contentRef.current,
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    // Lenis requires its own raf loop
    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [preferences.animationsEnabled, preferences.skin]);

  if (preferences.skin !== 'PREMIUM') {
    return <>{children}</>;
  }

  return (
    <div 
      ref={wrapperRef} 
      className="drum-scroll-container h-[100dvh] w-full overflow-y-auto custom-scrollbar pb-20 bg-[#0a0a0a] flex-shrink-0 relative"
    >
      <div ref={contentRef} className="w-full relative">
        {children}
      </div>
    </div>
  );
}
