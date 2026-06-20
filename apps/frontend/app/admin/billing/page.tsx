"use client";
import React from 'react';
import { PageHeader } from '../../../components/admin/PageHeader';
import { DataTable } from '../../../components/admin/DataTable';
import { Badge } from '../../../components/admin/Badge';

export default function AdminBilling() {
  const plans = [
    { id: '1', name: 'Free Tier', price: '$0', users: 12050, status: 'ACTIVE' },
    { id: '2', name: 'Pro Creator', price: '$15/mo', users: 2400, status: 'ACTIVE' },
    { id: '3', name: 'Studio Team', price: '$49/mo', users: 150, status: 'ACTIVE' },
    { id: '4', name: 'Legacy Starter', price: '$5/mo', users: 80, status: 'ARCHIVED' },
  ];

  return (
    <>
      <PageHeader 
        title="Billing & Subscriptions" 
        description="Manage pricing tiers and Stripe integration."
        actions={<button className="px-3 py-1.5 bg-white text-black text-sm font-medium rounded-md hover:bg-gray-200">Open Stripe Dashboard</button>}
      />

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="p-4 border border-white/10 rounded-lg bg-[#0a0a0a]">
           <p className="text-sm text-gray-500">MRR (Monthly Recurring Revenue)</p>
           <p className="text-2xl font-semibold text-white">$43,350.00</p>
        </div>
        <div className="p-4 border border-white/10 rounded-lg bg-[#0a0a0a]">
           <p className="text-sm text-gray-500">Active Subscriptions</p>
           <p className="text-2xl font-semibold text-white">2,550</p>
        </div>
        <div className="p-4 border border-white/10 rounded-lg bg-[#0a0a0a]">
           <p className="text-sm text-gray-500">Churn Rate</p>
           <p className="text-2xl font-semibold text-red-400">2.1%</p>
        </div>
      </div>

      <h3 className="text-lg font-medium text-white mb-4">Subscription Tiers</h3>
      <DataTable 
        data={plans}
        columns={[
          { key: 'name', header: 'Plan Name', render: (r) => <span className="font-semibold text-white">{r.name}</span> },
          { key: 'price', header: 'Price' },
          { key: 'users', header: 'Active Users', render: (r) => <span className="text-gray-300">{r.users.toLocaleString('en-US')}</span> },
          { key: 'status', header: 'Status', render: (r) => {
            const v = r.status === 'ACTIVE' ? 'success' : 'default';
            return <Badge variant={v}>{r.status}</Badge>;
          }},
          { key: 'actions', header: '', render: () => <button className="text-sm text-gray-400 hover:text-white border border-white/10 px-3 py-1 rounded">Edit</button> }
        ]}
      />
    </>
  );
}
