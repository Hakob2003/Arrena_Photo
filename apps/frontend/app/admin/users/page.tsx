"use client";
import React, { useEffect, useState } from 'react';
import { adminApi } from '../../../lib/admin.api';
import { PageHeader } from '../../../components/admin/PageHeader';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';

type User = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  role: { name: string };
  credits: number;
};

const columnHelper = createColumnHelper<User>();

export default function AdminUsersPage() {
  const [data, setData] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals state
  const [editingCredits, setEditingCredits] = useState<User | null>(null);
  const [importing, setImporting] = useState(false);
  const [importText, setImportText] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getUsers(page, 20, search, roleFilter);
      setData(res.users);
      setTotal(res.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, roleFilter]); // Don't trigger load directly on search typing, let user press enter/search button

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadData();
  };

  const handleAddCredits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCredits) return;
    const form = e.target as HTMLFormElement;
    const amount = Number(form.amount.value);
    const reason = form.reason.value;
    
    try {
      await adminApi.updateUserCredits(editingCredits.id, amount, reason);
      setEditingCredits(null);
      loadData();
    } catch (err) {
      alert('Error adding credits');
    }
  };

  const handleImport = async () => {
    if (!importText.trim()) return;
    const emails = importText.split('\n').map(line => line.split(',')[0].trim()).filter(e => e);
    try {
      const res = await adminApi.importUsers(emails);
      alert(`Successfully imported ${res.importedCount} users.`);
      setImporting(false);
      setImportText('');
      loadData();
    } catch (err) {
      alert('Error importing users');
    }
  };

  const columns = [
    columnHelper.accessor('id', {
      header: 'ID',
      cell: info => <span className="text-gray-500 font-mono text-xs">{info.getValue().slice(0,8)}...</span>,
    }),
    columnHelper.accessor('email', {
      header: 'Email',
      cell: info => <span className="text-white">{info.getValue()}</span>,
    }),
    columnHelper.accessor('name', {
      header: 'Name',
      cell: info => info.getValue() || <span className="text-gray-600 italic">No name</span>,
    }),
    columnHelper.accessor('role.name', {
      header: 'Role',
      cell: info => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${info.getValue() === 'ADMIN' ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-800 text-gray-300'}`}>
          {info.getValue() || 'USER'}
        </span>
      ),
    }),
    columnHelper.accessor('createdAt', {
      header: 'Registered',
      cell: info => new Date(info.getValue()).toLocaleDateString(),
    }),
    columnHelper.accessor('credits', {
      header: 'Credits',
      cell: info => <span className="text-green-400 font-mono">{info.getValue() || 0}</span>,
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: (props) => (
        <div className="flex gap-2">
          <button 
            onClick={() => setEditingCredits(props.row.original)}
            className="text-xs bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded transition-colors"
          >
            Credits
          </button>
          <button 
            onClick={() => {
              if (confirm('Ban user?')) adminApi.banUser(props.row.original.id).then(loadData);
            }}
            className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 px-2 py-1 rounded transition-colors"
          >
            Ban
          </button>
        </div>
      )
    }),
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <PageHeader 
        title="Users" 
        description="Manage users, credits, and roles"
        actions={
          <button onClick={() => setImporting(true)} className="px-3 py-1.5 bg-white text-black text-sm font-medium rounded-md hover:bg-gray-200">
            Import CSV
          </button>
        }
      />

      <div className="bg-[#0a0a0a] border border-white/10 rounded-lg p-4 mb-6">
        <form onSubmit={handleSearch} className="flex gap-4">
          <input 
            type="text" 
            placeholder="Search by email or name..." 
            className="flex-1 bg-black border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select 
            className="bg-black border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30"
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
          </select>
          <button type="submit" className="bg-white text-black px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200">
            Search
          </button>
        </form>
      </div>

      <div className="bg-[#0a0a0a] border border-white/10 rounded-lg overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-400">
          <thead className="text-xs text-gray-500 uppercase bg-black/40 border-b border-white/10">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id} className="px-6 py-4 font-medium">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">Loading...</td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">No users found</td>
              </tr>
            ) : (
              table.getRowModel().rows.map(row => (
                <tr key={row.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-6 py-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-gray-500">
          Showing {data.length} of {total} users
        </div>
        <div className="flex gap-2">
          <button 
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="px-3 py-1 bg-[#0a0a0a] border border-white/10 rounded text-sm disabled:opacity-50 hover:bg-white/5"
          >
            Previous
          </button>
          <button 
            disabled={data.length < 20}
            onClick={() => setPage(p => p + 1)}
            className="px-3 py-1 bg-[#0a0a0a] border border-white/10 rounded text-sm disabled:opacity-50 hover:bg-white/5"
          >
            Next
          </button>
        </div>
      </div>

      {/* Credits Modal */}
      {editingCredits && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-[#111] border border-white/10 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-2">Manage Credits</h3>
            <p className="text-sm text-gray-400 mb-6">Editing balance for {editingCredits.email}</p>
            
            <form onSubmit={handleAddCredits} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Amount (can be negative)</label>
                <input 
                  type="number" 
                  name="amount" 
                  required
                  className="w-full bg-black border border-white/10 rounded-md px-3 py-2 text-white focus:outline-none focus:border-white/30"
                  placeholder="e.g. 100 or -50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Reason (for Audit Log)</label>
                <input 
                  type="text" 
                  name="reason" 
                  required
                  className="w-full bg-black border border-white/10 rounded-md px-3 py-2 text-white focus:outline-none focus:border-white/30"
                  placeholder="e.g. Bonus for reporting a bug"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setEditingCredits(null)}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-white text-black text-sm font-medium rounded-md hover:bg-gray-200"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {importing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-[#111] border border-white/10 rounded-xl p-6 w-full max-w-2xl">
            <h3 className="text-xl font-bold text-white mb-2">Import Users (CSV)</h3>
            <p className="text-sm text-gray-400 mb-6">Paste your CSV contents below. Only the first column (Email) will be parsed.</p>
            
            <div className="space-y-4">
              <textarea 
                value={importText}
                onChange={e => setImportText(e.target.value)}
                className="w-full h-64 bg-black border border-white/10 rounded-md p-3 text-white font-mono text-sm focus:outline-none focus:border-white/30 custom-scrollbar"
                placeholder="user1@example.com, ...&#10;user2@example.com, ..."
              />
              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => { setImporting(false); setImportText(''); }}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleImport}
                  className="px-4 py-2 bg-white text-black text-sm font-medium rounded-md hover:bg-gray-200"
                >
                  Import Users
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
