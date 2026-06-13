"use client";
import React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '../components/layout/Sidebar';
import { useAuthStore } from '../store';
import { Topbar } from '../components/layout/Topbar';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');
  const { login } = useAuthStore();

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !useAuthStore.getState().user) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const user = {
          id: payload.sub,
          email: payload.email,
          role: payload.role,
          name: payload.email?.split('@')[0] || 'User',
        };
        login(user, token);
      } catch (err) {
        localStorage.removeItem('token');
      }
    }
  }, [login]);

  if (isAdmin) {
    // Return children directly; admin/layout.tsx will handle the admin UI
    return <>{children}</>;
  }

  return (
    <>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Background Glow for Consumer App */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />
        
        <Topbar />
        
        <main className="flex-1 overflow-y-auto relative z-10 custom-scrollbar">
          {children}
        </main>
      </div>
    </>
  );
}
