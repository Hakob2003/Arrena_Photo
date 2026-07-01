'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { User, Shield, Palette, Bell, Activity, Clock, CreditCard, BarChart2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '../../store';
import { useTranslation } from '../../lib/i18n';
import { useEffect } from 'react';

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuthStore();
  const { t } = useTranslation();

  const profileTabs = [
    { id: 'personal', label: t('profile.personal'), icon: User, href: '/profile/personal' },
    { id: 'security', label: t('profile.security'), icon: Shield, href: '/profile/security' },
    { id: 'appearance', label: t('profile.appearance'), icon: Palette, href: '/profile/appearance' },
    { id: 'billing', label: t('profile.billing'), icon: CreditCard, href: '/profile/billing' },
    { id: 'notifications', label: t('profile.notifications'), icon: Bell, href: '/profile/notifications' },
    { id: 'statistics', label: t('profile.statistics'), icon: BarChart2, href: '/profile/statistics' },
    { id: 'activity', label: t('profile.activity'), icon: Clock, href: '/profile/activity' },
  ];

  useEffect(() => {
    if (!user) {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
      }
    }
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="flex flex-col md:flex-row gap-8 w-full max-w-7xl mx-auto py-8 px-4 md:px-8">
      {/* Sidebar Navigation */}
      <nav className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-4 md:pb-0 md:w-64 shrink-0 no-scrollbar md:sticky md:top-8 md:h-fit">
        {profileTabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;

          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={cn(
                "relative flex items-center gap-3 px-4 py-3 rounded-xl transition-colors whitespace-nowrap md:whitespace-normal",
                isActive ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-200 hover:bg-black/[0.03] dark:hover:bg-white/5"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="profile-tab-active"
                  className="absolute inset-0 bg-black/[0.05] dark:bg-white/10 border border-black/20 dark:border-white/20 rounded-xl"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <Icon className="w-5 h-5 relative z-10 shrink-0" />
              <span className="font-medium relative z-10 break-words leading-tight">{tab.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0">
        <div className="bg-transparent/[0.03] dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-none">
          {children}
        </div>
      </main>
    </div>
  );
}
