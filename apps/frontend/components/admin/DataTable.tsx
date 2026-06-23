"use client";
import React, { useState } from 'react';

interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onSelectionChange?: (selectedIds: string[]) => void;
  actions?: React.ReactNode;
}

export function DataTable<T extends { id: string }>({ data, columns, onSelectionChange, actions }: DataTableProps<T>) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const newSelected = new Set(data.map(d => d.id));
      setSelected(newSelected);
      onSelectionChange?.(Array.from(newSelected));
    } else {
      setSelected(new Set());
      onSelectionChange?.([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    const newSelected = new Set(selected);
    if (checked) newSelected.add(id);
    else newSelected.delete(id);
    setSelected(newSelected);
    onSelectionChange?.(Array.from(newSelected));
  };

  return (
    <div className="border border-black/10 dark:border-white/10 rounded-lg bg-[#0a0a0a] overflow-hidden w-full max-w-full">
      {/* Toolbar */}
      <div className="p-3 sm:p-4 border-b border-black/10 dark:border-white/10 flex flex-col sm:flex-row gap-2 sm:justify-between sm:items-center bg-[#050505]">
        <div className="flex items-center gap-2">
          <input 
            type="text" 
            placeholder="Search..." 
            className="bg-[#fafafa] dark:bg-black border border-black/10 dark:border-white/10 rounded-md px-3 py-1.5 text-sm text-slate-900 dark:text-slate-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-white/20"
          />
          <button className="px-3 py-1.5 border border-black/10 dark:border-white/10 rounded-md text-sm text-gray-300 hover:bg-black/[0.03] dark:bg-white/5 transition-colors">
            Filter
          </button>
        </div>
        <div className="flex items-center gap-2">
          {selected.size > 0 && <span className="text-sm text-slate-400 dark:text-gray-500">{selected.size} selected</span>}
          {actions}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#050505] border-b border-black/10 dark:border-white/10 text-slate-500 dark:text-gray-400">
            <tr>
              <th className="px-4 py-3 w-10">
                <input 
                  type="checkbox" 
                  className="rounded border-black/20 dark:border-white/20 bg-[#fafafa] dark:bg-black checked:bg-white checked:border-white focus:ring-0"
                  checked={selected.size === data.length && data.length > 0}
                  onChange={handleSelectAll}
                />
              </th>
              {columns.map(col => (
                <th key={col.key} className="px-4 py-3 font-medium">{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data.map(row => (
              <tr key={row.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3">
                  <input 
                    type="checkbox" 
                    className="rounded border-black/20 dark:border-white/20 bg-[#fafafa] dark:bg-black checked:bg-white checked:border-white focus:ring-0"
                    checked={selected.has(row.id)}
                    onChange={(e) => handleSelectRow(row.id, e.target.checked)}
                  />
                </td>
                {columns.map(col => (
                  <td key={col.key} className="px-4 py-3 text-gray-300">
                    {col.render ? col.render(row) : (row as any)[col.key]}
                  </td>
                ))}
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={columns.length + 1} className="px-4 py-8 text-center text-slate-400 dark:text-gray-500">
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination (Mock) */}
      <div className="p-3 sm:p-4 border-t border-black/10 dark:border-white/10 flex flex-col sm:flex-row gap-2 sm:justify-between sm:items-center text-sm text-slate-400 dark:text-gray-500 bg-[#050505]">
        <span>Showing 1 to {data.length} of {data.length} entries</span>
        <div className="flex gap-1">
          <button className="px-3 py-1 border border-black/10 dark:border-white/10 rounded-md hover:bg-black/[0.03] dark:bg-white/5 disabled:opacity-50" disabled>Previous</button>
          <button className="px-3 py-1 border border-black/10 dark:border-white/10 rounded-md hover:bg-black/[0.03] dark:bg-white/5 disabled:opacity-50" disabled>Next</button>
        </div>
      </div>
    </div>
  );
}
