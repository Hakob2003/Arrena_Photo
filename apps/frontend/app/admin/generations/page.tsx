"use client";
import React from 'react';
import { PageHeader } from '../../../components/admin/PageHeader';
import { DataTable } from '../../../components/admin/DataTable';
import { Badge } from '../../../components/admin/Badge';

export default function AdminGenerations() {
  const generations = [
    { id: 'g1', user: 'john@example.com', model: 'sdxl-1.0', duration: '4.2s', status: 'COMPLETED' },
    { id: 'g2', user: 'alice_design', model: 'dall-e-3', duration: '12.1s', status: 'COMPLETED' },
    { id: 'g3', user: 'spam123@test.com', model: 'midjourney-v6', duration: '-', status: 'FAILED' },
    { id: 'g4', user: 'bob_arts', model: 'comfyui', duration: '8.5s', status: 'PROCESSING' },
  ];

  return (
    <>
      <PageHeader 
        title="Generation Logs" 
        description="Real-time monitoring of AI rendering jobs across all providers."
      />

      <DataTable 
        data={generations}
        columns={[
          { key: 'id', header: 'Job ID', render: (r) => <span className="font-mono text-gray-500 text-xs">{r.id}</span> },
          { key: 'user', header: 'User' },
          { key: 'model', header: 'Model', render: (r) => <Badge variant="info">{r.model}</Badge> },
          { key: 'duration', header: 'Duration' },
          { key: 'status', header: 'Status', render: (r) => {
            const v = r.status === 'COMPLETED' ? 'success' : r.status === 'FAILED' ? 'error' : 'warning';
            return <Badge variant={v}>{r.status}</Badge>;
          }},
        ]}
      />
    </>
  );
}
