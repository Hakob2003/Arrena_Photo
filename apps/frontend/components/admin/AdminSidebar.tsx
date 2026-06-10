"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

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
    { name: 'AI Providers', href: '/admin/ai-providers', icon: '🤖' },
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

  return (
    <aside className="w-64 h-full bg-[#0a0a0a] border-r border-white/5 flex flex-col text-sm">
      {/* Brand Header */}
      <div className="h-14 flex items-center px-6 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-white text-black rounded flex items-center justify-center font-bold text-xs">
            ▲
          </div>
          <span className="font-semibold text-white tracking-tight">Vercel Style Admin</span>
        </div>
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
          <span>⬅️</span>
          <span>Back to App</span>
        </Link>
      </div>
    </aside>
  );
}
