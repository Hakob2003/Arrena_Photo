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
  const showSidebarLogo = !isMobile || isSidebarOpen;

  const renderLinks = (links: typeof MAIN_LINKS) => (
    <ul className="space-y-1">
      {links.map(link => {
        const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
        return (
          <li key={link.href}>
            <Link 
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all relative ${
                isActive ? 'text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {isActive && (
                <motion.div 
                  layoutId="sidebar-active" 
                  className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-transparent rounded-lg border-l-2 border-indigo-500"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10 text-lg">{link.icon}</span>
              <span className="relative z-10 font-medium">{link.label}</span>
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
          fixed inset-y-0 left-0 z-50 w-64 border-r border-white/5 bg-black/60 backdrop-blur-xl flex flex-col
          ${!isMobile ? 'relative' : ''}
        `}
      >
        <div className="p-4 flex items-center justify-between border-b border-white/5 md:border-none">
          <div className="flex items-center gap-2 w-full h-[80px]">
            <AnimatePresence>
              {showSidebarLogo && (
                <Link href="/" className="flex items-center hover:opacity-80 transition-opacity w-full">
                  <motion.img 
                    layoutId="app-logo"
                    src="/logo.png" 
                    alt="Arrena Photo Logo" 
                    className="w-52 h-auto object-contain" 
                  />
                </Link>
              )}
            </AnimatePresence>
          </div>
          {/* Mobile close button (optional but good for UX) */}
          <button 
            className="md:hidden text-gray-400 hover:text-white p-2"
            onClick={() => setSidebarOpen(false)}
          >
            ✕
          </button>
        </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-8">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">Обзор</p>
          {renderLinks(MAIN_LINKS)}
        </div>
        
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">Студия</p>
          {renderLinks(USER_LINKS)}
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">Настройки</p>
          {renderLinks(SETTINGS_LINKS)}
          
          {user?.role === 'ADMIN' && (
            <div className="mt-8">
              <p className="text-xs font-semibold text-pink-500 uppercase tracking-wider mb-3 px-3">Админ Панель</p>
              <ul className="space-y-1">
                <li>
                  <Link 
                    href="/admin/ai-models"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all relative text-gray-400 hover:text-white hover:bg-white/5"
                  >
                    <span className="relative z-10 text-lg">👑</span>
                    <span className="relative z-10 font-medium">Перейти в Админку</span>
                  </Link>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
      
      {/* User Profile Section */}
      <div className="p-4 border-t border-white/5 mt-auto">
        {user ? (
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
              onClick={() => {
                useAuthStore.getState().logout();
                localStorage.removeItem('token');
                window.location.href = '/login';
              }}
              className="p-2 text-gray-400 hover:text-white transition-colors ml-2"
              title="Выйти"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Link href="/login" className="w-full py-2 text-center text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors">Войти</Link>
            <Link href="/register" className="w-full py-2 text-center bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors">
              Регистрация
            </Link>
          </div>
        )}
      </div>
      </motion.aside>
    </>
  );
}
