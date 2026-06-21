"use client";
import React, { useState } from 'react';
import { PageHeader } from '../../../components/admin/PageHeader';
import { DataTable } from '../../../components/admin/DataTable';
import { Badge } from '../../../components/admin/Badge';
import { motion, AnimatePresence } from 'framer-motion';

type Tab = 'tariffs' | 'history' | 'promocodes';

export default function AdminBilling() {
  const [activeTab, setActiveTab] = useState<Tab>('tariffs');

  return (
    <>
      <PageHeader 
        title="Подписки и платежи" 
        description="Управление тарифами, историей платежей и промокодами."
        actions={
          <button className="px-3 py-1.5 bg-white text-black text-sm font-medium rounded-md hover:bg-gray-200 transition-colors">
            Stripe Dashboard
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

      {/* Tabs */}
      <div className="flex space-x-1 border-b border-black/10 dark:border-white/10 mb-6">
        {[
          { id: 'tariffs', label: 'Тарифы и лимиты' },
          { id: 'history', label: 'История платежей' },
          { id: 'promocodes', label: 'Промокоды и купоны' }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as Tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === t.id 
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' 
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-gray-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="min-h-[400px]">
        {activeTab === 'tariffs' && <TariffsTab />}
        {activeTab === 'history' && <HistoryTab />}
        {activeTab === 'promocodes' && <PromocodesTab />}
      </div>
    </>
  );
}

// ============================================================================
// TARIFFS TAB
// ============================================================================
function TariffsTab() {
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
    <div className="space-y-4 animate-in fade-in">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-slate-900 dark:text-white">Управление тарифами</h3>
        <button onClick={handleCreate} className="px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors">
          + Создать тариф
        </button>
      </div>
      
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

      <AnimatePresence>
        {isModalOpen && (
          <Modal title={editingPlan ? "Редактирование тарифа" : "Новый тариф"} onClose={() => setModalOpen(false)}>
            <div className="space-y-4 mt-4">
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
                    <option className="bg-white dark:bg-black text-slate-900 dark:text-white">Только базовые</option>
                    <option className="bg-white dark:bg-black text-slate-900 dark:text-white">Все модели</option>
                    <option className="bg-white dark:bg-black text-slate-900 dark:text-white">Все + Приоритет</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-black/10 dark:border-white/10 mt-6">
                <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white">Отмена</button>
                <button onClick={() => setModalOpen(false)} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700">Сохранить</button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// HISTORY TAB
// ============================================================================
function HistoryTab() {
  const [isRefundOpen, setRefundOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<any>(null);

  const transactions = [
    { id: 'pi_3Pqz', user: 'alex@example.com', amount: '$29.00', date: '21 Jun 2026 14:22', plan: 'Pro', status: 'PAID' },
    { id: 'pi_3Pqy', user: 'maria@studio.io', amount: '$99.00', date: '21 Jun 2026 10:05', plan: 'Business', status: 'PAID' },
    { id: 'pi_3Pqx', user: 'john.doe@gmail.com', amount: '$9.00', date: '20 Jun 2026 18:45', plan: 'Starter', status: 'REFUNDED' },
    { id: 'pi_3Pqw', user: 'sam@creator.net', amount: '$29.00', date: '20 Jun 2026 09:12', plan: 'Pro', status: 'FAILED' },
    { id: 'pi_3Pqv', user: 'emma@design.co', amount: '$99.00', date: '19 Jun 2026 11:30', plan: 'Business', status: 'PAID' },
  ];

  const handleRefund = (tx: any) => {
    setSelectedTx(tx);
    setRefundOpen(true);
  };

  return (
    <div className="space-y-4 animate-in fade-in">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-slate-900 dark:text-white">История платежей</h3>
        <div className="relative">
          <input type="text" placeholder="Поиск по email или ID..." className="bg-transparent border border-black/20 dark:border-white/20 rounded-lg pl-8 pr-4 py-1.5 text-sm w-64 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500" />
          <span className="absolute left-2.5 top-2 text-slate-400">🔍</span>
        </div>
      </div>

      <DataTable 
        data={transactions}
        columns={[
          { key: 'user', header: 'Пользователь', render: (r) => <span className="font-medium text-slate-900 dark:text-white">{r.user}</span> },
          { key: 'plan', header: 'Тариф' },
          { key: 'amount', header: 'Сумма' },
          { key: 'date', header: 'Дата' },
          { key: 'status', header: 'Статус', render: (r) => {
            let v: "success" | "warning" | "error" | "default" = "default";
            if (r.status === 'PAID') v = 'success';
            if (r.status === 'REFUNDED') v = 'warning';
            if (r.status === 'FAILED') v = 'error';
            return <Badge variant={v}>{r.status}</Badge>;
          }},
          { key: 'actions', header: '', render: (r) => (
            r.status === 'PAID' ? (
              <button onClick={() => handleRefund(r)} className="text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
                Возврат
              </button>
            ) : null
          )}
        ]}
      />

      <AnimatePresence>
        {isRefundOpen && selectedTx && (
          <Modal title="Подтверждение возврата" onClose={() => setRefundOpen(false)}>
            <div className="space-y-4 mt-4">
              <p className="text-sm text-slate-600 dark:text-gray-300">
                Вы уверены, что хотите оформить полный возврат средств для пользователя <span className="font-semibold">{selectedTx.user}</span> на сумму <span className="font-semibold">{selectedTx.amount}</span>?
              </p>
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
                Внимание: Это действие необратимо и автоматически отменит подписку пользователя через Stripe.
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-black/10 dark:border-white/10 mt-6">
                <button onClick={() => setRefundOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white">Отмена</button>
                <button onClick={() => setRefundOpen(false)} className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700">Оформить возврат</button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// PROMOCODES TAB
// ============================================================================
function PromocodesTab() {
  const [isModalOpen, setModalOpen] = useState(false);

  const promos = [
    { id: '1', code: 'SUMMER50', discount: '50%', uses: '142 / 500', expires: '31 Aug 2026', status: 'ACTIVE' },
    { id: '2', code: 'WELCOME10', discount: '10%', uses: '890 / ∞', expires: 'Never', status: 'ACTIVE' },
    { id: '3', code: 'BLACKFRIDAY', discount: '$20', uses: '500 / 500', expires: '30 Nov 2025', status: 'EXPIRED' },
    { id: '4', code: 'PARTNER_AI', discount: '100%', uses: '12 / 50', expires: '31 Dec 2026', status: 'ACTIVE' },
  ];

  return (
    <div className="space-y-4 animate-in fade-in">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-slate-900 dark:text-white">Промокоды и купоны</h3>
        <button onClick={() => setModalOpen(true)} className="px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors">
          + Создать купон
        </button>
      </div>
      
      <DataTable 
        data={promos}
        columns={[
          { key: 'code', header: 'Код', render: (r) => <span className="font-mono bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded text-slate-900 dark:text-white font-bold">{r.code}</span> },
          { key: 'discount', header: 'Скидка', render: (r) => <span className="text-green-600 dark:text-green-400 font-medium">{r.discount}</span> },
          { key: 'uses', header: 'Использовано / Лимит' },
          { key: 'expires', header: 'Истекает' },
          { key: 'status', header: 'Статус', render: (r) => {
            const v = r.status === 'ACTIVE' ? 'success' : 'default';
            return <Badge variant={v}>{r.status}</Badge>;
          }},
          { key: 'actions', header: '', render: (r) => (
            r.status === 'ACTIVE' ? (
              <button className="text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">Деактивировать</button>
            ) : null
          )}
        ]}
      />

      <AnimatePresence>
        {isModalOpen && (
          <Modal title="Создание купона" onClose={() => setModalOpen(false)}>
            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Код купона</label>
                <div className="flex gap-2">
                  <input type="text" className="flex-1 bg-transparent border border-black/20 dark:border-white/20 rounded-lg p-2 text-slate-900 dark:text-white font-mono uppercase focus:outline-none focus:border-indigo-500" placeholder="NEWYEAR20" />
                  <button className="px-3 bg-black/5 dark:bg-white/10 rounded-lg text-sm font-medium hover:bg-black/10 dark:hover:bg-white/20">Сгенерировать</button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Тип скидки</label>
                  <select className="w-full bg-transparent border border-black/20 dark:border-white/20 rounded-lg p-2 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500">
                    <option className="bg-white dark:bg-black text-slate-900 dark:text-white">Процент (%)</option>
                    <option className="bg-white dark:bg-black text-slate-900 dark:text-white">Фикс. сумма ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Значение</label>
                  <input type="number" className="w-full bg-transparent border border-black/20 dark:border-white/20 rounded-lg p-2 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500" placeholder="20" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Лимит активаций</label>
                  <input type="number" className="w-full bg-transparent border border-black/20 dark:border-white/20 rounded-lg p-2 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500" placeholder="Без лимита" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Срок действия (до)</label>
                  <input type="date" className="w-full bg-transparent border border-black/20 dark:border-white/20 rounded-lg p-2 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500" />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-black/10 dark:border-white/10 mt-6">
                <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white">Отмена</button>
                <button onClick={() => setModalOpen(false)} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700">Создать купон</button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// SHARED MODAL COMPONENT
// ============================================================================
function Modal({ title, children, onClose }: { title: string, children: React.ReactNode, onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose} 
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-lg bg-white dark:bg-[#111] border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl p-6"
      >
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-gray-300">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}

