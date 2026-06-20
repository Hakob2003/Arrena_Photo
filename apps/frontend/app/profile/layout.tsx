'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { User, Shield, Palette, Bell, Activity, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const profileTabs = [
  { id: 'personal', label: 'Personal Information', icon: User, href: '/profile/personal' },
  { id: 'security', label: 'Security & Access', icon: Shield, href: '/profile/security' },
  { id: 'appearance', label: 'Appearance', icon: Palette, href: '/profile/appearance' },
  { id: 'notifications', label: 'Notifications', icon: Bell, href: '/profile/notifications' },
  { id: 'statistics', label: 'Statistics', icon: Activity, href: '/profile/statistics' },
  { id: 'activity', label: 'Activity History', icon: Clock, href: '/profile/activity' },
];

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col md:flex-row gap-8 w-full max-w-7xl mx-auto py-8 px-4 md:px-8">
      {/* Sidebar Navigation */}
      <nav className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-4 md:pb-0 md:w-64 shrink-0 no-scrollbar">
        {profileTabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;

          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={cn(
                "relative flex items-center gap-3 px-4 py-3 rounded-xl transition-colors whitespace-nowrap",
                isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="profile-tab-active"
                  className="absolute inset-0 bg-muted/50 border border-border rounded-xl"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <Icon className="w-5 h-5 relative z-10" />
              <span className="font-medium relative z-10">{tab.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0">
        <div className="bg-muted border border-border rounded-2xl p-6 md:p-8 backdrop-blur-xl">
          {children}
        </div>
      </main>
    </div>
  );
}
