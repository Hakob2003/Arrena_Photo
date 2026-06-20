"use client";
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore, useAuthStore } from '../../store';
import { useIsMobile } from '../../hooks/useIsMobile';

const MAIN_LINKS = [
  { href: '/', label: 'Главная', icon: '🏠' },
  { href: '/generate', label: 'Генератор', icon: '✨' },
  { href: '/templates', label: 'Шаблоны', icon: '📁' },
  { href: '/marketplace', label: 'Маркетплейс', icon: '🛒' },
  { href: '/gallery', label: 'Галерея', icon: '🖼️' },
];

const USER_LINKS = [
  { href: '/my-generations', label: 'Мои генерации', icon: '⏱️' },
  { href: '/my-templates', label: 'Мои шаблоны', icon: '🎨' },
];

const SETTINGS_LINKS = [
  { href: '/connections/ai', label: 'AI Провайдеры', icon: '🔌' },
  { href: '/connections/cloud', label: 'Облако', icon: '☁️' },
  { href: '/profile', label: 'Профиль и Баланс', icon: '⚙️' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isSidebarOpen, setSidebarOpen } = useUIStore();
  const { user } = useAuthStore();
  const isMobile = useIsMobile();
  const showSidebarLogo = isSidebarOpen;

  const renderLinks = (links: typeof MAIN_LINKS) => (
    <ul className="space-y-1">
      {links.map(link => {
        const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
        return (
          <li key={link.href}>
            <Link 
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all relative group ${
                isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {isActive && (
                <motion.div 
                  layoutId="sidebar-active" 
                  className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-transparent rounded-lg border-l-2 border-indigo-500"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <span className="relative z-10 text-xl w-6 flex items-center justify-center">{link.icon}</span>
              <AnimatePresence mode="wait">
                {isSidebarOpen && (
                  <motion.span 
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="relative z-10 font-medium whitespace-nowrap overflow-hidden"
                  >
                    {link.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {!isSidebarOpen && !isMobile && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-muted text-foreground text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
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
          className="fixed inset-0 bg-background/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
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
        className={`
          fixed inset-y-0 left-0 z-50 border-r border-border bg-background/60 backdrop-blur-xl flex flex-col overflow-hidden
          ${!isMobile ? 'relative cursor-pointer' : ''}
          ${isSidebarOpen ? 'cursor-default' : ''}
        `}
      >
        <div className="p-4 flex items-center justify-between border-b border-border md:border-none">
          <div className="flex items-center justify-center w-full h-[80px] overflow-hidden">
            <AnimatePresence mode="wait">
              {isSidebarOpen ? (
                <motion.div
                  key="full-logo"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="w-full flex justify-center px-4"
                >
                  <Link href="/" className="hover:opacity-80 transition-opacity w-full flex justify-center">
                    <img 
                      src="/logo-dark.png" 
                      alt="Arrena Photo Logo" 
                      className="hidden dark:block w-48 h-auto max-h-[60px] object-contain" 
                    />
                    <img 
                      src="/logo-light.png" 
                      alt="Arrena Photo Logo" 
                      className="block dark:hidden w-48 h-auto max-h-[60px] object-contain" 
                    />
                  </Link>
                </motion.div>
              ) : (
                <motion.div
                  key="icon-logo"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className="w-full flex justify-center"
                >
                  <Link href="/" className="hover:opacity-80 transition-opacity">
                    <img 
                      src="/logo1-dark.png" 
                      alt="Arrena Photo Icon" 
                      className="hidden dark:block w-10 h-auto max-h-[40px] object-contain" 
                    />
                    <img 
                      src="/logo1-light.png" 
                      alt="Arrena Photo Icon" 
                      className="block dark:hidden w-10 h-auto max-h-[40px] object-contain" 
                    />
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {/* Close / Collapse button */}
          <button 
            className={`text-muted-foreground hover:text-foreground p-2 transition-opacity ${!isSidebarOpen && !isMobile ? 'hidden' : 'block'}`}
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
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3 h-4 whitespace-nowrap overflow-hidden text-center sm:text-left">
            {isSidebarOpen ? "Обзор" : "•••"}
          </p>
          {renderLinks(MAIN_LINKS)}
        </div>
        
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3 h-4 whitespace-nowrap overflow-hidden text-center sm:text-left">
            {isSidebarOpen ? "Студия" : "•••"}
          </p>
          {renderLinks(USER_LINKS)}
        </div>

        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3 h-4 whitespace-nowrap overflow-hidden text-center sm:text-left">
            {isSidebarOpen ? "Настройки" : "•••"}
          </p>
          {renderLinks(SETTINGS_LINKS)}
          
          {user?.role === 'ADMIN' && (
            <div className="mt-8">
              <p className="text-[10px] font-semibold text-pink-500 uppercase tracking-wider mb-3 px-3 h-4 whitespace-nowrap overflow-hidden text-center sm:text-left">
                {isSidebarOpen ? "Админ Панель" : "ADM"}
              </p>
              <ul className="space-y-1">
                <li>
                  <Link 
                    href="/admin/ai-models"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all relative text-muted-foreground hover:text-foreground hover:bg-muted group"
                  >
                    <span className="relative z-10 text-xl w-6 flex justify-center">👑</span>
                    <AnimatePresence mode="wait">
                      {isSidebarOpen && (
                        <motion.span 
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          className="relative z-10 font-medium whitespace-nowrap overflow-hidden"
                        >
                          Перейти в Админку
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {!isSidebarOpen && !isMobile && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-muted text-foreground text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                        Админка
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
      <div className="p-4 border-t border-border mt-auto overflow-hidden">
        {user ? (
          <div className={`flex items-center ${isSidebarOpen ? 'justify-between' : 'justify-center'}`}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 shrink-0 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-foreground font-bold">
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
                    <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate uppercase tracking-wider">{user.role}</p>
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
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors shrink-0 ml-2"
                  title="Выйти"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Link href="/login" className="w-full py-2 text-center text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">Войти</Link>
            <Link href="/register" className="w-full py-2 text-center bg-indigo-600 hover:bg-indigo-700 text-foreground text-sm font-medium rounded-lg transition-colors">
              Регистрация
            </Link>
          </div>
        )}
      </div>
      </motion.aside>
    </>
  );
}
