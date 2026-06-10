"use client";
import React from 'react';
import { PageHeader } from '../../../components/admin/PageHeader';
import { DataTable } from '../../../components/admin/DataTable';
import { Badge } from '../../../components/admin/Badge';

export default function AdminAiProviders() {
  const providers = [
    { id: '1', name: 'OpenAI (DALL-E 3)', type: 'API', status: 'ACTIVE', creditsUsed: '142,500' },
    { id: '2', name: 'Stability AI', type: 'API', status: 'ACTIVE', creditsUsed: '89,200' },
    { id: '3', name: 'ComfyUI Cluster A', type: 'Self-Hosted', status: 'OFFLINE', creditsUsed: '12,000' },
    { id: '4', name: 'Hugging Face Inference', type: 'API', status: 'RATE_LIMITED', creditsUsed: '50,000' },
  ];

  return (
    <>
      <PageHeader 
        title="AI Providers Configuration" 
        description="Manage upstream APIs and local inference clusters."
        actions={<button className="px-3 py-1.5 bg-white text-black text-sm font-medium rounded-md hover:bg-gray-200">Add Provider</button>}
      />

      <DataTable 
        data={providers}
        columns={[
          { key: 'name', header: 'Provider Name', render: (r) => <span className="font-semibold text-white">{r.name}</span> },
          { key: 'type', header: 'Type' },
          { key: 'creditsUsed', header: 'API Calls (30d)', render: (r) => <span className="font-mono text-gray-300">{r.creditsUsed}</span> },
          { key: 'status', header: 'Status', render: (r) => {
            const v = r.status === 'ACTIVE' ? 'success' : r.status === 'OFFLINE' ? 'error' : 'warning';
            return <Badge variant={v}>{r.status}</Badge>;
          }},
          { key: 'actions', header: '', render: () => <button className="text-sm text-gray-400 hover:text-white border border-white/10 px-3 py-1 rounded">Configure</button> }
        ]}
      />
    </>
  );
}
