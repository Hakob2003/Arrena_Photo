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
import { getMediaUrl } from '../../lib/api';
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

  const renderLinks = (links: any[], startIndex = 0) => (
    <ul className="space-y-1">
      {links.map((link, i) => {
        const globalIndex = startIndex + i;
        const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
        // Use globalIndex to offset the gradient, ensuring a single unified 2D gradient
        const gradientPosY = `${globalIndex * 8}%`;
        return (
          <li key={link.href}>
            <Link 
              href={isActive ? '#' : link.href}
              onClick={(e) => { if (isActive) e.preventDefault(); }}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all relative group ${
                isActive ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-[#fafafa] dark:hover:bg-white/5'
              } ${!isSidebarOpen ? 'justify-center !px-0' : ''}`}
            >
              {isActive && (
                <motion.div 
                  layoutId="sidebar-active" 
                  className={cn(
                    "absolute inset-0 rounded-lg border-l-2",
                    isLuxury ? "bg-gradient-to-r from-[#D4AF37]/5 to-transparent border-[#D4AF37]" : 
                    isNeon ? "bg-gradient-to-r from-[rgb(var(--color-accent-500)/0.05)] to-transparent border-[rgb(var(--color-accent-500))] shadow-[inset_4px_0_15px_rgb(var(--color-accent-500)/0.25)]" :
                    "bg-gradient-to-r from-[rgb(var(--color-accent-500)/0.05)] dark:from-[rgb(var(--color-accent-500)/0.1)] to-transparent border-[rgb(var(--color-accent-500))]"
                  )}
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <span className={cn(
                "relative z-10 w-6 flex items-center justify-center transition-transform duration-300 origin-center group-hover:scale-110", 
                isActive ? "scale-110" : "",
                isActive && isLuxury ? "text-[#D4AF37]" : ""
              )}>
                {(isNeon && isActive) ? (
                  <>
                    <svg style={{ width: 0, height: 0, position: 'absolute' }} aria-hidden="true" focusable="false">
                      <mask id={`icon-mask-${link.href.replace(/[^a-zA-Z0-9]/g, '-')}`}>
                        <svg width="28" height="28" viewBox="0 0 32 32" style={{ overflow: "visible" }}>
                          <rect width="32" height="32" fill="black" />
                          <g transform="translate(6, 6)" style={{ color: "white", transition: "none" }} stroke="white" fill="none">
                            {React.cloneElement(link.icon as React.ReactElement, { style: { overflow: "visible", transition: "none" } })}
                          </g>
                        </svg>
                      </mask>
                    </svg>
                    <div 
                      className={cn(
                        "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 pointer-events-none",
                        isActive ? "drop-shadow-[0_0_12px_rgb(var(--color-accent-500)/0.9)]" : ""
                      )}
                      style={{ 
                        WebkitMask: `url(#icon-mask-${link.href.replace(/[^a-zA-Z0-9]/g, '-')})`,
                        mask: `url(#icon-mask-${link.href.replace(/[^a-zA-Z0-9]/g, '-')})`,
                        transition: 'none'
                      }}
                    >
                      <div 
                        className="w-full h-full" 
                        style={{
                          backgroundImage: 'linear-gradient(135deg, rgb(var(--color-accent-400)), rgb(var(--color-accent-600)), rgb(var(--color-accent-300)))',
                          backgroundSize: '400% 1200%',
                          backgroundPosition: `0% ${gradientPosY}`
                        }}
                      />
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
                      (isNeon && isActive) ? "drop-shadow-[0_0_8px_rgba(99,102,241,0.8)]" : ""
                    )}
                  >
                    <span 
                      className={(isNeon && isActive) ? "bg-clip-text text-transparent" : ""}
                      style={(isNeon && isActive) ? {
                        backgroundImage: 'linear-gradient(135deg, rgb(var(--color-accent-400)), rgb(var(--color-accent-600)), rgb(var(--color-accent-300)))',
                        backgroundSize: '400% 1200%',
                        backgroundPosition: `20% ${gradientPosY}`
                      } : undefined}
                    >
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
      {/* Overlay to close sidebar when clicking outside */}
      {isSidebarOpen && (
        <div 
          className={cn(
            "fixed inset-0 z-40 transition-opacity",
            isMobile ? "bg-black/60 backdrop-blur-sm" : "bg-transparent"
          )}
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
        className={cn(
          "fixed inset-y-0 left-0 z-50 border-r flex flex-col overflow-hidden",
          !isMobile ? 'relative bg-transparent dark:bg-transparent backdrop-blur-none shadow-lg dark:shadow-none' : 'bg-[#fafafa] dark:bg-[#050505] shadow-2xl',
          isLuxury ? 'border-[#D4AF37]/20' : 'border-black/10 dark:border-white/5'
        )}
      >
        <div className={`flex items-center relative ${isSidebarOpen ? 'justify-center p-0' : 'justify-start pt-4 pb-2 px-1 border-b border-black/10 dark:border-white/5 md:border-none'}`}>
          <div className={`flex items-center justify-center relative ${isSidebarOpen ? (isLuxury ? 'w-[130px] h-[130px] mx-auto my-4' : 'w-[160px] h-[60px] mx-auto my-2') : 'w-8 h-8 ml-3'}`}>
            <Link 
              href="/" 
              className="relative flex items-center hover:opacity-80 transition-opacity w-full h-full justify-center"
              onClick={(e) => {
                if (!isMobile && !isSidebarOpen) {
                  e.preventDefault();
                  setSidebarOpen(true);
                }
              }}
            >
              
              <AnimatePresence>
                {!isSidebarOpen && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    className="absolute flex justify-center w-full cursor-pointer"
                  >
                    {isNeon ? (
                      <div 
                        className="w-8 h-8 hidden dark:block relative animate-pulse-glow"
                        style={{
                          WebkitMask: `url(/logo1.png) no-repeat center / contain`,
                          mask: `url(/logo1.png) no-repeat center / contain`
                        }}
                      >
                        <div className="absolute inset-0 logo-shimmer" />
                      </div>
                    ) : (
                      <img 
                        src={isLuxury ? "/logoG1.png" : "/logo1.png"} 
                        alt="Arrena Photo Icon" 
                        className="w-8 h-8 object-contain hidden dark:block" 
                      />
                    )}
                    <img 
                      src={isLuxury ? "/logoG1.png" : "/logo1-light.png"} 
                      alt="Arrena Photo Icon" 
                      className="w-8 h-8 object-contain block dark:hidden" 
                    />
                  </motion.div>
                )}
                {isSidebarOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 flex items-center justify-center w-full h-full cursor-pointer"
                  >
                    {isNeon ? (
                      <div 
                        className={cn("hidden dark:block relative animate-pulse-glow", isLuxury ? "w-[130px] h-[130px]" : "w-[160px] h-[60px]")}
                        style={{
                          WebkitMask: `url(/logo.png) no-repeat center / contain`,
                          mask: `url(/logo.png) no-repeat center / contain`
                        }}
                      >
                        <div className="absolute inset-0 logo-shimmer" />
                      </div>
                    ) : (
                      <img 
                        src={isLuxury ? "/logoG.png" : "/logo.png"} 
                        alt="Arrena Photo Logo" 
                        className={cn("object-contain hidden dark:block", isLuxury ? "w-[130px] h-[130px]" : "w-[160px] h-[60px]")}
                      />
                    )}
                    <img 
                      src={isLuxury ? "/logoG.png" : "/logo-light.png"} 
                      alt="Arrena Photo Logo" 
                      className={cn("object-contain block dark:hidden", isLuxury ? "w-[130px] h-[130px]" : "w-[160px] h-[60px]")}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              
            </Link>
          </div>
          <button 
            className={`text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white transition-opacity ${!isMobile ? 'block' : (isSidebarOpen ? 'block' : 'hidden')} ${isSidebarOpen ? 'p-2' : 'absolute right-2 p-1'}`}
            onClick={() => setSidebarOpen(!isSidebarOpen)}
          >
            {isMobile ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ transform: isSidebarOpen ? 'rotate(0)' : 'rotate(180deg)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            )}
          </button>
        </div>

      <div className={`flex-1 overflow-y-auto overflow-x-hidden py-6 flex flex-col gap-8 ${isSidebarOpen ? 'custom-scrollbar px-3' : 'scrollbar-hide px-1'}`}>
        <div>
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3 h-4 whitespace-nowrap overflow-hidden text-center sm:text-left">
            {isSidebarOpen ? t('nav.sectionOverview') : "•••"}
          </p>
          {renderLinks(MAIN_LINKS, 0)}
        </div>
        
        <div>
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3 h-4 whitespace-nowrap overflow-hidden text-center sm:text-left">
            {isSidebarOpen ? t('nav.sectionStudio') : "•••"}
          </p>
          {renderLinks(USER_LINKS, MAIN_LINKS.length)}
        </div>

        <div>
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3 h-4 whitespace-nowrap overflow-hidden text-center sm:text-left">
            {isSidebarOpen ? t('nav.sectionSettings') : "•••"}
          </p>
          {renderLinks(SETTINGS_LINKS, MAIN_LINKS.length + USER_LINKS.length)}
          
          {user?.role === 'ADMIN' && (() => {
            const isAdminActive = pathname.startsWith('/admin');
            return (
              <div className="mt-8">
                <p className={cn("text-[10px] font-semibold uppercase tracking-wider mb-3 px-3 h-4 whitespace-nowrap overflow-hidden text-center sm:text-left transition-all", 
                  isLuxury ? "text-[#D4AF37]" : 
                  isNeon ? "text-[rgb(var(--color-accent-400))] drop-shadow-[0_0_8px_rgb(var(--color-accent-500)/0.8)]" : 
                  "text-pink-500"
                )}>
                  {isSidebarOpen ? t('nav.adminPanel') : "ADM"}
                </p>
                <ul className="space-y-1">
                  <li>
                    <Link 
                      href="/admin/ai-models"
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all relative text-slate-500 hover:text-slate-900 hover:bg-[#fafafa] dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/5 group ${!isSidebarOpen ? 'justify-center !px-0' : ''} ${isAdminActive ? 'text-slate-900 dark:text-white' : ''}`}
                    >
                      {isAdminActive && (
                        <motion.div 
                          layoutId="sidebar-active" 
                          className={cn(
                            "absolute inset-0 rounded-lg border-l-2",
                            isLuxury ? "bg-gradient-to-r from-[#D4AF37]/5 to-transparent border-[#D4AF37]" : 
                            isNeon ? "bg-gradient-to-r from-[rgb(var(--color-accent-500)/0.05)] to-transparent border-[rgb(var(--color-accent-500))] shadow-[inset_4px_0_15px_rgb(var(--color-accent-500)/0.25)]" :
                            "bg-gradient-to-r from-[rgb(var(--color-accent-500)/0.05)] dark:from-[rgb(var(--color-accent-500)/0.1)] to-transparent border-[rgb(var(--color-accent-500))]"
                          )}
                          transition={{ type: "spring", stiffness: 350, damping: 30 }}
                        />
                      )}
                      <span className={cn(
                        "relative z-10 w-6 flex items-center justify-center transition-all",
                        isAdminActive && isLuxury ? "text-[#D4AF37]" : "",
                        (isNeon && isAdminActive) ? "drop-shadow-[0_0_12px_rgb(var(--color-accent-500)/0.9)]" : ""
                      )}>
                        {(isNeon && isAdminActive) ? (
                          <>
                            <svg style={{ width: 0, height: 0, position: 'absolute' }} aria-hidden="true" focusable="false">
                              <mask id="icon-mask-admin">
                                <svg width="28" height="28" viewBox="0 0 32 32" style={{ overflow: "visible" }}>
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
                              <div 
                                className="w-full h-full" 
                                style={{
                                  backgroundImage: 'linear-gradient(135deg, #818cf8, #c084fc, #22d3ee)',
                                  backgroundSize: '400% 1200%',
                                  backgroundPosition: `0% ${(MAIN_LINKS.length + USER_LINKS.length + SETTINGS_LINKS.length) * 8}%`
                                }}
                              />
                            </div>
                            <div className="opacity-0 w-5 h-5 flex items-center justify-center">
                              <Crown className="w-5 h-5" />
                            </div>
                          </>
                        ) : (
                          <Crown className="w-5 h-5" />
                        )}
                      </span>
                    <AnimatePresence mode="wait">
                      {isSidebarOpen && (
                        <motion.span 
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          className={cn(
                            "relative z-10 font-medium whitespace-nowrap overflow-hidden transition-all flex items-center",
                            (isNeon && isAdminActive) ? "drop-shadow-[0_0_8px_rgba(99,102,241,0.8)]" : ""
                          )}
                        >
                          <span 
                            className={(isNeon && isAdminActive) ? "bg-clip-text text-transparent" : ""}
                            style={(isNeon && isAdminActive) ? {
                              backgroundImage: 'linear-gradient(135deg, #818cf8, #c084fc, #22d3ee)',
                              backgroundSize: '400% 1200%',
                              backgroundPosition: `20% ${(MAIN_LINKS.length + USER_LINKS.length + SETTINGS_LINKS.length) * 8}%`
                            } : undefined}
                          >
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
            );
          })()}
        </div>
      </div>
      
      {/* User Profile Section */}
      <div className={`p-4 border-t border-black/10 dark:border-white/5 mt-auto overflow-hidden ${!isSidebarOpen ? 'flex justify-center px-0' : ''}`}>
        {user ? (
          <div className={`flex items-center ${isSidebarOpen ? 'justify-between w-full' : 'justify-center w-full'}`}>
            <Link href="/profile" className={`flex items-center ${isSidebarOpen ? 'gap-3' : 'justify-center'} cursor-pointer hover:opacity-80 transition-opacity`}>
              <div className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center font-bold overflow-hidden ${
                isLuxury ? 'bg-gradient-to-tr from-[#C5A028] to-[#D4AF37] text-black' : 'bg-gradient-to-tr from-purple-500 to-indigo-500 text-white'
              }`}>
                {user.image ? (
                  <img src={getMediaUrl(user.image)} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  user.name?.charAt(0) || 'U'
                )}
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
            </Link>
            
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
