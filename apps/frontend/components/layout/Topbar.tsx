"use client";
import { useState, useEffect, useRef } from 'react';
import { useAuthStore, useUIStore } from '../../store';
import { useTranslation } from '../../lib/i18n';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '../../hooks/useIsMobile';
import { cn } from '../../lib/utils';

export function Topbar() {
  const { user, credits } = useAuthStore();
  const { isSidebarOpen, setSidebarOpen, locale, setLocale, preferences } = useUIStore();
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const isLuxury = preferences.skin === 'LUXURY';
  const isNeon = preferences.skin === 'NEON';
  const showTopbarLogo = !isSidebarOpen;

  // We no longer need manual targetX calculation, we will use Framer Motion layout animations.
  useEffect(() => {
    // keeping empty for any future resize logic
  }, [isSidebarOpen]);

  const toggleLocale = () => {
    setLocale(locale === 'ru' ? 'en' : 'ru');
  };

  return (
    <header className={`h-16 border-b bg-white/5 dark:bg-black/5 backdrop-blur-none flex items-center justify-between px-4 sm:px-6 sticky top-0 z-[60] shadow-sm dark:shadow-none ${isLuxury ? 'border-[#D4AF37]/20' : 'border-black/10 dark:border-white/5'}`}>
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
        <div className={`absolute pointer-events-none h-full z-[60] flex items-center transition-all duration-500 ease-in-out ${
          isSidebarOpen 
            ? "left-4 md:left-8 justify-start translate-x-0" 
            : "left-12 md:left-1/2 justify-start md:justify-center md:-translate-x-1/2"
        }`}>
          <motion.div
            layout
            initial={false}
            animate={{ 
              opacity: isSidebarOpen ? 0 : 1, 
              scale: isSidebarOpen ? 0.8 : 1 
            }}
            transition={{ 
              layout: { duration: 0.5, ease: "easeInOut" },
              opacity: { duration: 0.3 },
              scale: { duration: 0.4 }
            }}
          >
            <Link href="/" className={`flex items-center hover:opacity-80 transition-opacity ${isSidebarOpen && isMobile ? 'pointer-events-none' : 'pointer-events-auto'}`}>
              {isNeon ? (
                <div 
                  className="h-[18px] sm:h-7 w-24 object-contain hidden dark:block logo-shimmer"
                  style={{
                    WebkitMask: `url(/logo2.png) no-repeat center / contain`,
                    mask: `url(/logo2.png) no-repeat center / contain`
                  }}
                />
              ) : (
                <img 
                  src={isLuxury ? "/logoG2.png" : "/logo2.png"} 
                  alt="Arrena Photo Text" 
                  className="h-[18px] sm:h-7 w-auto object-contain hidden dark:block" 
                />
              )}
              <img 
                src={isLuxury ? "/logoG2.png" : "/logo2-light.png"} 
                alt="Arrena Photo Text" 
                className="h-[18px] sm:h-7 w-auto object-contain block dark:hidden" 
              />
            </Link>
          </motion.div>
        </div>
      ) : (
        <div className="flex items-center pointer-events-auto z-[60]">
          <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
            {isNeon ? (
              <div 
                className="h-6 sm:h-8 w-32 object-contain hidden dark:block logo-shimmer"
                style={{
                  WebkitMask: `url(/logo.png) no-repeat center / contain`,
                  mask: `url(/logo.png) no-repeat center / contain`
                }}
              />
            ) : (
              <img 
                src={isLuxury ? "/logoG.png" : "/logo.png"} 
                alt="Arrena Photo Logo" 
                className="h-6 sm:h-8 w-auto object-contain hidden dark:block" 
              />
            )}
            <img 
              src={isLuxury ? "/logoG.png" : "/logo-light.png"} 
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
            className="flex items-center justify-center bg-black/[0.05] dark:bg-white/10 border border-black/10 dark:border-white/10 w-7 h-7 sm:w-8 sm:h-8 rounded-full hover:bg-black/10 dark:hover:bg-white/5 transition-colors shrink-0"
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
          className={cn(
            "flex items-center gap-1.5 bg-black/[0.05] border px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full transition-colors",
            isLuxury 
              ? "dark:bg-black/5 border-black/10 dark:border-[#D4AF37]/20 hover:bg-black/10 dark:hover:border-[#D4AF37]/50" 
              : "dark:bg-white/10 border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/5"
          )}
          title={locale === 'ru' ? 'Switch to English' : 'Переключить на русский'}
        >
          <span className={`text-xs sm:text-sm font-bold transition-colors ${locale === 'ru' ? (isLuxury ? 'text-[#D4AF37]' : 'text-indigo-600 dark:text-indigo-400') : 'text-slate-400 dark:text-gray-500'}`}>RU</span>
          <span className="text-slate-300 dark:text-gray-600 text-xs">/</span>
          <span className={`text-xs sm:text-sm font-bold transition-colors ${locale === 'en' ? (isLuxury ? 'text-[#D4AF37]' : 'text-indigo-600 dark:text-indigo-400') : 'text-slate-400 dark:text-gray-500'}`}>EN</span>
        </button>

        {user ? (
          /* Credits Pill */
          <Link href="/profile/billing" className={cn(
            "flex items-center gap-1 sm:gap-2 border px-2 sm:px-3 py-1 sm:py-1.5 rounded-full transition-all hover:scale-105 cursor-pointer",
            isLuxury 
              ? "bg-[#D4AF37]/10 border-[#D4AF37]/20 hover:bg-[#D4AF37]/20" 
              : "bg-indigo-500/10 border-indigo-500/20 hover:bg-indigo-500/20"
          )}>
            <span className={cn("text-xs sm:text-sm font-bold", isLuxury ? "text-[#D4AF37]" : "text-indigo-600 dark:text-indigo-400")}>⚡ {credits?.toLocaleString('en-US') || 0}</span>
            <span className={cn("text-[10px] sm:text-xs uppercase hidden sm:inline", isLuxury ? "text-[#D4AF37]/70" : "text-indigo-500/70 dark:text-indigo-300/70")}>{t('auth.credits')}</span>
          </Link>
        ) : (
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-gray-300 dark:hover:text-white transition-colors">
              {t('auth.login')}
            </Link>
            <Link href="/register" className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
              isLuxury ? 'bg-[#D4AF37] hover:bg-[#C5A028] text-black' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}>
              {t('auth.register')}
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
