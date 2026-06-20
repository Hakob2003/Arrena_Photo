"use client";
import React from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '../../store';

export function AdminTopbar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  
  // Create simple breadcrumbs from pathname
  const paths = pathname?.split('/').filter(Boolean) || [];

  return (
    <header className="h-14 border-b border-border bg-[#0a0a0a] flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="text-muted-foreground">Admin</span>
        {paths.map((p, i) => (
          <React.Fragment key={i}>
            <span className="text-muted-foreground">/</span>
            <span className={i === paths.length - 1 ? 'text-foreground font-medium capitalize' : 'capitalize'}>
              {p.replace('-', ' ')}
            </span>
          </React.Fragment>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <button className="text-muted-foreground hover:text-foreground text-sm">Feedback</button>
        <button className="text-muted-foreground hover:text-foreground text-sm">Docs</button>
        <button 
          onClick={() => {
            logout();
            localStorage.removeItem('token');
            window.location.href = '/login';
          }}
          className="text-muted-foreground hover:text-foreground text-sm transition-colors"
        >
          Выйти
        </button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-700 to-gray-500 flex items-center justify-center text-xs font-bold text-foreground border border-border cursor-pointer">
          {user?.name?.charAt(0)?.toUpperCase() || 'A'}
        </div>
      </div>
    </header>
  );
}
