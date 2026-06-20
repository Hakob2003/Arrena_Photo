"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore, useUIStore } from '../../store';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { AdminTopbar } from '../../components/admin/AdminTopbar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { isSidebarOpen, setSidebarOpen } = useUIStore();
  const [touchStart, setTouchStart] = useState<number | null>(null);

  useEffect(() => {
    // Wait a brief moment to allow ClientLayout to load the token if it exists
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    
    // We parse token directly if user is not in state yet,
    // to prevent flashing unauthenticated state if we can avoid it.
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.role !== 'ADMIN') {
        router.push('/');
      }
    } catch {
      router.push('/login');
    }
  }, [router, user]);

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

  return (
    <div 
      className="flex h-screen w-full bg-[#050505] text-foreground"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center w-full z-20 bg-[#0a0a0a] border-b border-border md:border-none">
          <button 
            className="md:hidden p-4 text-foreground hover:text-muted-foreground"
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>
          <div className="flex-1">
            <AdminTopbar />
          </div>
        </div>
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar relative z-10">
          <div className="w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
