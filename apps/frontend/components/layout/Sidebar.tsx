"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useUIStore } from '../../store';

const MAIN_LINKS = [
  { href: '/', label: 'Home', icon: '🏠' },
  { href: '/generate', label: 'Generator', icon: '✨' },
  { href: '/templates', label: 'Templates', icon: '📁' },
  { href: '/marketplace', label: 'Marketplace', icon: '🛒' },
  { href: '/gallery', label: 'Gallery', icon: '🖼️' },
];

const USER_LINKS = [
  { href: '/my-generations', label: 'My Generations', icon: '⏱️' },
  { href: '/my-templates', label: 'My Templates', icon: '🎨' },
];

const SETTINGS_LINKS = [
  { href: '/connections/ai', label: 'AI Connections', icon: '🔌' },
  { href: '/connections/cloud', label: 'Cloud Storage', icon: '☁️' },
  { href: '/profile', label: 'Profile & Billing', icon: '⚙️' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isSidebarOpen, setSidebarOpen } = useUIStore();

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

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 border-r border-white/5 bg-black/60 backdrop-blur-xl flex flex-col
        transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-2 font-black text-2xl tracking-tighter neon-text">
            <span>ARRENA_PHOTO</span>
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
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">Discover</p>
          {renderLinks(MAIN_LINKS)}
        </div>
        
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">Studio</p>
          {renderLinks(USER_LINKS)}
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">Settings</p>
          {renderLinks(SETTINGS_LINKS)}
        </div>
      </div>
      </aside>
    </>
  );
}
