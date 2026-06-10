"use client";
import React from 'react';
import { PageHeader } from '../../../components/admin/PageHeader';
import { DataTable } from '../../../components/admin/DataTable';
import { Badge } from '../../../components/admin/Badge';

export default function AdminMarketplace() {
  const payouts = [
    { id: 'p1', user: 'creator@studio.ai', amount: '$540.00', date: '2026-06-09', status: 'PENDING' },
    { id: 'p2', user: 'alice_design', amount: '$1,200.00', date: '2026-06-08', status: 'COMPLETED' },
    { id: 'p3', user: 'bob_arts', amount: '$50.00', date: '2026-06-08', status: 'COMPLETED' },
  ];

  return (
    <>
      <PageHeader 
        title="Marketplace Payouts" 
        description="Manage creator payout requests and platform commissions."
      />

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="p-4 border border-white/10 rounded-lg bg-[#0a0a0a]">
           <p className="text-sm text-gray-500">Pending Payouts</p>
           <p className="text-2xl font-semibold text-white">$540.00</p>
        </div>
        <div className="p-4 border border-white/10 rounded-lg bg-[#0a0a0a]">
           <p className="text-sm text-gray-500">Total Paid (All Time)</p>
           <p className="text-2xl font-semibold text-white">$84,200.00</p>
        </div>
        <div className="p-4 border border-white/10 rounded-lg bg-[#0a0a0a]">
           <p className="text-sm text-gray-500">Platform Revenue (10% Cut)</p>
           <p className="text-2xl font-semibold text-green-400">$9,355.00</p>
        </div>
      </div>

      <h3 className="text-lg font-medium text-white mb-4">Payout Requests</h3>
      <DataTable 
        data={payouts}
        columns={[
          { key: 'user', header: 'Creator Email' },
          { key: 'amount', header: 'Amount', render: (r) => <span className="font-mono text-white">{r.amount}</span> },
          { key: 'date', header: 'Request Date' },
          { key: 'status', header: 'Status', render: (r) => (
            <Badge variant={r.status === 'COMPLETED' ? 'success' : 'warning'}>{r.status}</Badge>
          )},
          { key: 'actions', header: '', render: (r) => (
             r.status === 'PENDING' && (
               <button className="text-xs px-2 py-1 bg-white text-black rounded hover:bg-gray-200 font-medium">Process Payment</button>
             )
          )}
        ]}
      />
    </>
  );
}
