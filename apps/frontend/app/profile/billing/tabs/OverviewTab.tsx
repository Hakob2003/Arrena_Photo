"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../../../store';
import { useTranslation } from '../../../../lib/i18n';
import { useUIStore } from '../../../../store';

const PLAN_DETAILS: Record<string, { name: string, limit: number, price: string, features: string[] }> = {
  free: { name: 'Free', limit: 100, price: '$0.00', features: ['До 1 задачи', 'Стандартная скорость', 'Водяной знак'] },
  starter: { name: 'Starter', limit: 1000, price: '$9.00', features: ['До 2 задач', 'Стандартная скорость', 'Без водяного знака'] },
  pro: { name: 'Pro Creator', limit: 5000, price: '$29.00', features: ['До 5 задач', 'Высокая скорость', 'Коммерческая лицензия'] },
  business: { name: 'Business', limit: 999999, price: '$99.00', features: ['До 20 задач', 'Макс. скорость', 'API доступ'] },
};

export function OverviewTab() {
  const [isCancelModalOpen, setCancelModalOpen] = useState(false);
  const { credits, planId, setPlanId } = useAuthStore();
  const { t } = useTranslation();
  const isLuxury = useUIStore(state => state.preferences?.skin === 'LUXURY');
  
  const currentPlan = PLAN_DETAILS[planId] || PLAN_DETAILS.free;
  const isActive = planId !== 'free';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Left Column: Current Plan & Subscription Management */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Block 1: Текущий тариф */}
        <div className="bg-white dark:bg-[#0a0a0a] border border-black/10 dark:border-white/10 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                {currentPlan.name}
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                  isActive 
                    ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 border-green-200 dark:border-green-500/30'
                    : 'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400 border-slate-200 dark:border-slate-500/30'
                }`}>
                  {isActive ? t('billing.overview.active') : t('billing.overview.free')}
                </span>
              </h2>
              {isActive && <p className="text-slate-500 dark:text-gray-400 text-sm mt-1">{t('billing.overview.activeUntil')} 21 Июля 2026</p>}
            </div>
            <div className="text-left sm:text-right">
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{currentPlan.price} <span className="text-sm font-normal text-slate-500">{t('billing.overview.perMonth')}</span></p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5">
              <p className="text-sm text-slate-500 dark:text-gray-400 mb-1">{t('billing.overview.creditsLeft')}</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{credits.toLocaleString()} <span className="text-sm font-normal text-slate-500">{t('billing.overview.outOf')} {currentPlan.limit > 100000 ? '∞' : currentPlan.limit.toLocaleString()}</span></p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5">
              <p className="text-sm text-slate-500 dark:text-gray-400 mb-1">{t('billing.overview.usedPeriod')}</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{(Math.max(0, currentPlan.limit - credits)).toLocaleString()} <span className="text-sm font-normal text-slate-500">{t('billing.overview.creditsWord')}</span></p>
            </div>
          </div>

          <div className="border-t border-black/10 dark:border-white/10 pt-4">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">{t('billing.overview.features')}</h4>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-600 dark:text-gray-300">
              {currentPlan.features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2"><span className="text-green-500">✓</span> {feature}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Block 6: Управление подпиской */}
        <div className="bg-white dark:bg-[#0a0a0a] border border-black/10 dark:border-white/10 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{t('billing.overview.manage')}</h3>
            <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">{t('billing.overview.manageDesc')}</p>
          </div>
          <div className="flex flex-wrap gap-2 justify-start sm:justify-end">
            <button className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              isLuxury ? 'bg-[#D4AF37] hover:bg-[#C5A028] text-black' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}>
              {t('billing.overview.changePlan')}
            </button>
            {isActive && (
              <button onClick={() => setCancelModalOpen(true)} className="px-4 py-2 bg-transparent border border-black/10 dark:border-white/10 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-500/30 text-slate-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-all">
                {t('billing.overview.cancelPlan')}
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Right Column: Usage Statistics (Short) */}
      <div className="space-y-6">
        <div className="bg-white dark:bg-[#0a0a0a] border border-black/10 dark:border-white/10 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">{t('billing.overview.stats')}</h3>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600 dark:text-gray-300">{t('billing.overview.usedCredits')}</span>
                <span className="font-semibold text-slate-900 dark:text-white">75%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-white/10 rounded-full h-2">
                <div className={`h-2 rounded-full ${isLuxury ? 'bg-[#D4AF37]' : 'bg-indigo-500'}`} style={{ width: '75%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600 dark:text-gray-300">{t('billing.overview.imagesGenerated')}</span>
                <span className="font-semibold text-slate-900 dark:text-white">340</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-white/10 rounded-full h-2">
                <div className="bg-pink-500 h-2 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600 dark:text-gray-300">{t('billing.overview.creditsLeft')}</span>
                <span className="font-semibold text-amber-600 dark:text-amber-400">{credits.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-black/10 dark:border-white/10">
            <button className={`w-full text-center text-sm font-medium hover:underline ${
              isLuxury ? 'text-[#D4AF37]' : 'text-indigo-600 dark:text-indigo-400'
            }`}>
              {t('billing.overview.viewStats')}
            </button>
          </div>
        </div>
      </div>

      {/* Cancel Subscription Modal */}
      <AnimatePresence>
        {isCancelModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
              onClick={() => setCancelModalOpen(false)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md bg-white dark:bg-[#111] border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl p-6"
            >
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('billing.overview.cancelModalTitle')}</h2>
              <p className="text-slate-600 dark:text-gray-300 text-sm mb-6">
                {t('billing.overview.cancelModalDesc1')} <strong>{currentPlan.name}</strong>? 
                {t('billing.overview.cancelModalDesc2')} (21 Июля 2026), {t('billing.overview.cancelModalDesc3')}
              </p>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => {
                    setPlanId('free');
                    setCancelModalOpen(false);
                  }} 
                  className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {t('billing.overview.yesCancel')}
                </button>
                <button onClick={() => setCancelModalOpen(false)} className="w-full px-4 py-2 bg-transparent border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-slate-900 dark:text-white text-sm font-medium rounded-lg transition-colors">
                  {t('billing.overview.noCancel')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
