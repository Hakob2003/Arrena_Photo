"use client";
import React, { useState } from 'react';
import { PageHeader } from '../../../../components/admin/PageHeader';
import { DataTable } from '../../../../components/admin/DataTable';
import { Badge } from '../../../../components/admin/Badge';
import { AnimatePresence } from 'framer-motion';
import { BillingModal } from '../../../../components/admin/BillingModal';

export default function HistoryPage() {
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
    <>
      <PageHeader 
        title="История платежей" 
        description="Просмотр транзакций и управление возвратами средств."
      />

      <div className="mb-4">
        <div className="relative">
          <input type="text" placeholder="Поиск по email или ID..." className="bg-transparent border border-black/20 dark:border-white/20 rounded-lg pl-8 pr-4 py-2 text-sm w-full md:w-96 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500" />
          <span className="absolute left-2.5 top-2 text-slate-400">🔍</span>
        </div>
      </div>

      <div className="animate-in fade-in">
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
      </div>

      <AnimatePresence>
        {isRefundOpen && selectedTx && (
          <BillingModal title="Подтверждение возврата" onClose={() => setRefundOpen(false)}>
            <div className="space-y-4 mt-4 text-left">
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
          </BillingModal>
        )}
      </AnimatePresence>
    </>
  );
}
