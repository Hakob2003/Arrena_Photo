"use client";
import { useAuthStore, useUIStore } from '../../store';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '../../hooks/useIsMobile';

export function Topbar() {
  const { user, credits } = useAuthStore();
  const { isSidebarOpen, setSidebarOpen } = useUIStore();
  const isMobile = useIsMobile();
  const showMobileLogo = isMobile && !isSidebarOpen;

  return (
    <header className="h-16 border-b border-white/5 bg-black/20 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20">
      <div className="flex items-center gap-2 md:hidden">
        <button 
          className="p-2 -ml-2 text-white hover:text-gray-300"
          onClick={() => setSidebarOpen(true)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile Logo with Framer Motion layout transition */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none h-full z-50">
        <AnimatePresence>
          {showMobileLogo && (
            <Link href="/" className="flex items-center hover:opacity-80 transition-opacity pointer-events-auto">
              <motion.img 
                layoutId="app-logo"
                src="/logo.png" 
                alt="Arrena Photo Logo" 
                className="h-6 w-auto object-contain" 
              />
            </Link>
          )}
        </AnimatePresence>
      </div>

      <div className="flex-1 max-w-xl hidden md:block">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Поиск промптов, шаблонов, авторов..." 
            className="w-full bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
          />
          <span className="absolute right-3 top-2.5 text-gray-400">🔍</span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 md:gap-6 ml-auto">
        {/* Credits Pill */}
        <div className="flex items-center gap-1 sm:gap-2 bg-indigo-500/10 border border-indigo-500/20 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full">
          <span className="text-indigo-400 text-xs sm:text-sm font-bold">⚡ {credits?.toLocaleString('en-US') || 0}</span>
          <span className="text-[10px] sm:text-xs text-indigo-300/70 uppercase hidden sm:inline">Кредиты</span>
        </div>
      </div>
    </header>
  );
}
