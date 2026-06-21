"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../../../store';

const PLAN_DETAILS: Record<string, { name: string, limit: number }> = {
  free: { name: 'Free', limit: 100 },
  starter: { name: 'Starter', limit: 1000 },
  pro: { name: 'Pro Creator', limit: 5000 },
  business: { name: 'Business', limit: 999999 },
};

export function OverviewTab() {
  const [isCancelModalOpen, setCancelModalOpen] = useState(false);
  const { credits, planId, setPlanId } = useAuthStore();
  
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
                  {isActive ? 'Active' : 'Free'}
                </span>
              </h2>
              {isActive && <p className="text-slate-500 dark:text-gray-400 text-sm mt-1">Подписка активна до 21 Июля 2026</p>}
            </div>
            <div className="text-left sm:text-right">
              <p className="text-2xl font-bold text-slate-900 dark:text-white">$29.00 <span className="text-sm font-normal text-slate-500">/ мес</span></p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5">
              <p className="text-sm text-slate-500 dark:text-gray-400 mb-1">Остаток кредитов</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{credits.toLocaleString()} <span className="text-sm font-normal text-slate-500">из {currentPlan.limit > 100000 ? '∞' : currentPlan.limit.toLocaleString()}</span></p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5">
              <p className="text-sm text-slate-500 dark:text-gray-400 mb-1">Использовано за период</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{(Math.max(0, currentPlan.limit - credits)).toLocaleString()} <span className="text-sm font-normal text-slate-500">кредитов</span></p>
            </div>
          </div>

          <div className="border-t border-black/10 dark:border-white/10 pt-4">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Доступные функции тарифа:</h4>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-600 dark:text-gray-300">
              <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Доступ ко всем AI-моделям</li>
              <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Приоритетная генерация</li>
              <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Коммерческая лицензия</li>
              <li className="flex items-center gap-2"><span className="text-green-500">✓</span> До 5 параллельных задач</li>
            </ul>
          </div>
        </div>

        {/* Block 6: Управление подпиской */}
        <div className="bg-white dark:bg-[#0a0a0a] border border-black/10 dark:border-white/10 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Управление подпиской</h3>
            <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">Измените тариф, обновите метод оплаты или отмените подписку.</p>
          </div>
          <div className="flex flex-wrap gap-2 justify-start sm:justify-end">
            <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors">
              Сменить тариф
            </button>
            {isActive && (
              <button onClick={() => setCancelModalOpen(true)} className="px-4 py-2 bg-transparent border border-black/10 dark:border-white/10 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-500/30 text-slate-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-all">
                Отменить
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Right Column: Usage Statistics (Short) */}
      <div className="space-y-6">
        <div className="bg-white dark:bg-[#0a0a0a] border border-black/10 dark:border-white/10 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Статистика за месяц</h3>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600 dark:text-gray-300">Использовано кредитов</span>
                <span className="font-semibold text-slate-900 dark:text-white">75%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-white/10 rounded-full h-2">
                <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600 dark:text-gray-300">Генерации изображений</span>
                <span className="font-semibold text-slate-900 dark:text-white">340</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-white/10 rounded-full h-2">
                <div className="bg-pink-500 h-2 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600 dark:text-gray-300">Остаток кредитов</span>
                <span className="font-semibold text-amber-600 dark:text-amber-400">{credits.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-black/10 dark:border-white/10">
            <button className="w-full text-center text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
              Смотреть детальную статистику →
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
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Отмена подписки</h2>
              <p className="text-slate-600 dark:text-gray-300 text-sm mb-6">
                Вы уверены, что хотите отменить подписку <strong>{currentPlan.name}</strong>? 
                У вас останется доступ к функциям до конца оплаченного периода (21 Июля 2026), после чего тариф будет изменен на Free, а неиспользованные кредиты сгорят.
              </p>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => {
                    setPlanId('free');
                    setCancelModalOpen(false);
                  }} 
                  className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Да, отменить подписку
                </button>
                <button onClick={() => setCancelModalOpen(false)} className="w-full px-4 py-2 bg-transparent border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-slate-900 dark:text-white text-sm font-medium rounded-lg transition-colors">
                  Я передумал(а)
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
