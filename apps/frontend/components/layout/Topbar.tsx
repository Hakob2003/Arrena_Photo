"use client";
import { useState, useEffect, useRef } from 'react';
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

  // We use a ref on the static wrapper to get the true absolute center on screen without feedback loops!
  const topbarWrapperRef = useRef<HTMLDivElement>(null);
  const topbarRef = useRef<HTMLDivElement>(null);

  const [topbarCenter, setTopbarCenter] = useState(1000); // Default fallback

  useEffect(() => {
    const calc = () => {
      // Calculate the EXACT physical center of the Topbar when the sidebar is CLOSED
      // On mobile, Topbar is full width. On desktop, it is window width - 80px.
      const isMobileLocal = window.innerWidth < 768;
      if (isMobileLocal) {
        setTopbarCenter(window.innerWidth / 2);
      } else {
        setTopbarCenter(80 + (window.innerWidth - 80) / 2);
      }
    };

    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);

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

      {/* Topbar Logo Text - Fixed Absolute Screen Coordinates */}
      <div className="fixed top-0 left-0 w-full h-16 pointer-events-none z-[60] flex items-center">
        <motion.div
          className="absolute left-0 -translate-x-1/2"
          initial={false}
          animate={{ 
            opacity: isSidebarOpen ? 0 : 1, 
            // 110px is exactly next to logo1 in the sidebar!
            x: isSidebarOpen ? 110 : topbarCenter, 
            scale: isSidebarOpen ? 0.1 : 1 
          }}
          transition={{ 
            layout: { duration: 1.7, ease: "easeInOut" },
            x: { duration: 1.7, ease: "easeInOut" },
            scale: { duration: 1.7, ease: "easeInOut" },
            opacity: { delay: isSidebarOpen ? 1.5 : 0, duration: 0.2 } 
          }}
        >
          <Link href="/" className={`flex items-center hover:opacity-80 transition-opacity ${isSidebarOpen ? 'pointer-events-none' : 'pointer-events-auto'}`}>
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
