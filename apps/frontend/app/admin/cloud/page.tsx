"use client";
import React from 'react';
import { PageHeader } from '../../../components/admin/PageHeader';
import { DataTable } from '../../../components/admin/DataTable';
import { Badge } from '../../../components/admin/Badge';

export default function AdminCloudProviders() {
  const buckets = [
    { id: 'b1', name: 'studio-assets', provider: 'AWS S3', region: 'us-east-1', status: 'ACTIVE', size: '2.4 TB' },
    { id: 'b2', name: 'studio-generated-images', provider: 'Cloudflare R2', region: 'auto', status: 'ACTIVE', size: '14.2 TB' },
    { id: 'b3', name: 'local-cache-minio', provider: 'MinIO', region: 'local', status: 'WARNING', size: '4.8 TB' },
  ];

  return (
    <>
      <PageHeader 
        title="Cloud Storage" 
        description="Manage S3-compatible storage buckets."
        actions={<button className="px-3 py-1.5 bg-white text-black text-sm font-medium rounded-md hover:bg-gray-200">Connect Bucket</button>}
      />

      <DataTable 
        data={buckets}
        columns={[
          { key: 'name', header: 'Bucket Name', render: (r) => <span className="font-semibold text-white">{r.name}</span> },
          { key: 'provider', header: 'Provider' },
          { key: 'region', header: 'Region', render: (r) => <span className="font-mono text-gray-500 text-xs">{r.region}</span> },
          { key: 'size', header: 'Storage Used' },
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
