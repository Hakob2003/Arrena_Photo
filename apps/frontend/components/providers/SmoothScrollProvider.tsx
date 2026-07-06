"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { useUIStore } from "@/store";

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const { preferences } = useUIStore();
  
  useEffect(() => {
    if (!preferences.animationsEnabled) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, [preferences.animationsEnabled]);

  return <>{children}</>;
}
