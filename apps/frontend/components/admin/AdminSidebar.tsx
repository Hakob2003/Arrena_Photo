"use client";
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuthStore, useUIStore } from '../../store';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '../../hooks/useIsMobile';

const ADMIN_LINKS = [
  { section: 'Overview', items: [
    { name: 'Dashboard', href: '/admin', icon: '📊' },
    { name: 'Analytics', href: '/admin/analytics', icon: '📈' },
  ]},
  { section: 'Management', items: [
    { name: 'Users', href: '/admin/users', icon: '👥' },
    { name: 'Templates', href: '/admin/templates', icon: '🎨' },
    { name: 'Marketplace', href: '/admin/marketplace', icon: '🛒' },
    { name: 'Generations', href: '/admin/generations', icon: '⚡' },
  ]},
  { section: 'Configuration', items: [
    { name: 'AI Models', href: '/admin/ai-models', icon: '🧠' },
    { name: 'AI Providers', href: '/admin/ai-providers', icon: '🤖' },
    { name: 'API Keys', href: '/admin/api-keys', icon: '🔑' },
    { name: 'Cloud Storage', href: '/admin/cloud', icon: '☁️' },
    { name: 'Billing', href: '/admin/billing', icon: '💳' },
  ]},
  { section: 'System', items: [
    { name: 'Audit Logs', href: '/admin/audit-logs', icon: '📋' },
    { name: 'Settings', href: '/admin/settings', icon: '⚙️' },
  ]}
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { isSidebarOpen, setSidebarOpen } = useUIStore();
  const isMobile = useIsMobile();
  const showSidebarLogo = !isMobile || isSidebarOpen;
  const { user } = useAuthStore();

  const handleLogout = () => {
    useAuthStore.getState().logout();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <motion.aside 
        initial={false}
        animate={{
          x: !isMobile ? 0 : (isSidebarOpen ? 0 : '-100%'),
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
          mass: 0.8
        }}
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-[#0a0a0a] border-r border-white/5 flex flex-col text-sm
          ${!isMobile ? 'relative' : ''}
        `}
      >
      {/* Brand Header */}
      <div className="py-4 flex items-center justify-between px-6 border-b border-white/5 h-[80px]">
        <AnimatePresence>
          {showSidebarLogo && (
            <Link href="/" className="flex items-center gap-2 w-full hover:opacity-80 transition-opacity" title="Вернуться на главную">
              <motion.img 
                layoutId="app-logo"
                src="/logo.png" 
                alt="Arrena Photo" 
                className="w-40 h-auto object-contain" 
              />
              <span className="font-semibold text-pink-500 tracking-tight text-[10px] uppercase bg-pink-500/10 px-1.5 py-0.5 rounded shrink-0">Admin</span>
            </Link>
          )}
        </AnimatePresence>
        <button 
          className="md:hidden text-gray-400 hover:text-white p-2 absolute right-4 top-5"
          onClick={() => setSidebarOpen(false)}
        >
          ✕
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 custom-scrollbar">
        {ADMIN_LINKS.map((group, i) => (
          <div key={i}>
            <h4 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              {group.section}
            </h4>
            <div className="space-y-0.5">
              {group.items.map(link => {
                const isActive = pathname === link.href;
                return (
                  <Link 
                    key={link.href} 
                    href={link.href}
                    className={`flex items-center gap-3 px-3 py-1.5 rounded-md transition-colors ${
                      isActive 
                        ? 'bg-white/10 text-white font-medium' 
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className="text-base">{link.icon}</span>
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User Section */}
      <div className="p-4 border-t border-white/5 mt-auto flex flex-col gap-4">
        <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors px-2 py-1.5 rounded-md hover:bg-white/5 text-sm">
          <span className="text-base">⬅️</span>
          <span className="font-medium">В приложение</span>
        </Link>
        
        {user && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 shrink-0 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold">
                {user.name?.charAt(0) || 'U'}
              </div>
              <div className="truncate text-left">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <p className="text-[10px] text-gray-500 truncate uppercase tracking-wider">{user.role}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-white transition-colors ml-2"
              title="Выйти"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        )}
      </div>
      </motion.aside>
    </>
  );
}
