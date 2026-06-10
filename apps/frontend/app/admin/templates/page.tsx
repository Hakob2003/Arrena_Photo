"use client";
import React from 'react';
import { PageHeader } from '../../../components/admin/PageHeader';
import { DataTable } from '../../../components/admin/DataTable';
import { Badge } from '../../../components/admin/Badge';

export default function AdminTemplates() {
  const templates = [
    { id: 't1', name: 'Cyberpunk Portraits', creator: 'john_doe', status: 'APPROVED', reports: 0 },
    { id: 't2', name: 'NSFW Content', creator: 'bad_actor', status: 'PENDING', reports: 5 },
    { id: 't3', name: 'Minimalist Logos', creator: 'alice_design', status: 'APPROVED', reports: 0 },
    { id: 't4', name: 'Spam Template 1', creator: 'bot123', status: 'REJECTED', reports: 12 },
  ];

  return (
    <>
      <PageHeader 
        title="Templates Moderation" 
        description="Review and approve marketplace templates."
      />

      <DataTable 
        data={templates}
        columns={[
          { key: 'name', header: 'Template Name', render: (r) => <span className="font-medium text-white">{r.name}</span> },
          { key: 'creator', header: 'Creator' },
          { key: 'reports', header: 'Reports', render: (r) => (
            <span className={r.reports > 0 ? 'text-red-400 font-bold' : 'text-gray-500'}>{r.reports}</span>
          )},
          { key: 'status', header: 'Status', render: (r) => {
            const v = r.status === 'APPROVED' ? 'success' : r.status === 'REJECTED' ? 'error' : 'warning';
            return <Badge variant={v}>{r.status}</Badge>;
          }},
          { key: 'actions', header: 'Actions', render: () => (
            <div className="flex gap-2">
              <button className="text-xs px-2 py-1 bg-white/10 rounded hover:bg-white/20">Review</button>
            </div>
          )}
        ]}
        actions={
          <div className="flex gap-2">
            <button className="px-3 py-1.5 border border-white/10 text-white text-sm rounded-md hover:bg-white/10">Approve All</button>
            <button className="px-3 py-1.5 border border-red-500/30 text-red-400 text-sm rounded-md hover:bg-red-500/10">Reject Selected</button>
          </div>
        }
      />
    </>
  );
}
