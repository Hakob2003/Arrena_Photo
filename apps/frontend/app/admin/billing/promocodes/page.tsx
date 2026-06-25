"use client";
import React, { useState } from 'react';
import { PageHeader } from '../../../../components/admin/PageHeader';
import { DataTable } from '../../../../components/admin/DataTable';
import { Badge } from '../../../../components/admin/Badge';
import { AnimatePresence } from 'framer-motion';
import { BillingModal } from '../../../../components/admin/BillingModal';

export default function PromocodesPage() {
  const [isModalOpen, setModalOpen] = useState(false);

  const promos = [
    { id: '1', code: 'SUMMER50', discount: '50%', uses: '142 / 500', expires: '31 Aug 2026', status: 'ACTIVE' },
    { id: '2', code: 'WELCOME10', discount: '10%', uses: '890 / ∞', expires: 'Never', status: 'ACTIVE' },
    { id: '3', code: 'BLACKFRIDAY', discount: '$20', uses: '500 / 500', expires: '30 Nov 2025', status: 'EXPIRED' },
    { id: '4', code: 'PARTNER_AI', discount: '100%', uses: '12 / 50', expires: '31 Dec 2026', status: 'ACTIVE' },
  ];

  return (
    <>
      <PageHeader 
        title="Промокоды и купоны" 
        description="Управление скидками для пользователей."
        actions={
          <button onClick={() => setModalOpen(true)} className="px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors">
            + Создать купон
          </button>
        }
      />

      <div className="animate-in fade-in">
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
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <BillingModal title="Создание купона" onClose={() => setModalOpen(false)}>
            <div className="space-y-4 mt-4 text-left">
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
                    <option className="bg-transparent text-slate-900 dark:text-white">Процент (%)</option>
                    <option className="bg-transparent text-slate-900 dark:text-white">Фикс. сумма ($)</option>
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
          </BillingModal>
        )}
      </AnimatePresence>
    </>
  );
}
