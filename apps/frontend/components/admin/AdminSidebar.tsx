"use client";
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useUIStore } from '../../store';

const ADMIN_LINKS = [
  { section: 'Overview', items: [
    { name: 'Dashboard', href: '/admin', icon: '📊' },
    { name: 'Analytics', href: '/admin/analytics', icon: '📈' },
  ]},
  { section: 'Management', items: [
    { name: 'Users', href: '/admin/users', icon: '👥' },
    { name: 'Templates', href: '/admin/templates', icon: '🎨' },
    { name: 'Marketplace', href: '/admin/marketplace', icon: '🛒' },
    { name: 'Generations', href: '/admin/generations', icon: '⚡' },
  ]},
  { section: 'Configuration', items: [
    { name: 'AI Models', href: '/admin/ai-models', icon: '🧠' },
    { name: 'AI Providers', href: '/admin/ai-providers', icon: '🤖' },
    { name: 'API Keys', href: '/admin/api-keys', icon: '🔑' },
    { name: 'Cloud Storage', href: '/admin/cloud', icon: '☁️' },
    { name: 'Billing', href: '/admin/billing', icon: '💳' },
  ]},
  { section: 'System', items: [
    { name: 'Audit Logs', href: '/admin/audit-logs', icon: '📋' },
    { name: 'Settings', href: '/admin/settings', icon: '⚙️' },
  ]}
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { isSidebarOpen, setSidebarOpen } = useUIStore();

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
        fixed inset-y-0 left-0 z-50 w-64 bg-[#0a0a0a] border-r border-white/5 flex flex-col text-sm
        transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
      {/* Brand Header */}
      <div className="py-4 flex items-center justify-between px-6 border-b border-white/5">
        <div className="flex items-center gap-2 w-full">
          <Image src="/logo.png" alt="Arrena Photo" width={600} height={200} className="w-40 h-auto object-contain" priority />
          <span className="font-semibold text-pink-500 tracking-tight text-[10px] uppercase bg-pink-500/10 px-1.5 py-0.5 rounded shrink-0">Admin</span>
        </div>
        <button 
          className="md:hidden text-gray-400 hover:text-white p-2"
          onClick={() => setSidebarOpen(false)}
        >
          ✕
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 custom-scrollbar">
        {ADMIN_LINKS.map((group, i) => (
          <div key={i}>
            <h4 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              {group.section}
            </h4>
            <div className="space-y-0.5">
              {group.items.map(link => {
                const isActive = pathname === link.href;
                return (
                  <Link 
                    key={link.href} 
                    href={link.href}
                    className={`flex items-center gap-3 px-3 py-1.5 rounded-md transition-colors ${
                      isActive 
                        ? 'bg-white/10 text-white font-medium' 
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className="text-base">{link.icon}</span>
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User Section */}
      <div className="p-4 border-t border-white/5">
        <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors p-2 rounded-md hover:bg-white/5">
          <span className="text-lg">⬅️</span>
          <span className="font-medium">Вернуться в приложение</span>
        </Link>
      </div>
      </aside>
    </>
  );
}
