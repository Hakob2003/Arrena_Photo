"use client";

import React, { useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import { FLOW_ROUTES, getAdjacentRoutes, isFlowRoute } from '../../lib/navigation/constants';
import { PAGE_COMPONENTS } from '../../lib/navigation/registry';

export function VirtualCylinder({ currentPathname }: { currentPathname: string }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const [currentPath, setCurrentPath] = useState(
    isFlowRoute(currentPathname) ? currentPathname : FLOW_ROUTES[0]
  );

  const { prev, next } = getAdjacentRoutes(currentPath);

  const PrevComponent = prev ? PAGE_COMPONENTS[prev] : null;
  const CurrentComponent = PAGE_COMPONENTS[currentPath];
  const NextComponent = next ? PAGE_COMPONENTS[next] : null;

  // We need to keep track of heights to snap back correctly
  const prevSlotRef = useRef<HTMLDivElement>(null);
  const currentSlotRef = useRef<HTMLDivElement>(null);
  const nextSlotRef = useRef<HTMLDivElement>(null);
  
  const lenisRef = useRef<Lenis | null>(null);

  const stateRef = useRef({ currentPath, prev, next });
  useEffect(() => {
    stateRef.current = { currentPath, prev, next };
  }, [currentPath, prev, next]);

  // Sync URL popstate
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (isFlowRoute(path)) {
        setCurrentPath(path);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const isJumpingRef = useRef(false);
  const jumpTargetRef = useRef<{ excess: number, direction: 'down' | 'up' } | null>(null);
  const prevHeightRef = useRef<number>(0);

  // Handle Resize of PrevSlot to avoid visual jumps
  useEffect(() => {
    if (!prevSlotRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      if (!prevSlotRef.current || !lenisRef.current) return;
      
      const newHeight = prevSlotRef.current.offsetHeight;
      if (prevHeightRef.current !== 0 && prevHeightRef.current !== newHeight && !isJumpingRef.current) {
        const diff = newHeight - prevHeightRef.current;
        const currentScroll = lenisRef.current.scroll;
        // Adjust scroll silently to maintain visual position
        lenisRef.current.scrollTo(currentScroll + diff, { immediate: true });
      }
      prevHeightRef.current = newHeight;
    });

    resizeObserver.observe(prevSlotRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  React.useLayoutEffect(() => {
    if (jumpTargetRef.current && lenisRef.current && prevSlotRef.current && wrapperRef.current) {
      const { excess, direction } = jumpTargetRef.current;
      
      // Kill native scroll momentum to prevent sliding through multiple pages
      wrapperRef.current.style.overflowY = 'hidden';

      if (direction === 'down') {
        lenisRef.current.scrollTo(prevSlotRef.current.offsetHeight + excess, { immediate: true });
      } else {
        lenisRef.current.scrollTo(prevSlotRef.current.offsetHeight - excess, { immediate: true });
      }
      
      prevHeightRef.current = prevSlotRef.current.offsetHeight;
      jumpTargetRef.current = null;
      
      // Allow scroll events to process again after a tiny delay
      // to prevent lingering momentum from double-triggering
      setTimeout(() => {
        if (wrapperRef.current) {
          wrapperRef.current.style.overflowY = 'auto';
        }
        isJumpingRef.current = false;
      }, 50);
    }
  }, [currentPath]);

  // Update currentPath if props change (e.g. from Sidebar link click via router.push)
  // Wait, if Sidebar uses standard <Link> or router.push, Next.js handles it, and currentPathname changes.
  useEffect(() => {
    if (isFlowRoute(currentPathname) && currentPathname !== currentPath) {
      setCurrentPath(currentPathname);
      // Wait for render, then scroll to 100vh
      requestAnimationFrame(() => {
        if (lenisRef.current && prevSlotRef.current) {
          const newHeight = prevSlotRef.current.offsetHeight;
          lenisRef.current.scrollTo(newHeight, { immediate: true });
          prevHeightRef.current = newHeight;
        }
      });
    }
  }, [currentPathname]);

  useEffect(() => {
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
    lenisRef.current = lenis;

    // We start the scroll position exactly at the beginning of the Current Slot
    // which is after the Prev Slot.

    // After initial mount, jump to current slot
    if (prevSlotRef.current) {
      const initialHeight = prevSlotRef.current.offsetHeight;
      lenis.scrollTo(initialHeight, { immediate: true });
      prevHeightRef.current = initialHeight;
    }

    lenis.on('scroll', (e: any) => {
      if (isJumpingRef.current) return;
      if (!prevSlotRef.current || !currentSlotRef.current) return;

      const { prev: currentPrev, next: currentNext } = stateRef.current;

      const scrollY = e.scroll;
      const prevHeight = prevSlotRef.current.offsetHeight;
      const currentHeight = currentSlotRef.current.offsetHeight;

      // Scrolled past the bottom of Current page -> into Next page
      if (scrollY >= prevHeight + currentHeight) {
        if (currentNext) {
          isJumpingRef.current = true;
          // Calculate how far into the Next page we are
          const excess = scrollY - (prevHeight + currentHeight);
          jumpTargetRef.current = { excess, direction: 'down' };
          
          window.history.replaceState(null, '', currentNext);
          setCurrentPath(currentNext);
        }
      } 
      // Scrolled past the top of Current page -> into Prev page
      else if (scrollY <= 0) {
        if (currentPrev) {
          isJumpingRef.current = true;
          const excess = Math.abs(scrollY);
          jumpTargetRef.current = { excess, direction: 'up' };

          window.history.replaceState(null, '', currentPrev);
          setCurrentPath(currentPrev);
        }
      }
    });

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []); // Run only once to keep momentum

  return (
    <div 
      ref={wrapperRef} 
      className="virtual-cylinder-wrapper h-[100dvh] w-full overflow-y-auto bg-[#0a0a0a] relative"
    >
      <div ref={contentRef} className="virtual-cylinder-content w-full flex flex-col">
        {/* Prev Slot */}
        <div ref={prevSlotRef} className="w-full relative min-h-[100dvh]">
          {PrevComponent && <PrevComponent />}
        </div>
        
        {/* Current Slot */}
        <div ref={currentSlotRef} className="w-full relative min-h-[100dvh] z-10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          {CurrentComponent && <CurrentComponent />}
        </div>
        
        {/* Next Slot */}
        <div ref={nextSlotRef} className="w-full relative min-h-[100dvh]">
          {NextComponent && <NextComponent />}
        </div>
      </div>
    </div>
  );
}
