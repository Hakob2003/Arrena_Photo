"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { OverviewTab } from './tabs/OverviewTab';
import { PlansTab } from './tabs/PlansTab';
import { UsageTab } from './tabs/UsageTab';
import { PaymentTab } from './tabs/PaymentTab';

type Tab = 'overview' | 'plans' | 'usage' | 'payment';

export default function UserBillingPage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const tabs = [
    { id: 'overview', label: 'Обзор' },
    { id: 'plans', label: 'Тарифы и Кредиты' },
    { id: 'usage', label: 'Использование AI' },
    { id: 'payment', label: 'Настройки оплаты' },
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Подписка и платежи</h1>
        <p className="text-slate-500 dark:text-gray-400 mt-2">Управляйте своим тарифом, кредитами и методами оплаты.</p>
      </div>

      {/* Warning Alert (Mock: if credits < 20%) */}
      <div className="mb-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-xl p-4 flex items-start gap-3">
        <span className="text-amber-500">⚠️</span>
        <div>
          <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-300">У вас осталось менее 20% кредитов</h4>
          <p className="text-sm text-amber-700 dark:text-amber-400/80 mt-1">
            Рекомендуем пополнить баланс или перейти на более высокий тариф, чтобы не прерывать работу.
          </p>
        </div>
        <button onClick={() => setActiveTab('plans')} className="ml-auto text-sm bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg transition-colors font-medium">
          Пополнить
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto space-x-1 border-b border-black/10 dark:border-white/10 mb-8 custom-scrollbar pb-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as Tab)}
            className={`whitespace-nowrap px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === t.id 
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' 
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-gray-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content Area */}
      <div className="min-h-[500px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'overview' && <OverviewTab />}
            {activeTab === 'plans' && <PlansTab />}
            {activeTab === 'usage' && <UsageTab />}
            {activeTab === 'payment' && <PaymentTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
