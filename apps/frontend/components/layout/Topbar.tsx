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
  const showTopbarLogo = !isSidebarOpen;

  return (
    <header className="h-16 border-b border-black/10 dark:border-white/5 bg-[rgba(255,255,255,0.75)] dark:bg-black/20 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 sticky top-0 z-[60] shadow-sm dark:shadow-none">
      <div className="flex items-center gap-2 md:hidden">
        <button 
          className="p-2 -ml-2 text-slate-900 dark:text-white hover:text-slate-500 dark:hover:text-gray-300"
          onClick={() => setSidebarOpen(true)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Topbar Logo Text */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none h-full z-50">
        <AnimatePresence>
          {!isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0, x: "-42vw", scale: 0.3 }}
              animate={{ 
                opacity: 1, 
                x: 0, 
                scale: 1,
                transition: { duration: 1.7, ease: "easeInOut" }
              }}
              exit={{ 
                opacity: 0, 
                x: "-42vw", 
                scale: 0.3,
                transition: { 
                  duration: 1.7, 
                  ease: "easeInOut",
                  opacity: { delay: 1.5, duration: 0.2 } 
                }
              }}
            >
              <Link href="/" className="flex items-center hover:opacity-80 transition-opacity pointer-events-auto">
                <img 
                  src="/logo2.png" 
                  alt="Arrena Photo Text" 
                  className="h-5 sm:h-6 w-auto object-contain hidden dark:block" 
                />
                <img 
                  src="/logo2-light.png" 
                  alt="Arrena Photo Text" 
                  className="h-5 sm:h-6 w-auto object-contain block dark:hidden" 
                />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Search Bar Removed Temporarily */}
      <div className="flex-1 max-w-xl hidden md:block"></div>

      <div className="flex items-center gap-2 sm:gap-4 md:gap-6 ml-auto">
        {/* Credits Pill */}
        <div className="flex items-center gap-1 sm:gap-2 bg-indigo-500/10 border border-indigo-500/20 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full">
          <span className="text-indigo-600 dark:text-indigo-400 text-xs sm:text-sm font-bold">⚡ {credits?.toLocaleString('en-US') || 0}</span>
          <span className="text-[10px] sm:text-xs text-indigo-500/70 dark:text-indigo-300/70 uppercase hidden sm:inline">Кредиты</span>
        </div>
      </div>
    </header>
  );
}
