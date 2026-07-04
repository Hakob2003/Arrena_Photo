"use client";
import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar } from '../components/layout/Sidebar';
import { useAuthStore, useUIStore } from '../store';
import { Topbar } from '../components/layout/Topbar';
import { LayoutGroup, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { Navigation } from '../components/ui/Navigation';
import { parseJwtPayload } from '@/lib/utils/jwt';
import { SwipeHint } from '../components/ui/SwipeHint';
import { useIdleLogout } from '../hooks/useIdleLogout';

import { api } from '../lib/api';

const ALL_LINKS = [
  '/',
  '/generate',
  '/templates',
  '/marketplace',
  '/gallery',
  '/my-generations',
  '/my-templates',
  '/connections/ai',
  '/connections/cloud',
  '/profile',
  '/profile/billing',
];

export function ClientLayout({ children }: { children: React.ReactNode }) {
  useIdleLogout();
  
  const pathname = usePathname();
  const router = useRouter();
  const isAdmin = pathname?.startsWith('/admin');
  const { user, login, setCredits } = useAuthStore();
  const { isSidebarOpen, setSidebarOpen, preferences, setPreferences } = useUIStore();
  
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [touchFingers, setTouchFingers] = useState<number>(0);
  const [touchStartScrollY, setTouchStartScrollY] = useState<number>(0);
  const [isPinch, setIsPinch] = useState<boolean>(false);
  const [touchStartFingers, setTouchStartFingers] = useState<{ id: number, y: number }[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      if (!useAuthStore.getState().user) {
        // Decode initially to render quickly
        try {
          const payload = parseJwtPayload(token);
          if (payload) {
            const user = {
              id: payload.sub,
              email: payload.email,
              name: payload.email?.split('@')[0] || 'User',
              role: typeof payload.role === 'object' && payload.role !== null ? payload.role.name : payload.role,
              credits: 0,
            };
            useAuthStore.getState().setAuth(user, token);
          }
          
          // Fetch fresh profile from backend (credits, name, etc.)
          api.get('/auth/me')
            .then(res => {
               const data = res.data;
               const freshUser = { 
                 id: data.id,
                 email: data.email,
                 name: data.name || data.email?.split('@')[0] || 'User',
                 image: data.avatarUrl,
                 role: typeof data.role === 'object' ? data.role.name : data.role,
                 credits: data.credits,
                 planId: useAuthStore.getState().planId, // Preserve planId
               };
               login(freshUser, token);
               if (typeof data.credits === 'number') {
                 setCredits(data.credits);
               }
               if (data.preferences) {
                 setPreferences({
                   theme: data.preferences.theme || 'DARK',
                   accentColor: data.preferences.accentColor || 'INDIGO',
                   fontSize: data.preferences.fontSize || 'MEDIUM',
                   compactMode: !!data.preferences.compactMode,
                   animationsEnabled: data.preferences.animationsEnabled !== false,
                 });
               }
            })
            .catch(err => {
              console.log('Failed to fetch user profile:', err);
              // Token might be expired — clear it
              if (err.response?.status === 401) {
                localStorage.removeItem('token');
                useAuthStore.getState().logout();
              }
            });
        } catch (err) {
          localStorage.removeItem('token');
        }
      } else {
        // user is cached, but token might not be in zustand
        login(useAuthStore.getState().user, token);
        
        // Still fetch fresh profile to keep credits updated
        api.get('/auth/me')
          .then(res => {
             const data = res.data;
             const freshUser = { 
               id: data.id,
               email: data.email,
               name: data.name || data.email?.split('@')[0] || 'User',
               image: data.avatarUrl,
               role: typeof data.role === 'object' ? data.role.name : data.role,
               credits: data.credits,
               planId: useAuthStore.getState().planId, // Preserve planId
             };
             login(freshUser, token);
             if (typeof data.credits === 'number') {
               setCredits(data.credits);
             }
             if (data.preferences) {
               setPreferences({
                 theme: data.preferences.theme || 'DARK',
                 accentColor: data.preferences.accentColor || 'INDIGO',
                 fontSize: data.preferences.fontSize || 'MEDIUM',
                 compactMode: !!data.preferences.compactMode,
                 animationsEnabled: data.preferences.animationsEnabled !== false,
               });
             }
          })
          .catch(err => {
            console.log('Failed to fetch user profile:', err);
            if (err.response?.status === 401) {
              localStorage.removeItem('token');
              useAuthStore.getState().logout();
            }
          });
      }
    }
  }, [login, setCredits]);

  useEffect(() => {
    // Close sidebar on navigation on mobile
    setSidebarOpen(false);
  }, [pathname, setSidebarOpen]);

  // Hydrate locale from localStorage
  useEffect(() => {
    const savedLocale = localStorage.getItem('locale');
    if (savedLocale === 'en' || savedLocale === 'ru') {
      useUIStore.getState().setLocale(savedLocale);
    }
  }, []);

  // Apply UI Preferences to HTML
  useEffect(() => {
    const root = document.documentElement;
    // Theme
    if (preferences.theme === 'DARK' || (preferences.theme === 'SYSTEM' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Set custom data attributes for CSS overrides
    root.setAttribute('data-accent', preferences.accentColor.toLowerCase());
    root.setAttribute('data-font-size', preferences.fontSize.toLowerCase());
    root.setAttribute('data-skin', preferences.skin ? preferences.skin.toLowerCase() : 'luxury');
    if (preferences.compactMode) {
      root.classList.add('compact-mode');
    } else {
      root.classList.remove('compact-mode');
    }
    if (!preferences.animationsEnabled) {
      root.classList.add('disable-animations');
    } else {
      root.classList.remove('disable-animations');
    }
  }, [preferences]);

  // Show swipe hints on first load on mobile
  useEffect(() => {
    if (typeof window !== 'undefined' && user) {
      const hasSeen = localStorage.getItem('hasSeenSwipeHints') === 'true';
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
    setTouchStartFingers(Array.from(e.touches).map(t => ({ id: t.identifier, y: t.clientY })));
    
    // Get scroll position of the main scroll container
    const mainScroll = document.getElementById('main-scroll-container');
    setTouchStartScrollY(mainScroll ? mainScroll.scrollTop : window.scrollY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchStartFingers.length === 2) {
      const currentFingers = Array.from(e.touches);
      const f1Start = touchStartFingers.find(f => f.id === currentFingers[0].identifier);
      const f2Start = touchStartFingers.find(f => f.id === currentFingers[1].identifier);
      
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
    
    const isHorizontal = Math.abs(distanceX) > Math.abs(distanceY);

    if (touchFingers === 1) {
      if (isHorizontal) {
        // Swipe Left/Right (from anywhere)
        if (distanceX > 50 && !isSidebarOpen) {
          setSidebarOpen(true);
        } else if (distanceX < -50 && isSidebarOpen) {
          setSidebarOpen(false);
        }
      } else {
        // Swipe Up/Down with 1 finger (Pull-to-refresh)
        // ONLY if at the top of the page AT THE START of the touch and touch starts near the top
        if (distanceY > 100 && touchStartScrollY <= 5 && touchStartY < 150) {
          window.location.reload();
        }
      }
    } else if (touchFingers === 2 && !isPinch) {
      if (!isHorizontal) {
        // Two-finger swipe Up/Down
        if (Math.abs(distanceY) > 50) {
          const currentIndex = ALL_LINKS.indexOf(pathname || '/');
          const maxIndex = ALL_LINKS.length - 1;
          
          if (distanceY > 50) {
            // Swipe down -> Next link
            const nextIndex = currentIndex === -1 ? 0 : (currentIndex === maxIndex ? 0 : currentIndex + 1);
            router.push(ALL_LINKS[nextIndex]);
          } else if (distanceY < -50) {
            // Swipe up -> Prev link
            const prevIndex = currentIndex === -1 ? 0 : (currentIndex === 0 ? maxIndex : currentIndex - 1);
            router.push(ALL_LINKS[prevIndex]);
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
    <>
      <div 
        className="flex h-[100dvh] w-full overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {mounted && user && <Sidebar />}
        <div className="flex-1 flex flex-col min-w-0 relative">
          {mounted && preferences.skin === 'NEON' ? (
            <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden bg-background">
              <motion.div 
                className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] md:w-[50vw] md:h-[50vw] rounded-full" 
                style={{ background: 'rgb(var(--color-accent-500) / 0.35)', filter: 'blur(80px)' }}
                animate={{
                  opacity: [1, 0.2, 0.9, 0.1, 1],
                  scale: [1, 1.2, 0.85, 1.3, 1],
                  x: ['0%', '8%', '-10%', '5%', '0%'],
                  y: ['0%', '12%', '5%', '-8%', '0%']
                }}
                transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div 
                className="absolute bottom-[-20%] right-[-10%] w-[70vw] h-[70vw] md:w-[50vw] md:h-[50vw] rounded-full" 
                style={{ background: 'rgb(var(--color-accent-400) / 0.3)', filter: 'blur(80px)' }}
                animate={{
                  opacity: [0.8, 0.1, 1, 0.2, 0.8],
                  scale: [1.1, 0.8, 1.25, 0.9, 1.1],
                  x: ['0%', '-12%', '8%', '-5%', '0%'],
                  y: ['0%', '-8%', '10%', '12%', '0%']
                }}
                transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div 
                className="absolute top-[40%] right-[30%] w-[50vw] h-[50vw] md:w-[30vw] md:h-[30vw] rounded-full" 
                style={{ background: 'rgb(var(--color-accent-300) / 0.25)', filter: 'blur(70px)' }}
                animate={{
                  opacity: [0.6, 1, 0.15, 0.9, 0.6],
                  scale: [0.9, 1.3, 0.85, 1.1, 0.9],
                  x: ['0%', '10%', '-8%', '5%', '0%'],
                  y: ['0%', '-10%', '8%', '5%', '0%']
                }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div 
                className="absolute bottom-[30%] left-[20%] w-[40vw] h-[40vw] md:w-[25vw] md:h-[25vw] rounded-full" 
                style={{ background: 'rgb(var(--color-accent-600) / 0.3)', filter: 'blur(70px)' }}
                animate={{
                  opacity: [0.7, 0.1, 1, 0.2, 0.7],
                  scale: [1, 1.25, 0.8, 1.2, 1],
                  x: ['0%', '-10%', '12%', '-5%', '0%'],
                  y: ['0%', '12%', '-5%', '-10%', '0%']
                }}
                transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
          ) : mounted && preferences.skin !== 'LUXURY' ? (
            <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
              <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 blur-[40px] rounded-full" />
              <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 blur-[40px] rounded-full" />
            </div>
          ) : null}
          
          <div className="flex items-center w-full z-20 relative min-h-[64px]">
            <div className="flex-1">
              {mounted && <Topbar />}
            </div>
          </div>
          
          <main id="main-scroll-container" className="flex-1 overflow-y-auto relative z-10 custom-scrollbar pb-20">
            <div className="pb-10">
              {mounted ? children : <div className="animate-pulse flex space-x-4 p-6"><div className="flex-1 space-y-6 py-1"><div className="h-4 bg-slate-800 rounded w-3/4"></div><div className="space-y-3"><div className="h-4 bg-slate-800 rounded"></div><div className="h-4 bg-slate-800 rounded w-5/6"></div></div></div></div>}
            </div>
          </main>
        </div>
      </div>
      <Toaster position="bottom-right" />
      <SwipeHint />
    </>
  );
}
