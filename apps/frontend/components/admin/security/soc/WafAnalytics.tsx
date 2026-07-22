import { BentoCard } from "../../BentoCard";
import { Shield, CheckCircle2, XCircle } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useTranslation } from "@/lib/i18n";

export default function WafAnalytics({ data }: { data: any }) {
  const { t } = useTranslation();
  const chartData = data.topRules.map((r: any) => ({
    name: r.name,
    value: r.hits,
  }));
  const COLORS = ["#34d399", "#3b82f6", "#fbbf24", "#f43f5e", "#a78bfa"];

  return (
    <BentoCard className="h-full flex flex-col" delay={0.1}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-semibold tracking-wide text-white uppercase flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            {t("soc.waf.title") || "WAF Analytics"}
          </h3>
          <p className="text-xs text-white/40 mt-1">
            {t("soc.waf.subtitle") || "Web Application Firewall Status"}
          </p>
        </div>
        <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full text-[10px] font-bold tracking-wider">
          {data.status}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 flex-1">
        {/* Left: Stats */}
        <div className="grid grid-cols-2 gap-4 w-full md:w-1/2">
          <div className="bg-white/5 p-4 rounded-xl border border-white/5">
            <span className="text-[10px] text-white/40 uppercase font-bold">
              {t("soc.waf.rulesEnabled") || "Rules Enabled"}
            </span>
            <div className="text-2xl font-bold text-white mt-1">
              {data.rulesEnabled}
            </div>
          </div>
          <div className="bg-white/5 p-4 rounded-xl border border-white/5">
            <span className="text-[10px] text-white/40 uppercase font-bold">
              {t("soc.waf.customRules") || "Custom Rules"}
            </span>
            <div className="text-2xl font-bold text-white mt-1">
              {data.customRules}
            </div>
          </div>
          <div className="bg-white/5 p-4 rounded-xl border border-white/5">
            <span className="text-[10px] text-white/40 uppercase font-bold">
              {t("soc.waf.detectionAcc") || "Detection Acc"}
            </span>
            <div className="text-2xl font-bold text-emerald-400 mt-1">
              {data.detectionAccuracy}
            </div>
          </div>
          <div className="bg-white/5 p-4 rounded-xl border border-white/5">
            <span className="text-[10px] text-white/40 uppercase font-bold">
              {t("soc.waf.totalHits") || "Total Rule Hits"}
            </span>
            <div className="text-2xl font-bold text-amber-400 mt-1">
              {data.ruleHits}
            </div>
          </div>
        </div>

        {/* Right: Pie Chart for Top Rules */}
        <div className="w-full md:w-1/2 flex items-center justify-center">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f0f0f",
                    border: "1px solid #ffffff10",
                    borderRadius: "8px",
                  }}
                  itemStyle={{ fontSize: "12px", color: "#fff" }}
                />
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-white/40 text-sm">{t("soc.waf.noRules") || "No WAF rules triggered"}</div>
          )}
        </div>
      </div>
    </BentoCard>
  );
}
