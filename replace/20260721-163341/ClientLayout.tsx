"use client";
import React, { useState, useEffect, useRef } from "react";
import { flushSync } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "../components/layout/Sidebar";
import { Footer } from "../components/layout/Footer";
import { useAuthStore, useUIStore } from "../store";
import { Topbar } from "../components/layout/Topbar";
import {
  LayoutGroup,
  motion,
  AnimatePresence,
  useAnimation,
} from "framer-motion";
import { Toaster } from "react-hot-toast";

import { parseJwtPayload } from "@/lib/utils/jwt";
import { SwipeHint } from "../components/ui/SwipeHint";
import { useIdleLogout } from "../hooks/useIdleLogout";
import { SmoothScrollProvider } from "../components/providers/SmoothScrollProvider";
import { InnerScrollLenis } from "../components/providers/InnerScrollLenis";
import { InfiniteLoop } from "../components/layout/InfiniteLoop";
import { useDrumNavigation } from "../hooks/useDrumNavigation";

import { api } from "../lib/api";
import {
  FLOW_ROUTES,
  getAdjacentRoutes,
  isFlowRoute,
} from "@/lib/navigation/constants";
import { VirtualCylinder } from "../components/layout/VirtualCylinder";

function FrozenChildren({ children }: { children: React.ReactNode }) {
  const frozen = React.useRef(children).current;
  return <>{frozen}</>;
}

