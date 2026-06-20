"use client";
import React, { useEffect, useState } from 'react';
import { PageHeader } from '../../../components/admin/PageHeader';
import { DataTable } from '../../../components/admin/DataTable';
import { adminApi } from '../../../lib/admin.api';

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getAuditLogs(1, 50).then((data) => {
      const formatted = data.logs.map((l: any) => ({
        id: l.id,
        admin: l.user?.email || 'SYSTEM',
        action: l.action,
        target: JSON.stringify(l.details),
        timestamp: new Date(l.createdAt).toLocaleString('en-US'),
        ip: l.details?.ip || 'internal',
      }));
      setLogs(formatted);
      setLoading(false);
    }).catch(console.error);
  }, []);

  return (
    <>
      <PageHeader 
        title="Audit Logs" 
        description="Immutable record of administrative actions."
        actions={<button className="px-3 py-1.5 border border-border text-foreground text-sm rounded-md hover:bg-muted/50">Export CSV</button>}
      />

      {loading ? (
        <div className="text-muted-foreground p-8 text-center">Loading audit logs...</div>
      ) : (
        <DataTable 
          data={logs}
          columns={[
            { key: 'timestamp', header: 'Timestamp', render: (r: any) => <span className="font-mono text-muted-foreground text-xs">{r.timestamp}</span> },
            { key: 'admin', header: 'Actor', render: (r: any) => <span className="font-semibold text-foreground">{r.admin}</span> },
            { key: 'action', header: 'Action', render: (r: any) => <span className="px-2 py-1 bg-muted border border-border rounded text-xs font-mono text-muted-foreground">{r.action}</span> },
            { key: 'target', header: 'Details', render: (r: any) => <span className="text-muted-foreground text-xs truncate max-w-xs block">{r.target}</span> },
            { key: 'ip', header: 'IP', render: (r: any) => <span className="font-mono text-muted-foreground text-xs">{r.ip}</span> },
          ]}
        />
      )}
    </>
  );
}
