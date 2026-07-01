"use client";
import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../../../components/admin/PageHeader';
import { DataTable } from '../../../../components/admin/DataTable';
import { Badge } from '../../../../components/admin/Badge';
import { AnimatePresence } from 'framer-motion';
import { BillingModal } from '../../../../components/admin/BillingModal';
import { api } from '../../../../lib/api';

export default function TariffsPage() {
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    name: '', price: '', monthlyCredits: 0,
    maxConcurrent: 1, queueDelay: 30000, priority: 3,
    stripePriceId: '', isActive: true, modelsAccess: 'Base Only'
  });

  const fetchPlans = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get('/billing/plans');
      setPlans(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleEdit = (plan: any) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name || '',
      price: plan.price || '',
      monthlyCredits: plan.monthlyCredits || 0,
      maxConcurrent: plan.maxConcurrent || 1,
      queueDelay: plan.queueDelay || 30000,
      priority: plan.priority || 3,
      stripePriceId: plan.stripePriceId || '',
      isActive: plan.isActive ?? true,
      modelsAccess: plan.modelsAccess || 'Base Only'
    });
    setModalOpen(true);
  };

  const handleCreate = () => {
    setEditingPlan(null);
    setFormData({
      name: '', price: '', monthlyCredits: 0,
      maxConcurrent: 1, queueDelay: 30000, priority: 3,
      stripePriceId: '', isActive: true, modelsAccess: 'Base Only'
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const planId = editingPlan?.plan || 'NEW_PLAN'; // In a real app we'd let them pick the enum, for now we just edit existing
      await api.put(`/billing/plans/${planId}`, formData);
      setModalOpen(false);
      fetchPlans();
    } catch (e) {
      console.error(e);
      alert('Ошибка при сохранении');
    }
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
          isLoading={isLoading}
          data={plans}
          columns={[
            { key: 'plan', header: 'План', render: (r) => <span className="text-xs font-mono bg-black/5 dark:bg-white/10 px-2 py-1 rounded">{r.plan}</span> },
            { key: 'name', header: 'Название', render: (r) => <span className="font-semibold text-slate-900 dark:text-white">{r.name}</span> },
            { key: 'price', header: 'Цена' },
            { key: 'monthlyCredits', header: 'Кредиты' },
            { key: 'maxConcurrent', header: 'Макс. ген.', render: (r) => <span className="text-purple-500 font-mono">{r.maxConcurrent}</span> },
            { key: 'queueDelay', header: 'Задержка', render: (r) => <span className="text-slate-500 font-mono">{r.queueDelay}мс</span> },
            { key: 'priority', header: 'Приоритет', render: (r) => <span className="text-slate-500 font-mono">{r.priority}</span> },
            { key: 'isActive', header: 'Статус', render: (r) => {
              const v = r.isActive ? 'success' : 'default';
              return <Badge variant={v}>{r.isActive ? 'ACTIVE' : 'ARCHIVED'}</Badge>;
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
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-transparent border border-black/20 dark:border-white/20 rounded-lg p-2 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500" placeholder="Например: Pro Creator" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Цена (USD)</label>
                  <input type="text" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-transparent border border-black/20 dark:border-white/20 rounded-lg p-2 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500" placeholder="$29/mo" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Кредиты в месяц</label>
                  <input type="number" value={formData.monthlyCredits} onChange={e => setFormData({...formData, monthlyCredits: parseInt(e.target.value) || 0})} className="w-full bg-transparent border border-black/20 dark:border-white/20 rounded-lg p-2 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500" placeholder="5000" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Макс. одновременных</label>
                  <input type="number" value={formData.maxConcurrent} onChange={e => setFormData({...formData, maxConcurrent: parseInt(e.target.value) || 1})} className="w-full bg-transparent border border-black/20 dark:border-white/20 rounded-lg p-2 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Задержка очереди (мс)</label>
                  <input type="number" value={formData.queueDelay} onChange={e => setFormData({...formData, queueDelay: parseInt(e.target.value) || 0})} className="w-full bg-transparent border border-black/20 dark:border-white/20 rounded-lg p-2 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Приоритет (BullMQ)</label>
                  <input type="number" value={formData.priority} onChange={e => setFormData({...formData, priority: parseInt(e.target.value) || 3})} className="w-full bg-transparent border border-black/20 dark:border-white/20 rounded-lg p-2 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Stripe Price ID</label>
                  <input type="text" value={formData.stripePriceId} onChange={e => setFormData({...formData, stripePriceId: e.target.value})} className="w-full bg-transparent border border-black/20 dark:border-white/20 rounded-lg p-2 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500" placeholder="price_1N..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Доступные модели</label>
                  <select value={formData.modelsAccess} onChange={e => setFormData({...formData, modelsAccess: e.target.value})} className="w-full bg-transparent border border-black/20 dark:border-white/20 rounded-lg p-2 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500">
                    <option className="bg-[#0a0a0a] text-white">Base Only</option>
                    <option className="bg-[#0a0a0a] text-white">All Models</option>
                    <option className="bg-[#0a0a0a] text-white">All + Priority</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-black/10 dark:border-white/10 mt-6">
                <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white">Отмена</button>
                <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700">Сохранить</button>
              </div>
            </div>
          </BillingModal>
        )}
      </AnimatePresence>
    </>
  );
}
