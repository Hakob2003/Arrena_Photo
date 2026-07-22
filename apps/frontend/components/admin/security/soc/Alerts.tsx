import { useState, useEffect } from "react";
import { BentoCard } from "../../BentoCard";
import { socApi } from "@/lib/soc.api";
import { formatDistanceToNow } from "date-fns";
import { AlertOctagon, AlertTriangle, Info, ShieldAlert } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "@/lib/i18n";

export default function Alerts() {
  const { t } = useTranslation();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [severity, setSeverity] = useState("ALL");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const data = await socApi.getAlerts({
        page,
        limit: 10,
        severity: severity === "ALL" ? undefined : severity,
      });
      setAlerts(data.alerts);
      setTotal(data.total);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [page, severity]);

  const getSeverityInfo = (score: number) => {
    if (score >= 90)
      return {
        label: "CRITICAL",
        color: "text-rose-500 bg-rose-500/10 border-rose-500/20",
        icon: <ShieldAlert className="w-4 h-4" />,
      };
    if (score >= 70)
      return {
        label: "HIGH",
        color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
        icon: <AlertOctagon className="w-4 h-4" />,
      };
    if (score >= 40)
      return {
        label: "MEDIUM",
        color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
        icon: <AlertTriangle className="w-4 h-4" />,
      };
    return {
      label: "LOW",
      color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
      icon: <Info className="w-4 h-4" />,
    };
  };

  return (
    <BentoCard delay={0.5}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h3 className="text-sm font-semibold tracking-wide text-white uppercase">
            {t("soc.alerts.title") || "Security Alerts"}
          </h3>
          <p className="text-xs text-white/40 mt-1">{t("soc.alerts.total") || "Total alerts:"} {total}</p>
        </div>

        <Select
          value={severity}
          onValueChange={(v) => {
            if (v) {
              setSeverity(v);
              setPage(1);
            }
          }}
        >
          <SelectTrigger className="w-[150px] bg-white/5 border-white/10 text-xs focus:ring-0">
            <SelectValue placeholder={t("soc.alerts.severity") || "Severity"} />
          </SelectTrigger>
          <SelectContent className="bg-[#0f0f0f] border-white/10 text-white">
            <SelectItem value="ALL">{t("soc.alerts.allSev") || "All Severities"}</SelectItem>
            <SelectItem value="CRITICAL">{t("soc.alerts.critical") || "Critical"}</SelectItem>
            <SelectItem value="HIGH">{t("soc.alerts.high") || "High"}</SelectItem>
            <SelectItem value="MEDIUM">{t("soc.alerts.medium") || "Medium"}</SelectItem>
            <SelectItem value="LOW">{t("soc.alerts.low") || "Low"}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-white/10 text-[10px] font-bold text-white/40 uppercase tracking-wider">
              <th className="p-3">{t("soc.alerts.colSev") || "Severity"}</th>
              <th className="p-3">{t("soc.alerts.colTime") || "Time"}</th>
              <th className="p-3">{t("soc.alerts.colType") || "Type"}</th>
              <th className="p-3">{t("soc.alerts.colTarget") || "Target"}</th>
              <th className="p-3">{t("soc.alerts.colIp") || "IP / Actor"}</th>
              <th className="p-3">{t("soc.alerts.colAction") || "Action Taken"}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-white/40">
                  {t("soc.alerts.loading") || "Loading alerts..."}
                </td>
              </tr>
            ) : alerts.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-white/40">
                  {t("soc.alerts.empty") || "No alerts found."}
                </td>
              </tr>
            ) : (
              alerts.map((a) => {
                const sev = getSeverityInfo(a.riskScore);
                return (
                  <tr
                    key={a.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="p-3">
                      <div
                        className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-md border text-[10px] font-bold tracking-wider ${sev.color}`}
                      >
                        {sev.icon} {sev.label}
                      </div>
                    </td>
                    <td className="p-3 text-xs text-white/60">
                      {formatDistanceToNow(new Date(a.createdAt), {
                        addSuffix: true,
                      })}
                    </td>
                    <td className="p-3 text-sm font-medium text-white">
                      {a.attackType}
                    </td>
                    <td className="p-3 text-xs font-mono text-white/60">
                      {a.endpoint || "-"}
                    </td>
                    <td className="p-3 text-xs font-mono text-white/80">
                      {a.ip}
                    </td>
                    <td className="p-3">
                      {a.isBlocked ? (
                        <span className="text-xs font-bold text-rose-400">
                          {t("soc.alerts.blocked") || "Blocked"}
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-amber-400">
                          {t("soc.alerts.monitored") || "Monitored"}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {total > 10 && (
        <div className="flex justify-between items-center mt-6">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-50 text-xs font-bold uppercase rounded-lg transition-colors"
          >
            {t("soc.alerts.prev") || "Previous"}
          </button>
          <span className="text-xs text-white/40">
            {t("soc.alerts.page") || "Page"} {page} {t("soc.alerts.of") || "of"} {Math.ceil(total / 10)}
          </span>
          <button
            disabled={page >= Math.ceil(total / 10)}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-50 text-xs font-bold uppercase rounded-lg transition-colors"
          >
            {t("soc.alerts.next") || "Next"}
          </button>
        </div>
      )}
    </BentoCard>
  );
}
