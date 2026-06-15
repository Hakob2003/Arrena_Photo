"use client";
import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '../components/layout/Sidebar';
import { useAuthStore, useUIStore } from '../store';
import { Topbar } from '../components/layout/Topbar';

import { api } from '../lib/api';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');
  const { login, setCredits } = useAuthStore();
  const { isSidebarOpen, setSidebarOpen } = useUIStore();
  const [touchStart, setTouchStart] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !useAuthStore.getState().user) {
      // Decode initially to render quickly
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const user = {
          id: payload.sub,
          email: payload.email,
          role: payload.role,
          name: payload.email?.split('@')[0] || 'User',
        };
        login(user, token);
        
        // Fetch fresh profile from backend
        api.get('/users/profile')
          .then(res => {
             const freshUser = res.data;
             login(freshUser, token);
             if (typeof freshUser.credits === 'number') {
               setCredits(freshUser.credits);
             }
          })
          .catch(err => console.error('Failed to fetch user profile:', err));
          
      } catch (err) {
        localStorage.removeItem('token');
      }
    }
  }, [login, setCredits]);

  useEffect(() => {
    // Close sidebar on navigation on mobile
    setSidebarOpen(false);
  }, [pathname, setSidebarOpen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const distance = touchEnd - touchStart;

    if (distance > 50 && touchStart < 50 && !isSidebarOpen) {
      setSidebarOpen(true);
    } else if (distance < -50 && isSidebarOpen) {
      setSidebarOpen(false);
    }
    setTouchStart(null);
  };

  if (isAdmin) {
    // Return children directly; admin/layout.tsx will handle the admin UI
    return <>{children}</>;
  }

  return (
    <div 
      className="flex h-screen w-full"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Background Glow for Consumer App */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="flex items-center w-full z-20 relative">
          <button 
            className="md:hidden p-4 text-white hover:text-gray-300"
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>
          <div className="flex-1">
            <Topbar />
          </div>
        </div>
        
        <main className="flex-1 overflow-y-auto relative z-10 custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}
