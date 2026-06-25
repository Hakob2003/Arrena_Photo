"use client";
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore, useAuthStore } from '../../store';
import { useTranslation } from '../../lib/i18n';
import { useIsMobile } from '../../hooks/useIsMobile';
import { cn } from '../../lib/utils';
import { Home, Globe, Sparkles, Folder, ShoppingCart, Image as ImageIcon, Clock, Palette, Plug, Cloud, Settings, CreditCard, Crown } from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const { isSidebarOpen, setSidebarOpen, preferences } = useUIStore();
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const isLuxury = preferences?.skin === 'LUXURY';
  const isNeon = preferences?.skin === 'NEON';
  const showSidebarLogo = isSidebarOpen;

  const MAIN_LINKS = [
    { href: '/', label: t('nav.home'), icon: <Home className="w-5 h-5" /> },
    { href: '/feed', label: t('nav.feed'), icon: <Globe className="w-5 h-5" /> },
    { href: '/generate', label: t('nav.generator'), icon: <Sparkles className="w-5 h-5" /> },
    { href: '/templates', label: t('nav.templates'), icon: <Folder className="w-5 h-5" /> },
    { href: '/marketplace', label: t('nav.marketplace'), icon: <ShoppingCart className="w-5 h-5" /> },
    { href: '/gallery', label: t('nav.gallery'), icon: <ImageIcon className="w-5 h-5" /> },
  ];

  const USER_LINKS = [
    { href: '/my-generations', label: t('nav.myGenerations'), icon: <Clock className="w-5 h-5" /> },
    { href: '/my-templates', label: t('nav.myTemplates'), icon: <Palette className="w-5 h-5" /> },
  ];

  const SETTINGS_LINKS = [
    { href: '/connections/ai', label: t('nav.aiProviders'), icon: <Plug className="w-5 h-5" /> },
    { href: '/connections/cloud', label: t('nav.cloud'), icon: <Cloud className="w-5 h-5" /> },
    { href: '/profile', label: t('nav.profile'), icon: <Settings className="w-5 h-5" /> },
    { href: '/profile/billing', label: t('nav.billing'), icon: <CreditCard className="w-5 h-5" /> },
  ];

  const renderLinks = (links: typeof MAIN_LINKS) => (
    <ul className="space-y-1">
      {links.map(link => {
        const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
        return (
          <li key={link.href}>
            <Link 
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all relative group ${
                isActive ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-[#fafafa] dark:hover:bg-white/5'
              } ${!isSidebarOpen ? 'justify-center !px-0' : ''}`}
            >
              {isActive && (
                <motion.div 
                  layoutId="sidebar-active" 
                  className={cn(
                    "absolute inset-0 rounded-lg border-l-2",
                    isLuxury ? "bg-gradient-to-r from-[#D4AF37]/10 to-transparent border-[#D4AF37]" : 
                    isNeon ? "bg-gradient-to-r from-indigo-500/20 to-transparent border-indigo-400 shadow-[inset_4px_0_15px_rgba(99,102,241,0.4)]" :
                    "bg-gradient-to-r from-indigo-500/10 dark:from-indigo-500/20 to-transparent border-indigo-500"
                  )}
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <span className={cn(
                "relative z-10 w-6 flex items-center justify-center transition-all", 
                isActive && isLuxury ? "text-[#D4AF37]" : "",
                isNeon ? (isActive ? "drop-shadow-[0_0_10px_rgba(99,102,241,0.9)]" : "drop-shadow-[0_0_4px_rgba(99,102,241,0.4)]") : ""
              )}>
                {isNeon ? (
                  <>
                    <svg style={{ width: 0, height: 0, position: 'absolute' }} aria-hidden="true" focusable="false">
                      <mask id={`icon-mask-${link.href.replace(/[^a-zA-Z0-9]/g, '-')}`}>
                        <svg width="32" height="32" viewBox="0 0 32 32">
                          <rect width="32" height="32" fill="black" />
                          <g transform="translate(6, 6)" style={{ color: "white" }} stroke="white" fill="none">
                            {React.cloneElement(link.icon as React.ReactElement, { style: { overflow: "visible" } })}
                          </g>
                        </svg>
                      </mask>
                    </svg>
                    <div 
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 pointer-events-none"
                      style={{ 
                        WebkitMask: `url(#icon-mask-${link.href.replace(/[^a-zA-Z0-9]/g, '-')})`,
                        mask: `url(#icon-mask-${link.href.replace(/[^a-zA-Z0-9]/g, '-')})`
                      }}
                    >
                      <div className="w-full h-full bg-fixed bg-gradient-to-b from-indigo-400 via-purple-400 to-cyan-400 bg-[length:100%_125%] animate-gradient-y" />
                    </div>
                    <div className="opacity-0 w-5 h-5 flex items-center justify-center">
                      {link.icon}
                    </div>
                  </>
                ) : link.icon}
              </span>
              <AnimatePresence mode="wait">
                {isSidebarOpen && (
                  <motion.span 
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className={cn(
                      "relative z-10 font-medium whitespace-nowrap overflow-hidden transition-all flex items-center",
                      isNeon ? "drop-shadow-[0_0_8px_rgba(99,102,241,0.8)]" : ""
                    )}
                  >
                    <span className={isNeon ? "bg-clip-text text-transparent bg-fixed bg-gradient-to-b from-indigo-400 via-purple-400 to-cyan-400 bg-[length:100%_125%] animate-gradient-y" : ""}>
                      {link.label}
                    </span>
                  </motion.span>
                )}
              </AnimatePresence>
              {!isSidebarOpen && !isMobile && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-[#fafafa] dark:bg-gray-800 text-slate-900 dark:text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-sm dark:shadow-none">
                  {link.label}
                </div>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-white/60 dark:bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <motion.aside 
        initial={false}
        animate={{
          x: !isMobile ? 0 : (isSidebarOpen ? 0 : '-100%'),
          width: !isMobile ? (isSidebarOpen ? 256 : 80) : 256,
        }}
        transition={{
          type: "spring",
          stiffness: 350,
          damping: 30,
          mass: 0.8
        }}
        onClick={(e) => {
          // If sidebar is closed on desktop, clicking it anywhere opens it.
          if (!isMobile && !isSidebarOpen) {
            setSidebarOpen(true);
          }
        }}
        className={cn(
          "fixed inset-y-0 left-0 z-50 border-r bg-[rgba(255,255,255,0.75)] dark:bg-black/60 backdrop-blur-xl shadow-lg dark:shadow-none flex flex-col overflow-hidden",
          !isMobile ? 'relative cursor-pointer' : '',
          isSidebarOpen ? 'cursor-default' : '',
          isLuxury ? 'border-[#D4AF37]/20' : 'border-black/10 dark:border-white/5'
        )}
      >
        <div className={`flex items-center justify-center ${isSidebarOpen ? 'p-0' : 'pt-4 pb-2 px-0 border-b border-black/10 dark:border-white/5 md:border-none'}`}>
          <div className={`flex items-center justify-center overflow-hidden relative mx-auto ${isSidebarOpen ? 'w-[130px] h-[130px] my-4' : 'w-full h-[50px]'}`}>
            <Link href="/" className="relative flex items-center hover:opacity-80 transition-opacity w-full h-full justify-center">
              
              {/* Closed State (Icon only: logo1 / logoG1) */}
              <AnimatePresence>
                {!isSidebarOpen && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    className="absolute flex justify-center w-full"
                  >
                    <img 
                      src={isLuxury ? "/logoG1.png" : "/logo1.png"} 
                      alt="Arrena Photo Icon" 
                      className="w-10 h-auto max-h-[40px] object-contain hidden dark:block" 
                    />
                    <img 
                      src={isLuxury ? "/logoG1.png" : "/logo1-light.png"} 
                      alt="Arrena Photo Icon" 
                      className="w-10 h-auto max-h-[40px] object-contain block dark:hidden" 
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Open State (Full logo: logo / logoG) */}
              <AnimatePresence>
                {isSidebarOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 flex items-center justify-center w-full h-full"
                  >
                    <img 
                      src={isLuxury ? "/logoG.png" : "/logo.png"} 
                      alt="Arrena Photo Logo" 
                      className="w-[130px] h-[130px] object-contain hidden dark:block" 
                    />
                    <img 
                      src={isLuxury ? "/logoG.png" : "/logo-light.png"} 
                      alt="Arrena Photo Logo" 
                      className="w-[130px] h-[130px] object-contain block dark:hidden" 
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              
            </Link>
          </div>
          {/* Close / Collapse button */}
          <button 
            className={`text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white p-2 transition-opacity ${!isSidebarOpen && !isMobile ? 'hidden' : 'block'}`}
            onClick={() => setSidebarOpen(false)}
          >
            {isMobile ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            )}
          </button>
        </div>

      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-8 custom-scrollbar">
        <div>
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3 h-4 whitespace-nowrap overflow-hidden text-center sm:text-left">
            {isSidebarOpen ? t('nav.sectionOverview') : "•••"}
          </p>
          {renderLinks(MAIN_LINKS)}
        </div>
        
        <div>
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3 h-4 whitespace-nowrap overflow-hidden text-center sm:text-left">
            {isSidebarOpen ? t('nav.sectionStudio') : "•••"}
          </p>
          {renderLinks(USER_LINKS)}
        </div>

        <div>
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3 h-4 whitespace-nowrap overflow-hidden text-center sm:text-left">
            {isSidebarOpen ? t('nav.sectionSettings') : "•••"}
          </p>
          {renderLinks(SETTINGS_LINKS)}
          
          {user?.role === 'ADMIN' && (
            <div className="mt-8">
              <p className={cn("text-[10px] font-semibold uppercase tracking-wider mb-3 px-3 h-4 whitespace-nowrap overflow-hidden text-center sm:text-left transition-all", 
                isLuxury ? "text-[#D4AF37]" : 
                isNeon ? "text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.8)]" : 
                "text-pink-500"
              )}>
                {isSidebarOpen ? t('nav.adminPanel') : "ADM"}
              </p>
              <ul className="space-y-1">
                <li>
                  <Link 
                    href="/admin/ai-models"
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all relative text-slate-500 hover:text-slate-900 hover:bg-[#fafafa] dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/5 group ${!isSidebarOpen ? 'justify-center !px-0' : ''}`}
                  >
                    <span className={cn(
                      "relative z-10 w-6 flex items-center justify-center transition-all", 
                      isLuxury ? "text-[#D4AF37]" : "",
                      isNeon ? "drop-shadow-[0_0_4px_rgba(99,102,241,0.4)]" : ""
                    )}>
                      {isNeon ? (
                        <>
                          <svg style={{ width: 0, height: 0, position: 'absolute' }} aria-hidden="true" focusable="false">
                            <mask id="icon-mask-admin">
                              <svg width="32" height="32" viewBox="0 0 32 32">
                                <rect width="32" height="32" fill="black" />
                                <g transform="translate(6, 6)" style={{ color: "white" }} stroke="white" fill="none">
                                  <Crown className="w-5 h-5" style={{ overflow: "visible" }} />
                                </g>
                              </svg>
                            </mask>
                          </svg>
                          <div 
                            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 pointer-events-none"
                            style={{ 
                              WebkitMask: `url(#icon-mask-admin)`,
                              mask: `url(#icon-mask-admin)`
                            }}
                          >
                            <div className="w-full h-full bg-fixed bg-gradient-to-b from-indigo-400 via-purple-400 to-cyan-400 bg-[length:100%_125%] animate-gradient-y" />
                          </div>
                          <div className="opacity-0 w-5 h-5 flex items-center justify-center">
                            <Crown className="w-5 h-5" />
                          </div>
                        </>
                      ) : <Crown className="w-5 h-5" />}
                    </span>
                    <AnimatePresence mode="wait">
                      {isSidebarOpen && (
                        <motion.span 
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          className={cn(
                            "relative z-10 font-medium whitespace-nowrap overflow-hidden transition-all flex items-center",
                            isNeon ? "drop-shadow-[0_0_8px_rgba(99,102,241,0.8)]" : ""
                          )}
                        >
                          <span className={isNeon ? "bg-clip-text text-transparent bg-fixed bg-gradient-to-b from-indigo-400 via-purple-400 to-cyan-400 bg-[length:100%_125%] animate-gradient-y" : ""}>
                            {t('nav.goToAdmin')}
                          </span>
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {!isSidebarOpen && !isMobile && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-[#fafafa] dark:bg-gray-800 text-slate-900 dark:text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-sm dark:shadow-none">
                        {t('nav.admin')}
                      </div>
                    )}
                  </Link>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
      
      {/* User Profile Section */}
      <div className={`p-4 border-t border-black/10 dark:border-white/5 mt-auto overflow-hidden ${!isSidebarOpen ? 'flex justify-center px-0' : ''}`}>
        {user ? (
          <div className={`flex items-center ${isSidebarOpen ? 'justify-between w-full' : 'justify-center w-full'}`}>
            <div className={`flex items-center ${isSidebarOpen ? 'gap-3' : 'justify-center'}`}>
              <div className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center font-bold ${
                isLuxury ? 'bg-gradient-to-tr from-[#C5A028] to-[#D4AF37] text-black' : 'bg-gradient-to-tr from-purple-500 to-indigo-500 text-white'
              }`}>
                {user.name?.charAt(0) || 'U'}
              </div>
              <AnimatePresence mode="wait">
                {isSidebarOpen && (
                  <motion.div 
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="truncate text-left whitespace-nowrap overflow-hidden"
                  >
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user.name}</p>
                    <p className="text-[10px] text-slate-500 dark:text-gray-500 truncate uppercase tracking-wider">{user.role}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <AnimatePresence mode="wait">
              {isSidebarOpen && (
                <motion.button 
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  onClick={() => {
                    useAuthStore.getState().logout();
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                  }}
                  className="p-2 text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white transition-colors shrink-0 ml-2"
                  title={t('auth.logout')}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex flex-col gap-2 w-full">
            <Link href="/login" className="w-full py-2 text-center text-sm text-slate-500 hover:text-slate-900 hover:bg-[#fafafa] dark:text-gray-300 dark:hover:text-white dark:hover:bg-white/5 rounded-lg transition-colors">{t('auth.login')}</Link>
            <Link href="/register" className={`w-full py-2 text-center text-sm font-medium rounded-lg transition-colors ${
              isLuxury ? 'bg-[#D4AF37] hover:bg-[#C5A028] text-black' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}>
              {t('auth.register')}
            </Link>
          </div>
        )}
      </div>
      </motion.aside>
    </>
  );
}
