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

  const topbarRef = useRef<HTMLDivElement>(null);

  const [targetX, setTargetX] = useState(0);

  useEffect(() => {
    const calc = () => {
      const topbarEl = topbarRef.current;
      const sidebarEl = document.getElementById('sidebar-logo-ref');
      
      if (!topbarEl || !sidebarEl) return;
      
      const topbarRect = topbarEl.getBoundingClientRect();
      const sidebarRect = sidebarEl.getBoundingClientRect();

      const topbarCenterX = topbarRect.left + topbarRect.width / 2;
      const sidebarCenterX = sidebarRect.left + sidebarRect.width / 2;

      // When opening, if it's currently at 0, this records the exact required travel distance!
      // The user specified: sidebarCenterX - topbarCenterX
      setTargetX(sidebarCenterX - topbarCenterX);
    };

    // Calculate immediately and also on window resize
    calc();
    
    // We also run calc periodically while sidebar is open to capture its final resting position
    let interval: NodeJS.Timeout;
    if (isSidebarOpen) {
      interval = setInterval(calc, 50);
    }
    
    window.addEventListener('resize', calc);
    return () => {
      window.removeEventListener('resize', calc);
      clearInterval(interval);
    };
  }, [isSidebarOpen]);

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
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none h-full z-[60]">
        <motion.div
          ref={topbarRef}
          initial={false}
          animate={{ 
            opacity: isSidebarOpen ? 0 : 1, 
            x: isSidebarOpen ? targetX : 0, 
            scale: isSidebarOpen ? 0.3 : 1 
          }}
          transition={{ 
            duration: 1.7, 
            ease: "easeInOut",
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
