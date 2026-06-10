"use client";
import React from 'react';
import { PageHeader } from '../../../components/admin/PageHeader';
import { DataTable } from '../../../components/admin/DataTable';
import { Badge } from '../../../components/admin/Badge';

export default function AdminUsers() {
  const users = [
    { id: 'u1', email: 'john@example.com', role: 'ADMIN', status: 'ACTIVE', created: '2025-01-10' },
    { id: 'u2', email: 'creator@studio.ai', role: 'CREATOR', status: 'ACTIVE', created: '2025-02-15' },
    { id: 'u3', email: 'spam123@test.com', role: 'USER', status: 'BANNED', created: '2026-06-01' },
    { id: 'u4', email: 'alice@wonderland.com', role: 'USER', status: 'ACTIVE', created: '2026-06-05' },
  ];

  return (
    <>
      <PageHeader 
        title="Users" 
        description="Manage user accounts, roles, and access."
        actions={<button className="px-3 py-1.5 bg-white text-black text-sm font-medium rounded-md hover:bg-gray-200">Invite User</button>}
      />

      <DataTable 
        data={users}
        columns={[
          { key: 'email', header: 'Email' },
          { key: 'role', header: 'Role', render: (row) => <span className="text-gray-400">{row.role}</span> },
          { key: 'status', header: 'Status', render: (row) => (
             <Badge variant={row.status === 'ACTIVE' ? 'success' : 'error'}>{row.status}</Badge>
          )},
          { key: 'created', header: 'Joined' },
          { key: 'actions', header: '', render: () => <button className="text-gray-500 hover:text-white">•••</button> }
        ]}
        actions={
          <button className="px-3 py-1.5 border border-red-500/30 text-red-400 text-sm rounded-md hover:bg-red-500/10">
            Ban Selected
          </button>
        }
      />
    </>
  );
}
