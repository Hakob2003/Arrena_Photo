"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { OverviewTab } from './tabs/OverviewTab';
import { PlansTab } from './tabs/PlansTab';
import { UsageTab } from './tabs/UsageTab';
import { PaymentTab } from './tabs/PaymentTab';
import { useTranslation } from '../../../lib/i18n';
import { useUIStore, useAuthStore } from '../../../store';
import { api } from '../../../lib/api';

type Tab = 'overview' | 'plans' | 'usage' | 'payment';

export default function UserBillingPage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const { t } = useTranslation();
  const preferences = useUIStore(state => state.preferences);
  const isPremium = preferences?.skin === 'PREMIUM';
  const isLuxury = preferences?.skin === 'LUXURY';
  // Sync planId and credits from server on page load
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/auth/me');
        if (data.planId) useAuthStore.getState().setPlanId(data.planId);
        if (data.credits != null) useAuthStore.getState().setCredits(data.credits);
      } catch (e) {
        // Ignore — user may not be authenticated
      }
    })();
  }, []);

  // Small Drum Navigation (Tabs)
  const isNavigating = React.useRef(false);
  useEffect(() => {
    if (!isPremium) return; // Only enable for Premium skin

    const tabKeys: Tab[] = ['overview', 'plans', 'usage', 'payment'];
    
    const navigateTo = (direction: 'next' | 'prev') => {
      if (isNavigating.current) return;
      isNavigating.current = true;

      useUIStore.getState().setNavDirection(direction === 'next' ? 'down' : 'up');

      setActiveTab((prev) => {
        const currentIndex = tabKeys.indexOf(prev);
        let nextIndex = 0;
        if (direction === 'next') {
          nextIndex = (currentIndex + 1) % tabKeys.length;
        } else {
          nextIndex = (currentIndex - 1 + tabKeys.length) % tabKeys.length;
        }
        return tabKeys[nextIndex];
      });

      // Cooldown timer to prevent multiple jumps
      setTimeout(() => {
        isNavigating.current = false;
      }, 1200); 
    };

    let touchStartY = 0;
    let touchStartX = 0;

    const handleWheel = (e: WheelEvent) => {
      if (isNavigating.current) return;

      const scrollTop = window.scrollY;
      const scrollHeight = document.body.scrollHeight;
      const clientHeight = window.innerHeight;

      const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) <= 2;
      const isAtTop = scrollTop <= 2;

      // Vertical wheel at boundaries (or horizontal wheel, but only at boundaries)
      if ((e.deltaY > 0 || e.deltaX > 0) && isAtBottom) {
        e.preventDefault(); 
        navigateTo('next');
      } else if ((e.deltaY < 0 || e.deltaX < 0) && isAtTop) {
        e.preventDefault();
        navigateTo('prev');
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
      touchStartX = e.touches[0].clientX;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isNavigating.current) return;

      const touchEndY = e.touches[0].clientY;
      const touchEndX = e.touches[0].clientX;
      const deltaY = touchStartY - touchEndY; 
      const deltaX = touchStartX - touchEndX;

      const scrollTop = window.scrollY;
      const scrollHeight = document.body.scrollHeight;
      const clientHeight = window.innerHeight;

      const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) <= 2;
      const isAtTop = scrollTop <= 2;

      const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY);

      if (isHorizontalSwipe) {
        if (deltaX > 40 && isAtBottom) {
          navigateTo('next');
        } else if (deltaX < -40 && touchStartX > 30 && isAtTop) {
          navigateTo('prev');
        }
      } else {
        if (deltaY > 30 && isAtBottom) {
          navigateTo('next');
        } else if (deltaY < -30 && isAtTop) {
          navigateTo('prev');
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  const tabs = [
    { id: 'overview', label: t('billing.overview') },
    { id: 'plans', label: t('billing.plans') },
    { id: 'usage', label: t('billing.usage') },
    { id: 'payment', label: t('billing.payment') },
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('billing.title')}</h1>
        <p className="text-slate-500 dark:text-gray-400 mt-2">{t('billing.description')}</p>
      </div>

      {/* Warning Alert (Mock: if credits < 20%) */}
      <div className="mb-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-xl p-4 flex items-start gap-3">
        <span className="text-amber-500">⚠️</span>
        <div>
          <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-300">{t('billing.lowCreditsTitle')}</h4>
          <p className="text-sm text-amber-700 dark:text-amber-400/80 mt-1">
            {t('billing.lowCreditsDescription')}
          </p>
        </div>
        <button onClick={() => setActiveTab('plans')} className="ml-auto text-sm bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg transition-colors font-medium">
          {t('billing.topUp')}
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto space-x-1 border-b border-black/10 dark:border-white/10 mb-8 custom-scrollbar pb-1">
        {tabs.map((tb, idx) => (
          <button
            key={tb.id}
            onClick={() => {
              const currentIndex = tabs.findIndex(t => t.id === activeTab);
              if (idx > currentIndex) {
                useUIStore.getState().setNavDirection('down');
              } else if (idx < currentIndex) {
                useUIStore.getState().setNavDirection('up');
              }
              setActiveTab(tb.id as Tab);
            }}
            className={`whitespace-nowrap px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tb.id 
                ? (isLuxury ? 'border-[#D4AF37] text-[#D4AF37]' : 'border-indigo-500 text-indigo-600 dark:text-indigo-400')
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-gray-300'
            }`}
          >
            {tb.label}
          </button>
        ))}
      </div>

      {/* Tab Content Area */}
      <div className="min-h-[500px] relative">
        <AnimatePresence mode={preferences.skin === 'PREMIUM' ? "popLayout" : "wait"}>
          <motion.div
            key={activeTab}
            custom={useUIStore.getState().navDirection}
            variants={{
              initial: (dir: 'up' | 'down' | null) => {
                if (preferences.skin !== 'PREMIUM') return { opacity: 0, x: dir === 'down' ? 20 : -20 };
                if (!dir) return { opacity: 0, x: 0 };
                return { opacity: 1, x: dir === 'down' ? '100%' : '-100%', scale: 0.95 };
              },
              animate: { opacity: 1, x: 0, scale: 1 },
              exit: (dir: 'up' | 'down' | null) => {
                if (preferences.skin !== 'PREMIUM') return { opacity: 0, x: dir === 'down' ? -20 : 20 };
                if (!dir) return { opacity: 0, x: 0 };
                return { opacity: 1, x: dir === 'down' ? '-100%' : '100%', scale: 0.95 };
              }
            }}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={
              preferences.skin === 'PREMIUM' 
              ? { duration: 0.6, ease: [0.22, 1, 0.36, 1] } 
              : { duration: 0.2 }
            }
            className="w-full"
          >
            {activeTab === 'overview' && <OverviewTab onNavigateToPlans={() => setActiveTab('plans')} />}
            {activeTab === 'plans' && <PlansTab />}
            {activeTab === 'usage' && <UsageTab />}
            {activeTab === 'payment' && <PaymentTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
