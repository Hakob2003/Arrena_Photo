"use client";
import React, { useEffect, useState } from 'react';
import { PageHeader } from '../../../components/admin/PageHeader';
import { DataTable } from '../../../components/admin/DataTable';
import { Badge } from '../../../components/admin/Badge';
import { adminApi } from '../../../lib/admin.api';

export default function AdminGenerations() {
  const [generations, setGenerations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getGenerations(1, 50).then((data) => {
      const formatted = data.generations.map((g: any) => ({
        id: g.id.substring(0, 8) + '...',
        user: g.user?.email || 'Unknown',
        model: g.aiModel?.name || 'Unknown',
        duration: g.durationMs ? `${(g.durationMs / 1000).toFixed(1)}s` : '-',
        status: g.status,
      }));
      setGenerations(formatted);
      setLoading(false);
    }).catch(console.error);
  }, []);

  return (
    <>
      <PageHeader 
        title="Generation Logs" 
        description="Real-time monitoring of AI rendering jobs across all providers."
      />

      {loading ? (
        <div className="text-slate-500 dark:text-gray-400 p-8 text-center">Loading generation logs...</div>
      ) : (
        <DataTable 
          data={generations}
          columns={[
            { key: 'id', header: 'Job ID', render: (r: any) => <span className="font-mono text-slate-400 dark:text-gray-500 text-xs">{r.id}</span> },
            { key: 'user', header: 'User' },
            { key: 'model', header: 'Model', render: (r: any) => <Badge variant="info">{r.model}</Badge> },
            { key: 'duration', header: 'Duration' },
            { key: 'status', header: 'Status', render: (r: any) => {
              const v = r.status === 'DONE' ? 'success' : r.status === 'FAILED' ? 'error' : 'warning';
              return <Badge variant={v}>{r.status}</Badge>;
            }},
          ]}
        />
      )}
    </>
  );
}
