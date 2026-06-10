"use client";
import React from 'react';
import { PageHeader } from '../../../components/admin/PageHeader';
import { DataTable } from '../../../components/admin/DataTable';

export default function AdminAuditLogs() {
  const logs = [
    { id: '1', admin: 'super_admin', action: 'BANNED_USER', target: 'user_u3', timestamp: '2026-06-10 14:02:11', ip: '192.168.1.1' },
    { id: '2', admin: 'super_admin', action: 'APPROVED_TEMPLATE', target: 'template_t1', timestamp: '2026-06-10 13:45:00', ip: '192.168.1.1' },
    { id: '3', admin: 'system', action: 'PAYOUT_PROCESSED', target: 'payout_p2', timestamp: '2026-06-09 00:01:00', ip: 'internal' },
    { id: '4', admin: 'moderator_1', action: 'DELETED_COMMENT', target: 'comment_c99', timestamp: '2026-06-08 18:20:15', ip: '10.0.0.5' },
  ];

  return (
    <>
      <PageHeader 
        title="Audit Logs" 
        description="Immutable record of administrative actions."
        actions={<button className="px-3 py-1.5 border border-white/10 text-white text-sm rounded-md hover:bg-white/10">Export CSV</button>}
      />

      <DataTable 
        data={logs}
        columns={[
          { key: 'timestamp', header: 'Timestamp', render: (r) => <span className="font-mono text-gray-500 text-xs">{r.timestamp}</span> },
          { key: 'admin', header: 'Actor', render: (r) => <span className="font-semibold text-white">{r.admin}</span> },
          { key: 'action', header: 'Action', render: (r) => <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs font-mono text-gray-300">{r.action}</span> },
          { key: 'target', header: 'Target ID', render: (r) => <span className="text-gray-400">{r.target}</span> },
          { key: 'ip', header: 'IP Address', render: (r) => <span className="font-mono text-gray-500 text-xs">{r.ip}</span> },
        ]}
      />
    </>
  );
}
