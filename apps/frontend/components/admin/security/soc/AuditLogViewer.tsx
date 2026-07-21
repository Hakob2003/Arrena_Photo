import { useState, useEffect } from "react";
import { BentoCard } from "../../BentoCard";
import { socApi } from "@/lib/soc.api";
import { formatDistanceToNow } from "date-fns";
import { FileText, User } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AuditLogViewer() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState("ALL");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await socApi.getAuditLog({
        page,
        limit: 15,
        action: action === "ALL" ? undefined : action,
      });
      setLogs(data.logs);
      setTotal(data.total);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, action]);

  return (
    <BentoCard delay={0.3}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-white/60" />
          <div>
            <h3 className="text-sm font-semibold tracking-wide text-white uppercase">
              System Audit Log
            </h3>
            <p className="text-xs text-white/40 mt-1">Total events: {total}</p>
          </div>
        </div>

        <Select
          value={action}
          onValueChange={(v) => {
            if (v) {
              setAction(v);
              setPage(1);
            }
          }}
        >
          <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-xs focus:ring-0">
            <SelectValue placeholder="Action" />
          </SelectTrigger>
          <SelectContent className="bg-[#0f0f0f] border-white/10 text-white max-h-[300px]">
            <SelectItem value="ALL">All Actions</SelectItem>
            <SelectItem value="LOGIN_SUCCESS">Login Success</SelectItem>
            <SelectItem value="LOGIN_FAILED">Login Failed</SelectItem>
            <SelectItem value="PASSWORD_RESET">Password Reset</SelectItem>
            <SelectItem value="ROLE_CHANGED">Role Changed</SelectItem>
            <SelectItem value="SETTINGS_UPDATED">Settings Updated</SelectItem>
            <SelectItem value="BILLING_UPDATED">Billing Updated</SelectItem>
            <SelectItem value="API_KEY_CREATED">API Key Created</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-white/10 text-[10px] font-bold text-white/40 uppercase tracking-wider">
              <th className="p-3">Time</th>
              <th className="p-3">Action</th>
              <th className="p-3">User</th>
              <th className="p-3">IP Address</th>
              <th className="p-3">Details</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-white/40">
                  Loading audit logs...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-white/40">
                  No logs found.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr
                  key={log.id}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="p-3 text-xs text-white/60">
                    {formatDistanceToNow(new Date(log.createdAt), {
                      addSuffix: true,
                    })}
                  </td>
                  <td className="p-3">
                    <span className="inline-flex items-center px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] font-bold text-white/80">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <User className="w-3 h-3 text-white/40" />
                      <span className="text-xs font-medium text-white">
                        {log.user?.email || log.userId}
                      </span>
                    </div>
                  </td>
                  <td className="p-3 text-xs font-mono text-white/60">
                    {log.ipAddress}
                  </td>
                  <td
                    className="p-3 text-xs text-white/40 max-w-[200px] truncate"
                    title={log.details}
                  >
                    {log.details || "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {total > 15 && (
        <div className="flex justify-between items-center mt-6">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-50 text-xs font-bold uppercase rounded-lg transition-colors"
          >
            Previous
          </button>
          <span className="text-xs text-white/40">
            Page {page} of {Math.ceil(total / 15)}
          </span>
          <button
            disabled={page >= Math.ceil(total / 15)}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-50 text-xs font-bold uppercase rounded-lg transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </BentoCard>
  );
}
