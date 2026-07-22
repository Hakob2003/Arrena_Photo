import { BentoCard } from "../../BentoCard";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Activity, ShieldAlert, Ban } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export default function ThreatAnalytics({ data }: { data: any }) {
  const { t } = useTranslation();
  const { totals, timeSeries } = data;

  return (
    <BentoCard className="h-full flex flex-col" delay={0.2}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-semibold tracking-wide text-white uppercase">
            {t("soc.threat.title") || "Threat Analytics"}
          </h3>
          <p className="text-xs text-white/40 mt-1">
            {t("soc.threat.subtitle") || "Request anomalies over time"}
          </p>
        </div>
        <div className="flex gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-white/40 uppercase font-bold flex items-center gap-1">
              <Activity className="w-3 h-3 text-emerald-400" /> {t("soc.threat.requests") || "Requests"}
            </span>
            <span className="text-lg font-bold text-white">
              {totals.rps} RPS
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-white/40 uppercase font-bold flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 text-amber-400" /> {t("soc.threat.suspicious") || "Suspicious"}
            </span>
            <span className="text-lg font-bold text-amber-400">
              {totals.suspicious}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-white/40 uppercase font-bold flex items-center gap-1">
              <Ban className="w-3 h-3 text-rose-400" /> {t("soc.threat.blocked") || "Blocked"}
            </span>
            <span className="text-lg font-bold text-rose-400">
              {totals.blocked}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={timeSeries}
            margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorSuspicious" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorBlocked" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#ffffff10"
              vertical={false}
            />
            <XAxis
              dataKey="time"
              stroke="#ffffff40"
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#ffffff40"
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0f0f0f",
                border: "1px solid #ffffff10",
                borderRadius: "8px",
              }}
              itemStyle={{ fontSize: "12px" }}
              labelStyle={{
                color: "#ffffff80",
                fontSize: "10px",
                marginBottom: "4px",
              }}
            />
            <Area
              type="monotone"
              dataKey="requests"
              stroke="#34d399"
              fillOpacity={1}
              fill="url(#colorRequests)"
            />
            <Area
              type="monotone"
              dataKey="suspicious"
              stroke="#fbbf24"
              fillOpacity={1}
              fill="url(#colorSuspicious)"
            />
            <Area
              type="monotone"
              dataKey="blocked"
              stroke="#f43f5e"
              fillOpacity={1}
              fill="url(#colorBlocked)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </BentoCard>
  );
}
