"use client";
import React, { useEffect, useState } from 'react';
import { PageHeader } from '../../../components/admin/PageHeader';
import { DataTable } from '../../../components/admin/DataTable';
import { Badge } from '../../../components/admin/Badge';
import { adminApi } from '../../../lib/admin.api';

export default function AdminTemplates() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTemplates = () => {
    setLoading(true);
    adminApi.getTemplates(1, 50).then((data) => {
      const formatted = data.templates.map((t: any) => ({
        id: t.id,
        name: t.name,
        creator: t.creator?.email || 'Unknown',
        status: t.isApproved ? 'APPROVED' : (t.status === 'REJECTED' ? 'REJECTED' : 'PENDING'),
        reports: t._count?.reports || 0,
      }));
      setTemplates(formatted);
      setLoading(false);
    }).catch(console.error);
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleApprove = async (id: string) => {
    await adminApi.approveTemplate(id);
    fetchTemplates();
  };

  const handleReject = async (id: string) => {
    await adminApi.rejectTemplate(id);
    fetchTemplates();
  };

  return (
    <>
      <PageHeader 
        title="Templates Moderation" 
        description="Review and approve marketplace templates."
      />

      {loading ? (
        <div className="text-gray-400 p-8 text-center">Loading templates...</div>
      ) : (
        <DataTable 
          data={templates}
          columns={[
            { key: 'name', header: 'Template Name', render: (r: any) => <span className="font-medium text-white">{r.name}</span> },
            { key: 'creator', header: 'Creator' },
            { key: 'reports', header: 'Reports', render: (r: any) => (
              <span className={r.reports > 0 ? 'text-red-400 font-bold' : 'text-gray-500'}>{r.reports}</span>
            )},
            { key: 'status', header: 'Status', render: (r: any) => {
              const v = r.status === 'APPROVED' ? 'success' : r.status === 'REJECTED' ? 'error' : 'warning';
              return <Badge variant={v}>{r.status}</Badge>;
            }},
            { key: 'actions', header: 'Actions', render: (r: any) => (
              <div className="flex gap-2">
                {r.status !== 'APPROVED' && (
                  <button onClick={() => handleApprove(r.id)} className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30">Approve</button>
                )}
                {r.status !== 'REJECTED' && (
                  <button onClick={() => handleReject(r.id)} className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30">Reject</button>
                )}
              </div>
            )}
          ]}
        />
      )}
    </>
  );
}
