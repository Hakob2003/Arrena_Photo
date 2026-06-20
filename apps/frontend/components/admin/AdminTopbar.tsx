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
    <header className="h-14 border-b border-black/5 dark:border-white/5 bg-[#0a0a0a] flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-gray-400">
        <span className="text-slate-400 dark:text-gray-500">Admin</span>
        {paths.map((p, i) => (
          <React.Fragment key={i}>
            <span className="text-gray-600">/</span>
            <span className={i === paths.length - 1 ? 'text-white font-medium capitalize' : 'capitalize'}>
              {p.replace('-', ' ')}
            </span>
          </React.Fragment>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <button className="text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:text-white text-sm">Feedback</button>
        <button className="text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:text-white text-sm">Docs</button>
        <button 
          onClick={() => {
            logout();
            localStorage.removeItem('token');
            window.location.href = '/login';
          }}
          className="text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:text-white text-sm transition-colors"
        >
          Выйти
        </button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-700 to-gray-500 flex items-center justify-center text-xs font-bold text-slate-900 dark:text-white border border-black/10 dark:border-white/10 cursor-pointer">
          {user?.name?.charAt(0)?.toUpperCase() || 'A'}
        </div>
      </div>
    </header>
  );
}
