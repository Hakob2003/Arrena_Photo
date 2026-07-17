'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { User, Shield, Palette, Bell, Activity, Clock, CreditCard, BarChart2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '../../store';
import { useTranslation } from '../../lib/i18n';
import { useEffect, useState } from 'react';
import { useUIStore } from '../../store';
import { useIsMobile } from '../../hooks/useIsMobile';

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('personal');
  const preferences = useUIStore((state) => state.preferences);
  const isMobile = useIsMobile();
  const isPremium = preferences.skin === 'PREMIUM';
  const isLuxury = preferences.skin === 'LUXURY';
  const isNeon = preferences.skin === 'NEON';

  const profileTabs = [
    { id: 'personal', label: t('profile.personal'), icon: User, href: '#personal' },
    { id: 'security', label: t('profile.security'), icon: Shield, href: '#security' },
    { id: 'appearance', label: t('profile.appearance'), icon: Palette, href: '#appearance' },
    { id: 'notifications', label: t('profile.notifications'), icon: Bell, href: '#notifications' },
    { id: 'statistics', label: t('profile.statistics'), icon: BarChart2, href: '#statistics' },
    { id: 'activity', label: t('profile.activity'), icon: Clock, href: '#activity' },
  ];

  useEffect(() => {
    if (!user) {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
      }
    }
  }, [user, router]);

  useEffect(() => {
    // Setup intersection observer to update active tab based on scroll
    const observers: IntersectionObserver[] = [];
    const options = {
      root: null,
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0
    };

    profileTabs.forEach((tab) => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveTab(tab.id);
            // Optionally update URL without jumping
            history.replaceState(null, '', `#${tab.id}`);
          }
        });
      }, options);

      const el = document.getElementById(tab.id);
      if (el) {
        observer.observe(el);
      }
      observers.push(observer);
    });

    return () => {
      observers.forEach((obs) => obs.disconnect());
    };
  }, []);

  // Update active tab on initial load if there's a hash
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      if (hash && profileTabs.find(t => t.id === hash)) {
        setActiveTab(hash);
      }
    }
  }, []);

  if (!user) return null;

  return (
    <div className="flex flex-col md:flex-row gap-8 w-full max-w-7xl mx-auto py-8 px-4 md:px-8">
      {/* Sidebar Navigation */}
      <nav className={cn(
        "flex md:flex-col gap-2 overflow-x-auto md:overflow-visible py-3 md:py-0 md:w-64 shrink-0 no-scrollbar sticky z-40 -mx-4 px-4 md:mx-0 md:px-0 md:h-fit md:self-start transition-all duration-300",
        isPremium ? "top-0 md:top-8" : "top-16 md:top-24",
        isMobile && isPremium ? "bg-white/5 dark:bg-[#060606]/80 backdrop-blur-md border-b border-white/5" : "",
        isMobile && !isPremium ? "bg-white/70 dark:bg-black/70 backdrop-blur-md" : "",
        isMobile && isLuxury && !isPremium ? "border-b border-[#D4AF37]/20" : "",
        isMobile && !isLuxury && !isPremium ? "border-b border-black/10 dark:border-white/5" : "",
        !isMobile ? "bg-transparent backdrop-blur-none border-none" : ""
      )}>
        {profileTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <Link
              key={tab.id}
              href={tab.href}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative flex items-center gap-3 px-4 py-3 rounded-xl transition-colors whitespace-nowrap md:whitespace-normal group",
                isActive
                  ? "text-slate-900 dark:text-white"
                  : "text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-200 hover:bg-black/[0.03] dark:hover:bg-white/5"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="profile-tab-active"
                  className={cn(
                    "absolute inset-0 rounded-xl",
                    isPremium ? "bg-white/10 dark:bg-white/10 border border-white/20 shadow-[inset_4px_0_15px_rgba(255,255,255,0.1)]" : "",
                    isLuxury ? "bg-[#D4AF37]/5 border border-[#D4AF37]/50" : "",
                    isNeon ? "bg-[rgb(var(--color-accent-500)/0.05)] border border-[rgb(var(--color-accent-500))] shadow-[inset_4px_0_15px_rgb(var(--color-accent-500)/0.25)]" : "",
                    !isPremium && !isLuxury && !isNeon ? "bg-black/[0.05] dark:bg-white/10 border border-black/20 dark:border-white/20" : ""
                  )}
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <Icon className={cn(
                "w-5 h-5 relative z-10 shrink-0 transition-transform duration-300 group-hover:scale-110",
                isActive ? "scale-110" : "",
                isActive && isPremium ? "drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]" : "",
                isActive && isLuxury ? "text-[#D4AF37]" : "",
                isActive && isNeon ? "text-[rgb(var(--color-accent-500))] drop-shadow-[0_0_8px_rgb(var(--color-accent-500)/0.8)]" : ""
              )} />
              <span className={cn(
                "font-medium relative z-10 break-words leading-tight",
                isActive && isPremium ? "text-slate-900 dark:text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]" : "",
                isActive && isLuxury ? "text-[#D4AF37]" : "",
                isActive && isNeon ? "text-[rgb(var(--color-accent-500))] drop-shadow-[0_0_8px_rgb(var(--color-accent-500)/0.5)]" : ""
              )}>{tab.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0">
        {/* Removed bg-transparent wrapper to allow sections to scroll naturally */}
        {children}
      </main>
    </div>
  );
}
