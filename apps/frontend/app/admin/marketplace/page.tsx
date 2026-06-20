"use client";
import React, { useEffect, useState } from 'react';
import { PageHeader } from '../../../components/admin/PageHeader';
import { DataTable } from '../../../components/admin/DataTable';
import { Badge } from '../../../components/admin/Badge';
import { adminApi } from '../../../lib/admin.api';

export default function AdminMarketplace() {
  const [payouts, setPayouts] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({ totalPaid: 0, pendingAmount: 0 });
  const [loading, setLoading] = useState(true);

  const fetchPayouts = () => {
    setLoading(true);
    adminApi.getPayouts(1, 50).then((data) => {
      const formatted = data.payouts.map((p: any) => ({
        id: p.id,
        user: p.user?.email || 'Unknown',
        amount: `$${p.amount.toFixed(2)}`,
        date: new Date(p.createdAt).toISOString().split('T')[0],
        status: p.status,
      }));
      setPayouts(formatted);
      setMetrics({ totalPaid: data.totalPaid, pendingAmount: data.pendingAmount });
      setLoading(false);
    }).catch(console.error);
  };

  useEffect(() => {
    fetchPayouts();
  }, []);

  const handleProcessPayment = async (id: string) => {
    await adminApi.processPayout(id);
    fetchPayouts();
  };

  return (
    <>
      <PageHeader 
        title="Marketplace Payouts" 
        description="Manage creator payout requests and platform commissions."
      />

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="p-4 border border-black/10 dark:border-white/10 rounded-lg bg-[#0a0a0a]">
           <p className="text-sm text-slate-400 dark:text-gray-500">Pending Payouts</p>
           <p className="text-2xl font-semibold text-slate-900 dark:text-white">${metrics.pendingAmount.toFixed(2)}</p>
        </div>
        <div className="p-4 border border-black/10 dark:border-white/10 rounded-lg bg-[#0a0a0a]">
           <p className="text-sm text-slate-400 dark:text-gray-500">Total Paid (All Time)</p>
           <p className="text-2xl font-semibold text-slate-900 dark:text-white">${metrics.totalPaid.toFixed(2)}</p>
        </div>
        <div className="p-4 border border-black/10 dark:border-white/10 rounded-lg bg-[#0a0a0a]">
           <p className="text-sm text-slate-400 dark:text-gray-500">Platform Revenue (10% Cut Est.)</p>
           <p className="text-2xl font-semibold text-green-400">${(metrics.totalPaid * 0.1).toFixed(2)}</p>
        </div>
      </div>

      <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">Payout Requests</h3>
      {loading ? (
        <div className="text-slate-500 dark:text-gray-400 p-8 text-center">Loading payouts...</div>
      ) : (
        <DataTable 
          data={payouts}
          columns={[
            { key: 'user', header: 'Creator Email' },
            { key: 'amount', header: 'Amount', render: (r: any) => <span className="font-mono text-slate-900 dark:text-white">{r.amount}</span> },
            { key: 'date', header: 'Request Date' },
            { key: 'status', header: 'Status', render: (r: any) => (
              <Badge variant={r.status === 'COMPLETED' ? 'success' : 'warning'}>{r.status}</Badge>
            )},
            { key: 'actions', header: '', render: (r: any) => (
               r.status === 'PENDING' && (
                 <button onClick={() => handleProcessPayment(r.id)} className="text-xs px-2 py-1 bg-white text-black rounded hover:bg-gray-200 font-medium">Process Payment</button>
               )
            )}
          ]}
        />
      )}
    </>
  );
}
