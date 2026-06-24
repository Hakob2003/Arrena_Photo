"use client";
import { useState, useEffect, useRef } from 'react';
import { useAuthStore, useUIStore } from '../../store';
import { useTranslation } from '../../lib/i18n';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '../../hooks/useIsMobile';

export function Topbar() {
  const { user, credits } = useAuthStore();
  const { isSidebarOpen, setSidebarOpen, locale, setLocale } = useUIStore();
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const showTopbarLogo = !isSidebarOpen;

  // We use a ref on the static wrapper to get the true absolute center on screen without feedback loops!
  const topbarWrapperRef = useRef<HTMLDivElement>(null);
  const topbarRef = useRef<HTMLDivElement>(null);

  const [targetX, setTargetX] = useState(0);

  useEffect(() => {
    const calc = () => {
      // The user wants the logo to reach the LEFT EDGE of the Topbar.
      const isMobileLocal = window.innerWidth < 768;
      
      // On desktop, the Topbar starts at 256px. On mobile, it starts at 0px.
      const topbarLeftEdge = isMobileLocal ? 0 : 256;
      
      // Topbar center when open
      const openTopbarCenterX = isMobileLocal 
        ? window.innerWidth / 2 
        : 256 + (window.innerWidth - 256) / 2;
      
      const targetDelta = topbarLeftEdge - openTopbarCenterX;
      setTargetX(targetDelta);
    };

    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, [isSidebarOpen]);

  const toggleLocale = () => {
    setLocale(locale === 'ru' ? 'en' : 'ru');
  };

  return (
    <header className="h-16 border-b border-black/10 dark:border-white/5 bg-[rgba(255,255,255,0.75)] dark:bg-black/20 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 sticky top-0 z-[60] shadow-sm dark:shadow-none">
      <div className="flex items-center gap-2 md:hidden">
        {user && (
          <button 
            className="p-2 -ml-2 text-slate-900 dark:text-white hover:text-slate-500 dark:hover:text-gray-300"
            onClick={() => setSidebarOpen(true)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
      </div>

      {/* Topbar Logo Text */}
      {user ? (
        <div ref={topbarWrapperRef} className="absolute left-12 md:left-1/2 md:-translate-x-1/2 flex items-center justify-start md:justify-center pointer-events-none h-full z-[60]">
          <motion.div
            layout
            ref={topbarRef}
            initial={false}
            animate={{ 
              opacity: (isSidebarOpen && isMobile) ? 0 : 1, 
              x: (isSidebarOpen && !isMobile) ? targetX : 0, 
              scale: (isSidebarOpen && isMobile) ? 0.1 : 1 
            }}
            transition={{ 
              layout: { duration: 1.7, ease: "easeInOut" },
              x: { duration: 1.7, ease: "easeInOut" },
              scale: { duration: 1.7, ease: "easeInOut" },
              opacity: { delay: (isSidebarOpen && isMobile) ? 1.5 : 0, duration: 0.2 } 
            }}
          >
            <Link href="/" className={`flex items-center hover:opacity-80 transition-opacity ${isSidebarOpen ? 'pointer-events-none' : 'pointer-events-auto'}`}>
              <img 
                src={isMobile ? "/logo.png" : "/logo2.png"} 
                alt="Arrena Photo Text" 
                className="h-5 sm:h-6 w-auto object-contain hidden dark:block" 
              />
              <img 
                src={isMobile ? "/logo-light.png" : "/logo2-light.png"} 
                alt="Arrena Photo Text" 
                className="h-5 sm:h-6 w-auto object-contain block dark:hidden" 
              />
            </Link>
          </motion.div>
        </div>
      ) : (
        <div className="flex items-center pointer-events-auto z-[60]">
          <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
            <img 
              src="/logo.png" 
              alt="Arrena Photo Logo" 
              className="h-6 sm:h-8 w-auto object-contain hidden dark:block" 
            />
            <img 
              src="/logo-light.png" 
              alt="Arrena Photo Logo" 
              className="h-6 sm:h-8 w-auto object-contain block dark:hidden" 
            />
          </Link>
        </div>
      )}

      {/* Search Bar Removed Temporarily */}
      <div className="flex-1 max-w-xl hidden md:block"></div>

      <div className="flex items-center gap-2 sm:gap-4 md:gap-6 ml-auto">
        {/* Help Button (Mobile Only) */}
        {isMobile && user && (
          <button
            onClick={() => useUIStore.getState().setShowSwipeHints(true)}
            className="flex items-center justify-center bg-black/[0.05] dark:bg-white/10 border border-black/10 dark:border-white/10 w-7 h-7 sm:w-8 sm:h-8 rounded-full hover:bg-black/10 dark:hover:bg-white/20 transition-colors shrink-0"
            title="Подсказки жестов"
          >
            <svg className="w-4 h-4 text-slate-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        )}

        {/* Language Toggle */}
        <button
          onClick={toggleLocale}
          className="flex items-center gap-1.5 bg-black/[0.05] dark:bg-white/10 border border-black/10 dark:border-white/10 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
          title={locale === 'ru' ? 'Switch to English' : 'Переключить на русский'}
        >
          <span className={`text-xs sm:text-sm font-bold transition-colors ${locale === 'ru' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-gray-500'}`}>RU</span>
          <span className="text-slate-300 dark:text-gray-600 text-xs">/</span>
          <span className={`text-xs sm:text-sm font-bold transition-colors ${locale === 'en' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-gray-500'}`}>EN</span>
        </button>

        {user ? (
          /* Credits Pill */
          <div className="flex items-center gap-1 sm:gap-2 bg-indigo-500/10 border border-indigo-500/20 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full">
            <span className="text-indigo-600 dark:text-indigo-400 text-xs sm:text-sm font-bold">⚡ {credits?.toLocaleString('en-US') || 0}</span>
            <span className="text-[10px] sm:text-xs text-indigo-500/70 dark:text-indigo-300/70 uppercase hidden sm:inline">{t('auth.credits')}</span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-gray-300 dark:hover:text-white transition-colors">
              {t('auth.login')}
            </Link>
            <Link href="/register" className="text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors">
              {t('auth.register')}
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
