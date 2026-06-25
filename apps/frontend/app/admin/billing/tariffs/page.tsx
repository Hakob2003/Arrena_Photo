"use client";
import React, { useState } from 'react';
import { PageHeader } from '../../../../components/admin/PageHeader';
import { DataTable } from '../../../../components/admin/DataTable';
import { Badge } from '../../../../components/admin/Badge';
import { AnimatePresence } from 'framer-motion';
import { BillingModal } from '../../../../components/admin/BillingModal';

export default function TariffsPage() {
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);

  const plans = [
    { id: '1', name: 'Free', price: '$0', credits: '100', models: 'Base Only', status: 'ACTIVE' },
    { id: '2', name: 'Starter', price: '$9/mo', credits: '1,000', models: 'All Models', status: 'ACTIVE' },
    { id: '3', name: 'Pro', price: '$29/mo', credits: '5,000', models: 'All + Priority', status: 'ACTIVE' },
    { id: '4', name: 'Business', price: '$99/mo', credits: 'Unlimited', models: 'All + Dedicated', status: 'ACTIVE' },
    { id: '5', name: 'Legacy Early', price: '$5/mo', credits: '500', models: 'Base Only', status: 'ARCHIVED' },
  ];

  const handleEdit = (plan: any) => {
    setEditingPlan(plan);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setEditingPlan(null);
    setModalOpen(true);
  };

  return (
    <>
      <PageHeader 
        title="Тарифы и лимиты" 
        description="Создание и настройка планов подписки."
        actions={
          <button onClick={handleCreate} className="px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors">
            + Создать тариф
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="p-4 border border-black/10 dark:border-white/10 rounded-xl bg-white dark:bg-[#0a0a0a] shadow-sm">
           <p className="text-sm text-slate-500 dark:text-gray-500">MRR (Выручка за месяц)</p>
           <p className="text-2xl font-semibold text-slate-900 dark:text-white">$43,350.00</p>
        </div>
        <div className="p-4 border border-black/10 dark:border-white/10 rounded-xl bg-white dark:bg-[#0a0a0a] shadow-sm">
           <p className="text-sm text-slate-500 dark:text-gray-500">Активные подписки</p>
           <p className="text-2xl font-semibold text-slate-900 dark:text-white">2,550</p>
        </div>
        <div className="p-4 border border-black/10 dark:border-white/10 rounded-xl bg-white dark:bg-[#0a0a0a] shadow-sm">
           <p className="text-sm text-slate-500 dark:text-gray-500">Churn Rate (Отток)</p>
           <p className="text-2xl font-semibold text-red-500">2.1%</p>
        </div>
      </div>

      <div className="animate-in fade-in">
        <DataTable 
          data={plans}
          columns={[
            { key: 'name', header: 'Название', render: (r) => <span className="font-semibold text-slate-900 dark:text-white">{r.name}</span> },
            { key: 'price', header: 'Цена' },
            { key: 'credits', header: 'Кредиты' },
            { key: 'models', header: 'Доступные модели' },
            { key: 'status', header: 'Статус', render: (r) => {
              const v = r.status === 'ACTIVE' ? 'success' : 'default';
              return <Badge variant={v}>{r.status}</Badge>;
            }},
            { key: 'actions', header: '', render: (r) => (
              <button onClick={() => handleEdit(r)} className="text-sm text-indigo-500 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300">
                Редактировать
              </button>
            )}
          ]}
        />
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <BillingModal title={editingPlan ? "Редактирование тарифа" : "Новый тариф"} onClose={() => setModalOpen(false)}>
            <div className="space-y-4 mt-4 text-left">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Название тарифа</label>
                <input type="text" defaultValue={editingPlan?.name || ''} className="w-full bg-transparent border border-black/20 dark:border-white/20 rounded-lg p-2 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500" placeholder="Например: Pro Creator" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Цена (USD)</label>
                  <input type="text" defaultValue={editingPlan?.price || ''} className="w-full bg-transparent border border-black/20 dark:border-white/20 rounded-lg p-2 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500" placeholder="$29/mo" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Stripe Price ID</label>
                  <input type="text" className="w-full bg-transparent border border-black/20 dark:border-white/20 rounded-lg p-2 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500" placeholder="price_1N..." />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Кредиты в месяц</label>
                  <input type="text" defaultValue={editingPlan?.credits || ''} className="w-full bg-transparent border border-black/20 dark:border-white/20 rounded-lg p-2 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500" placeholder="5000" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Доступные модели</label>
                  <select className="w-full bg-transparent border border-black/20 dark:border-white/20 rounded-lg p-2 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500">
                    <option className="bg-transparent text-slate-900 dark:text-white">Только базовые</option>
                    <option className="bg-transparent text-slate-900 dark:text-white">Все модели</option>
                    <option className="bg-transparent text-slate-900 dark:text-white">Все + Приоритет</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-black/10 dark:border-white/10 mt-6">
                <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white">Отмена</button>
                <button onClick={() => setModalOpen(false)} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700">Сохранить</button>
              </div>
            </div>
          </BillingModal>
        )}
      </AnimatePresence>
    </>
  );
}
