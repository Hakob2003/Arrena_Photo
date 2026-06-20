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
    <div className="border border-border rounded-lg bg-[#0a0a0a] overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 border-b border-border flex justify-between items-center bg-[#050505]">
        <div className="flex items-center gap-2">
          <input 
            type="text" 
            placeholder="Search..." 
            className="bg-background border border-border rounded-md px-3 py-1.5 text-sm text-foreground placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-white/20"
          />
          <button className="px-3 py-1.5 border border-border rounded-md text-sm text-muted-foreground hover:bg-muted transition-colors">
            Filter
          </button>
        </div>
        <div className="flex items-center gap-2">
          {selected.size > 0 && <span className="text-sm text-muted-foreground">{selected.size} selected</span>}
          {actions}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#050505] border-b border-border text-muted-foreground">
            <tr>
              <th className="px-4 py-3 w-10">
                <input 
                  type="checkbox" 
                  className="rounded border-border bg-background checked:bg-primary checked:border-white focus:ring-0"
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
              <tr key={row.id} className="hover:bg-primary/[0.02] transition-colors">
                <td className="px-4 py-3">
                  <input 
                    type="checkbox" 
                    className="rounded border-border bg-background checked:bg-primary checked:border-white focus:ring-0"
                    checked={selected.has(row.id)}
                    onChange={(e) => handleSelectRow(row.id, e.target.checked)}
                  />
                </td>
                {columns.map(col => (
                  <td key={col.key} className="px-4 py-3 text-muted-foreground">
                    {col.render ? col.render(row) : (row as any)[col.key]}
                  </td>
                ))}
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={columns.length + 1} className="px-4 py-8 text-center text-muted-foreground">
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination (Mock) */}
      <div className="p-4 border-t border-border flex justify-between items-center text-sm text-muted-foreground bg-[#050505]">
        <span>Showing 1 to {data.length} of {data.length} entries</span>
        <div className="flex gap-1">
          <button className="px-3 py-1 border border-border rounded-md hover:bg-muted disabled:opacity-50" disabled>Previous</button>
          <button className="px-3 py-1 border border-border rounded-md hover:bg-muted disabled:opacity-50" disabled>Next</button>
        </div>
      </div>
    </div>
  );
}
