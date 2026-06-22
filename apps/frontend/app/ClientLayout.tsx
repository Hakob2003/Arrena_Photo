"use client";
import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar } from '../components/layout/Sidebar';
import { useAuthStore, useUIStore } from '../store';
import { Topbar } from '../components/layout/Topbar';
import { LayoutGroup } from 'framer-motion';
import { Toaster } from 'react-hot-toast';

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
  const pathname = usePathname();
  const router = useRouter();
  const isAdmin = pathname?.startsWith('/admin');
  const { user, login, setCredits } = useAuthStore();
  const { isSidebarOpen, setSidebarOpen, preferences, setPreferences } = useUIStore();
  
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [touchFingers, setTouchFingers] = useState<number>(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      if (!useAuthStore.getState().user) {
        // Decode initially to render quickly
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const user = {
            id: payload.sub,
            email: payload.email,
            role: typeof payload.role === 'object' && payload.role !== null ? payload.role.name : payload.role,
            name: payload.email?.split('@')[0] || 'User',
          };
          login(user, token);
          
          // Fetch fresh profile from backend (credits, name, etc.)
          api.get('/auth/me')
            .then(res => {
               const data = res.data;
               const freshUser = { 
                 id: data.id,
                 email: data.email,
                 name: data.name || data.email?.split('@')[0] || 'User',
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
              console.error('Failed to fetch user profile:', err);
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
            console.error('Failed to fetch user profile:', err);
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

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
    setTouchFingers(e.touches.length);
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
        // ONLY if at the top of the page to avoid breaking scroll
        if (distanceY > 100 && window.scrollY === 0) {
          window.location.reload();
        }
      }
    } else if (touchFingers === 2) {
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
  };

  if (isAdmin) {
    // Return children directly; admin/layout.tsx will handle the admin UI
    return <>{children}</>;
  }

  return (
    <LayoutGroup>
      <div 
        className="flex h-screen w-full overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {user && <Sidebar />}
        <div className="flex-1 flex flex-col min-w-0 relative">
          {/* Background Glow for Consumer App */}
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="flex items-center w-full z-20 relative">
            <div className="flex-1">
              <Topbar />
            </div>
          </div>
          
          <main className="flex-1 overflow-y-auto relative z-10 custom-scrollbar">
            {children}
          </main>
        </div>
      </div>
      <Toaster position="bottom-right" />
    </LayoutGroup>
  );
}