export function ClientLayout({ children }: { children: React.ReactNode }) {
  useIdleLogout();
  useDrumNavigation();

  const pathname = usePathname();
  const router = useRouter();
  const isAdmin = pathname?.startsWith("/admin");
  const { user, login, setCredits } = useAuthStore();
  const { isSidebarOpen, setSidebarOpen, preferences, setPreferences } =
    useUIStore();
  const navDirection = useUIStore((state) => state.navDirection);

  const activeSkin = user ? preferences.skin : "NEON";

  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [touchFingers, setTouchFingers] = useState<number>(0);
  const [touchStartScrollY, setTouchStartScrollY] = useState<number>(0);
  const [isPinch, setIsPinch] = useState<boolean>(false);
  const [touchStartFingers, setTouchStartFingers] = useState<
    { id: number; y: number }[]
  >([]);
  const [mounted, setMounted] = useState(false);

  const PUBLIC_ROUTES = [
    "/",
    "/login",
    "/register",
    "/privacy",
    "/terms",
    "/refund-policy",
    "/billing-policy",
    "/verify",
  ];

  const isProtectedRoute = pathname ? !PUBLIC_ROUTES.includes(pathname) : false;
  const isRedirecting = mounted && !user && isProtectedRoute;
  const shouldRenderContent = mounted && !isRedirecting;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isRedirecting) {
      router.push("/login");
    }
  }, [isRedirecting, router]);

  useEffect(() => {
    // Just fetch /auth/me. If we have a refresh_token cookie but no access_token in memory,
    // the axios interceptor will automatically pause this request, call /auth/refresh,
    // save the new access_token, and then replay this request.
    api
      .get("/auth/me")
      .then((meRes) => {
        const data = meRes.data;
        const freshUser = {
          id: data.id,
          email: data.email,
          name: data.name || data.email?.split("@")[0] || "User",
          image: data.avatarUrl,
          role: typeof data.role === "object" ? data.role.name : data.role,
          credits: data.credits,
          planId: data.planId || "free",
        };
        // Retrieve the token that was just set by the interceptor
        const currentToken =
          api.defaults.headers.common["Authorization"]
            ?.toString()
            .replace("Bearer ", "") || null;
        login(freshUser, currentToken);
        if (typeof data.credits === "number") {
          setCredits(data.credits);
        }
        if (data.preferences) {
          setPreferences({
            theme: data.preferences.theme || "DARK",
            accentColor: data.preferences.accentColor || "INDIGO",
            fontSize: data.preferences.fontSize || "MEDIUM",
            compactMode: !!data.preferences.compactMode,
            animationsEnabled: data.preferences.animationsEnabled !== false,
            skin: data.preferences.skin || "NEON",
          });
        }
      })
      .catch((err) => {
        console.log(
          "Initial auth check failed (user not logged in or session expired)",
        );
      });
  }, [login, setCredits, setPreferences]);

  useEffect(() => {
    // Close sidebar on navigation on mobile
    setSidebarOpen(false);
  }, [pathname, setSidebarOpen]);

  // Hydrate locale from localStorage
  useEffect(() => {
    const savedLocale = localStorage.getItem("locale");
    if (savedLocale === "en" || savedLocale === "ru") {
      useUIStore.getState().setLocale(savedLocale);
    }
  }, []);

  // Apply UI Preferences to HTML
  useEffect(() => {
    const root = document.documentElement;
    // Theme
    if (
      preferences.theme === "DARK" ||
      (preferences.theme === "SYSTEM" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // Set custom data attributes for CSS overrides
    root.setAttribute(
      "data-accent",
      (preferences.accentColor || "INDIGO").toLowerCase(),
    );
    root.setAttribute(
      "data-font-size",
      (preferences.fontSize || "MD").toLowerCase(),
    );
    root.setAttribute(
      "data-skin",
      preferences.skin ? preferences.skin.toLowerCase() : "luxury",
    );
    if (preferences.compactMode) {
      root.classList.add("compact-mode");
    } else {
      root.classList.remove("compact-mode");
    }
    if (!preferences.animationsEnabled) {
      root.classList.add("disable-animations");
    } else {
      root.classList.remove("disable-animations");
    }
  }, [preferences]);

  // Show swipe hints on first load on mobile
  useEffect(() => {
    if (typeof window !== "undefined" && user) {
      const hasSeen = localStorage.getItem("hasSeenSwipeHints") === "true";
      if (!hasSeen) {
        useUIStore.getState().setShowSwipeHints(true);
      } else {
        useUIStore.getState().setHasSeenSwipeHints(true);
      }
    }
  }, [user]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
    setTouchFingers(e.touches.length);
    setIsPinch(false);

    // Track initial Y positions of all fingers for pinch detection
    setTouchStartFingers(
      Array.from(e.touches).map((t) => ({ id: t.identifier, y: t.clientY })),
    );

    // Get scroll position of the main scroll container
    const mainScroll = document.getElementById("main-scroll-container");
    setTouchStartScrollY(
      mainScroll ? mainScroll.scrollTop || window.scrollY : window.scrollY,
    );
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchStartFingers.length === 2) {
      const currentFingers = Array.from(e.touches);
      const f1Start = touchStartFingers.find(
        (f) => f.id === currentFingers[0].identifier,
      );
      const f2Start = touchStartFingers.find(
        (f) => f.id === currentFingers[1].identifier,
      );

      if (f1Start && f2Start) {
        const dy1 = currentFingers[0].clientY - f1Start.y;
        const dy2 = currentFingers[1].clientY - f2Start.y;

        // If fingers move in opposite vertical directions, it's a pinch
        if (dy1 * dy2 < 0) {
          setIsPinch(true);
        }
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null || touchStartY === null) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const distanceX = touchEndX - touchStartX;
    const distanceY = touchEndY - touchStartY;

    const isHorizontal = Math.abs(distanceX) > Math.abs(distanceY) * 1.5;

    if (touchFingers === 1) {
      if (isHorizontal) {
        // Swipe Left/Right
        if (distanceX > 50 && !isSidebarOpen) {
          // Open sidebar only if swipe starts from the left edge (e.g. < 60px)
          if (touchStartX < 60) {
            setSidebarOpen(true);
          }
        } else if (distanceX < -50 && isSidebarOpen) {
          setSidebarOpen(false);
        }
      } else if (Math.abs(distanceY) > Math.abs(distanceX)) {
        // Swipe Up/Down with 1 finger (Pull-to-refresh)
        // ONLY if at the top of the page AT THE START of the touch and touch starts near the top
        if (distanceY > 100 && touchStartScrollY <= 5 && touchStartY < 150) {
          window.location.reload();
        }
      }
    } else if (touchFingers === 2 && !isPinch) {
      if (!isHorizontal) {
        // Two-finger swipe Up/Down
        if (Math.abs(distanceY) > 50 && !isFlowRoute(pathname || "/")) {
          const { prev, next } = getAdjacentRoutes(pathname || "/");

          if (distanceY > 50 && next) {
            // Swipe down -> Next link
            useUIStore.getState().setNavDirection("down");
            router.push(next);
          } else if (distanceY < -50 && prev) {
            // Swipe up -> Prev link
            useUIStore.getState().setNavDirection("up");
            router.push(prev);
          }
        }
      }
    }

    setTouchStartX(null);
    setTouchStartY(null);
    setTouchFingers(0);
    setIsPinch(false);
  };

  if (isAdmin) {
    // Return children directly; admin/layout.tsx will handle the admin UI
    return <>{children}</>;
  }

  return (
    <SmoothScrollProvider>
      <div
        className={
          activeSkin === "PREMIUM"
            ? `flex h-[100dvh] w-full overflow-hidden theme-${activeSkin?.toLowerCase() || "default"}`
            : `flex min-h-screen w-full theme-${activeSkin?.toLowerCase() || "default"}`
        }
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {shouldRenderContent &&
          user &&
          pathname !== "/login" &&
          pathname !== "/register" && <Sidebar />}
        <div className="flex-1 flex flex-col min-w-0 relative">
          {shouldRenderContent && activeSkin === "NEON" ? (
            <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden bg-background">
              <motion.div
                className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] md:w-[50vw] md:h-[50vw] rounded-full"
                style={{
                  background: "rgb(var(--color-accent-300) / 0.1)",
                  filter: "blur(100px)",
                }}
                animate={{
                  opacity: [0.3, 0.6, 0.2, 0.7, 0.3],
                  scale: [0.9, 1.2, 0.8, 1.1, 0.9],
                  x: ["0%", "5%", "-5%", "2%", "0%"],
                  y: ["0%", "-5%", "5%", "-2%", "0%"],
                }}
                transition={{
                  duration: 15,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] md:w-[40vw] md:h-[40vw] rounded-full"
                style={{
                  background: "rgb(var(--color-accent-600) / 0.15)",
                  filter: "blur(100px)",
                }}
                animate={{
                  opacity: [0.4, 0.2, 0.7, 0.3, 0.4],
                  scale: [1, 0.8, 1.3, 0.9, 1],
                  x: ["0%", "-8%", "5%", "-3%", "0%"],
                  y: ["0%", "8%", "-3%", "6%", "0%"],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
          ) : shouldRenderContent && activeSkin === "LUXURY" ? (
            <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
              <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#D4AF37]/5 blur-[60px] rounded-full" />
              <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#C5A028]/10 blur-[60px] rounded-full" />
            </div>
          ) : shouldRenderContent ? (
            <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
              <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 blur-[40px] rounded-full" />
              <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 blur-[40px] rounded-full" />
            </div>
          ) : null}

          {pathname !== "/login" && pathname !== "/register" && <Topbar />}
          <main
            id="main-scroll-container"
            className={
              activeSkin === "PREMIUM"
                ? "flex-1 relative z-10 overflow-hidden"
                : "flex-1 relative z-10 custom-scrollbar pb-20"
            }
          >
            <div
              className={
                activeSkin === "PREMIUM"
                  ? "h-[100dvh] w-full relative"
                  : "pb-10"
              }
            >
              {activeSkin === "PREMIUM" ? (
                shouldRenderContent ? (
                  isFlowRoute(pathname || "/") ? (
                    <VirtualCylinder currentPathname={pathname || "/"} />
                  ) : (
                    <InnerScrollLenis key={pathname}>
                      <div className="flex flex-col min-h-full">
                        <div className="flex-1">{children}</div>
                        <Footer />
                      </div>
                    </InnerScrollLenis>
                  )
                ) : (
                  <div className="animate-pulse flex space-x-4 p-6">
                    <div className="flex-1 space-y-6 py-1">
                      <div className="h-4 bg-slate-800 rounded w-3/4"></div>
                      <div className="space-y-3">
                        <div className="h-4 bg-slate-800 rounded"></div>
                        <div className="h-4 bg-slate-800 rounded w-5/6"></div>
                      </div>
                    </div>
                  </div>
                )
              ) : shouldRenderContent ? (
                <div className="flex flex-col min-h-full">
                  <div className="flex-1">{children}</div>
                  <Footer />
                </div>
              ) : (
                <div className="animate-pulse flex space-x-4 p-6">
                  <div className="flex-1 space-y-6 py-1">
                    <div className="h-4 bg-slate-800 rounded w-3/4"></div>
                    <div className="space-y-3">
                      <div className="h-4 bg-slate-800 rounded"></div>
                      <div className="h-4 bg-slate-800 rounded w-5/6"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
      <SwipeHint />
    </SmoothScrollProvider>
  );
}
