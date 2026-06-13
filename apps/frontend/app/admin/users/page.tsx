"use client";
import React, { useEffect, useState } from 'react';
import { PageHeader } from '../../../components/admin/PageHeader';
import { DataTable } from '../../../components/admin/DataTable';
import { Badge } from '../../../components/admin/Badge';
import { adminApi } from '../../../lib/admin.api';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getUsers(1, 50).then((data) => {
      // Map the backend data to match the UI expected structure
      const formatted = data.users.map((u: any) => ({
        id: u.id,
        email: u.email,
        role: u.role?.name || 'USER',
        status: 'ACTIVE', // Mock status until we add real isBanned flag
        created: new Date(u.createdAt).toISOString().split('T')[0],
      }));
      setUsers(formatted);
      setLoading(false);
    }).catch(console.error);
  }, []);

  const handleBan = async (userId: string) => {
    await adminApi.banUser(userId);
    alert(`User ${userId} banned (audit log created)`);
  };

  return (
    <>
      <PageHeader 
        title="Users" 
        description="Manage user accounts, roles, and access."
        actions={<button className="px-3 py-1.5 bg-white text-black text-sm font-medium rounded-md hover:bg-gray-200">Invite User</button>}
      />

      {loading ? (
        <div className="text-gray-400 p-8 text-center">Loading users...</div>
      ) : (
        <DataTable 
          data={users}
          columns={[
            { key: 'email', header: 'Email' },
            { key: 'role', header: 'Role', render: (row: any) => <span className="text-gray-400">{row.role}</span> },
            { key: 'status', header: 'Status', render: (row: any) => (
               <Badge variant={row.status === 'ACTIVE' ? 'success' : 'error'}>{row.status}</Badge>
            )},
            { key: 'created', header: 'Joined' },
            { key: 'actions', header: '', render: (row: any) => (
               <button onClick={() => handleBan(row.id)} className="text-gray-500 hover:text-red-400">Ban</button>
            ) }
          ]}
        />
      )}
    </>
  );
}
