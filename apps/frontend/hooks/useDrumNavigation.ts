"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUIStore } from "../store";

import { FLOW_ROUTES } from "../lib/navigation/constants";

export function useDrumNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const isNavigating = useRef(false);
  const skin = useUIStore((state) => state.preferences?.skin);

  useEffect(() => {
    // Only enable drum navigation for the new PREMIUM skin
    if (skin !== "PREMIUM") return;

    const getDrumLinks = (): string[] | null => {
      // FLOW_ROUTES are now handled by VirtualCylinder, so we don't intercept here
      // You can define other flows here if needed, like settings flow
      return null;
    };

    const currentDrum = getDrumLinks();
    if (!currentDrum || currentDrum.length === 0) return;

    const currentIndex = currentDrum.indexOf(pathname);

    // Prefetch adjacent routes
    const nextIndex = (currentIndex + 1) % currentDrum.length;
    const prevIndex =
      (currentIndex - 1 + currentDrum.length) % currentDrum.length;

    if (typeof window !== "undefined") {
      router.prefetch(currentDrum[nextIndex]);
      router.prefetch(currentDrum[prevIndex]);
    }

    // Reset navigation lock when route changes (so user can go back immediately)
    isNavigating.current = false;

    const navigateTo = (direction: "next" | "prev") => {
      const isTransitioning = useUIStore.getState().isTransitioning;
      if (isNavigating.current || isTransitioning) return;
      isNavigating.current = true;

      let nextIndex = 0;
      if (direction === "next") {
        nextIndex = (currentIndex + 1) % currentDrum.length;
      } else {
        nextIndex =
          (currentIndex - 1 + currentDrum.length) % currentDrum.length;
      }

      useUIStore
        .getState()
        .setNavDirection(direction === "next" ? "down" : "up");
      router.push(currentDrum[nextIndex], { scroll: false });

      // Fallback cooldown timer just in case route change takes too long
      setTimeout(() => {
        isNavigating.current = false;
      }, 1500);
    };

    let touchStartY = 0;

    const getScrollMetrics = () => {
      // Find the LAST scroll container (the active one during transitions)
      const containers = document.querySelectorAll(".drum-scroll-container");
      const scrollContainer =
        containers.length > 0
          ? (containers[containers.length - 1] as HTMLElement)
          : null;

      if (scrollContainer) {
        return {
          scrollTop: scrollContainer.scrollTop,
          scrollHeight: scrollContainer.scrollHeight,
          clientHeight: scrollContainer.clientHeight,
        };
      }
      return {
        scrollTop: window.scrollY,
        scrollHeight: document.body.scrollHeight,
        clientHeight: window.innerHeight,
      };
    };

    const handleWheel = (e: WheelEvent) => {
      const isTransitioning = useUIStore.getState().isTransitioning;
      if (isNavigating.current || isTransitioning) {
        // Prevent trackpad momentum rubber-banding from causing jumps during transition!
        e.preventDefault();
        return;
      }

      const { scrollTop, scrollHeight, clientHeight } = getScrollMetrics();

      // Ensure we only trigger at the absolute edges
      // Add a small 2px tolerance for fractional scaling issues
      const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) <= 2;
      const isAtTop = scrollTop <= 2;

      if (e.deltaY > 0 && isAtBottom) {
        // Scrolling down at the bottom
        e.preventDefault(); // Prevent bounce effect on mac
        navigateTo("next");
      } else if (e.deltaY < 0 && isAtTop) {
        // Scrolling up at the top
        e.preventDefault();
        navigateTo("prev");
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const isTransitioning = useUIStore.getState().isTransitioning;
      if (isNavigating.current || isTransitioning) {
        // Prevent touch momentum scrolling during transition
        e.preventDefault();
        return;
      }

      const touchEndY = e.touches[0].clientY;
      const deltaY = touchStartY - touchEndY; // positive means scrolling down

      const { scrollTop, scrollHeight, clientHeight } = getScrollMetrics();

      const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) <= 2;
      const isAtTop = scrollTop <= 2;

      // Requires a significant swipe (delta > 30px) to trigger
      if (deltaY > 30 && isAtBottom) {
        navigateTo("next");
      } else if (deltaY < -30 && isAtTop) {
        navigateTo("prev");
      }
    };

    // Use { passive: false } to allow e.preventDefault() to stop elastic overscroll
    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [pathname, router]);
}
