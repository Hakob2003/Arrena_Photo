"use client";
import React, { useEffect, useState } from "react";
import { adminApi } from "../../lib/admin.api";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { BentoCard } from "../../components/admin/BentoCard";
import {
  Download,
  DollarSign,
  Users,
  CreditCard,
  Sparkles,
  Database,
  BarChart3,
  TrendingUp,
  Layers,
} from "lucide-react";
import { useTranslation } from "../../lib/i18n";

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    adminApi.getDashboardStats().then(setStats).catch(console.error);
  }, []);

  if (!stats) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-white" />
          <p className="text-sm font-medium text-white/50 tracking-widest uppercase">
            {t("admin.dashboard.loadingData") || "Loading Platform Data"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 min-h-screen max-w-[1600px] mx-auto text-slate-200">
      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tighter text-white mb-2">
            {t("admin.dashboard.title") || "Platform Overview"}
          </h1>
          <p className="text-sm font-medium text-white/40 uppercase tracking-widest">
            {t("admin.dashboard.subtitle") || "Key metrics and performance"}
          </p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 bg-white text-black text-sm font-bold rounded-full hover:bg-gray-200 transition-colors shadow-lg hover:shadow-white/20">
          <Download className="w-4 h-4" />
          {t("admin.dashboard.downloadReport") || "Download Report"}
        </button>
      </div>

      {/* Smart Resizing Bento Grid (Flexbox Based) */}
      <div className="flex flex-col gap-4 lg:gap-6 mt-4">
        {/* ROW 1: Quick KPIs */}
        <div className="flex flex-wrap gap-4 lg:gap-6">
          <BentoCard
            colSpan={0}
            rowSpan={0}
            delay={0.1}
            gradient="from-purple-500/20 to-transparent"
            className="flex-auto min-w-[200px]"
          >
            <div className="flex flex-col h-full justify-between gap-6">
              <div className="flex items-start justify-between opacity-50 gap-4">
                <span className="text-xs font-bold uppercase tracking-wide whitespace-nowrap">
                  {t("admin.dashboard.totalRevenue") || "Total Revenue"}
                </span>
                <DollarSign className="w-4 h-4 flex-shrink-0" />
              </div>
              <div className="flex items-end justify-between mt-4">
                <div className="text-5xl font-bold tracking-tight text-white">
                  ${stats.revenue.toFixed(2)}
                </div>
                <span className="text-xs font-medium text-purple-400 mb-1 whitespace-nowrap ml-2">
                  {t("admin.dashboard.allTime") || "All Time"}
                </span>
              </div>
            </div>
          </BentoCard>

          <BentoCard
            colSpan={0}
            rowSpan={0}
            delay={0.2}
            gradient="from-blue-500/20 to-transparent"
            className="flex-auto min-w-[200px]"
          >
            <div className="flex flex-col h-full justify-between gap-6">
              <div className="flex items-start justify-between opacity-50 gap-4">
                <span className="text-xs font-bold uppercase tracking-wide whitespace-nowrap">
                  {t("admin.dashboard.totalGenerations") || "Total Generations"}
                </span>
                <Sparkles className="w-4 h-4 flex-shrink-0" />
              </div>
              <div className="flex items-end justify-between mt-4">
                <div className="text-5xl font-bold tracking-tight text-white">
                  {stats.generations.total.toLocaleString()}
                </div>
                <span className="text-xs font-medium text-blue-400 mb-1 whitespace-nowrap ml-2">
                  {(
                    (stats.generations.success /
                      (stats.generations.total || 1)) *
                    100
                  ).toFixed(1)}
                  % {t("admin.dashboard.success") || "success"}
                </span>
              </div>
            </div>
          </BentoCard>

          <BentoCard
            colSpan={0}
            rowSpan={0}
            delay={0.3}
            gradient="from-emerald-500/20 to-transparent"
            className="flex-auto min-w-[200px]"
          >
            <div className="flex flex-col h-full justify-between gap-6">
              <div className="flex items-start justify-between opacity-50 gap-4">
                <span className="text-xs font-bold uppercase tracking-wide whitespace-nowrap">
                  {t("admin.dashboard.activeSubs") || "Active Subs"}
                </span>
                <CreditCard className="w-4 h-4 flex-shrink-0" />
              </div>
              <div>
                <div className="text-4xl font-bold tracking-tight text-white mt-4">
                  {stats.activeSubscriptions.toLocaleString()}
                </div>
                <p className="text-[10px] text-emerald-400/80 uppercase tracking-wider mt-1 whitespace-nowrap">
                  {t("admin.dashboard.payingUsers") || "Paying users"}
                </p>
              </div>
            </div>
          </BentoCard>

          <BentoCard
            colSpan={0}
            rowSpan={0}
            delay={0.4}
            gradient="from-rose-500/20 to-transparent"
            className="flex-auto min-w-[200px]"
          >
            <div className="flex flex-col h-full justify-between gap-6">
              <div className="flex items-start justify-between opacity-50 gap-4">
                <span className="text-xs font-bold uppercase tracking-wide whitespace-nowrap">
                  {t("admin.dashboard.totalUsers") || "Total Users"}
                </span>
                <Users className="w-4 h-4 flex-shrink-0" />
              </div>
              <div>
                <div className="text-4xl font-bold tracking-tight text-white mt-4">
                  {stats.users.toLocaleString()}
                </div>
                <p className="text-[10px] text-rose-400/80 uppercase tracking-wider mt-1 whitespace-nowrap">
                  +{stats.newUsers.week} {t("admin.dashboard.thisWeek") || "this week"}
                </p>
              </div>
            </div>
          </BentoCard>
        </div>

        {/* ROW 2 & 3: Main Charts */}
        <div className="flex flex-wrap gap-4 lg:gap-6">
          <BentoCard
            colSpan={0}
            rowSpan={0}
            delay={0.5}
            noPadding
            className="flex-[2] min-w-[300px]"
          >
            <div className="p-6 pb-2 flex items-center justify-between">
              <div className="flex items-start gap-2 opacity-50">
                <TrendingUp className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wide text-purple-400 whitespace-nowrap">
                  {t("admin.dashboard.revAndGen7Days") || "Revenue & Generations (7 Days)"}
                </span>
              </div>
            </div>
            <div className="flex-1 w-full h-[300px] px-2 pb-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={stats.chartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#c084fc" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#c084fc" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorGen" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#ffffff10"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    stroke="#ffffff40"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#ffffff40"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(10, 10, 10, 0.8)",
                      borderColor: "rgba(255,255,255,0.1)",
                      color: "#fff",
                      backdropFilter: "blur(10px)",
                      borderRadius: "12px",
                    }}
                    itemStyle={{ color: "#fff" }}
                  />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{ fontSize: "12px", opacity: 0.8 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name={t("admin.dashboard.revenueUsd") || "Revenue ($)"}
                    stroke="#c084fc"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRev)"
                  />
                  <Area
                    type="monotone"
                    dataKey="generations"
                    name={t("admin.dashboard.generations") || "Generations"}
                    stroke="#60a5fa"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorGen)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </BentoCard>

          <BentoCard
            colSpan={0}
            rowSpan={0}
            delay={0.6}
            noPadding
            className="flex-1 min-w-[300px]"
          >
            <div className="p-6 pb-2 flex items-center justify-between">
              <div className="flex items-start gap-2 opacity-50">
                <Database className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wide text-amber-400 whitespace-nowrap">
                  {t("admin.dashboard.tokensAndCredits") || "Tokens & Credits"}
                </span>
              </div>
            </div>
            <div className="flex-1 w-full h-[300px] px-2 pb-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={stats.chartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorTok" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorCred" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f87171" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#ffffff10"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    stroke="#ffffff40"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#ffffff40"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(10, 10, 10, 0.8)",
                      borderColor: "rgba(255,255,255,0.1)",
                      color: "#fff",
                      backdropFilter: "blur(10px)",
                      borderRadius: "12px",
                    }}
                    itemStyle={{ color: "#fff" }}
                  />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{ fontSize: "12px", opacity: 0.8 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="tokens"
                    name={t("admin.dashboard.tokens") || "Tokens"}
                    stroke="#fbbf24"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorTok)"
                  />
                  <Area
                    type="monotone"
                    dataKey="credits"
                    name={t("admin.dashboard.credits") || "Credits"}
                    stroke="#f87171"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorCred)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </BentoCard>
        </div>

        {/* ROW 4 & 5: Activity & Templates */}
        <div className="flex flex-wrap gap-4 lg:gap-6">
          <BentoCard
            colSpan={0}
            rowSpan={0}
            delay={0.7}
            className="flex-1 min-w-[300px] overflow-y-auto custom-scrollbar"
          >
            <div className="flex items-start gap-2 opacity-50 mb-6">
              <Layers className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs font-bold uppercase tracking-wide whitespace-nowrap">
                {t("admin.dashboard.popularTemplates") || "Popular Templates"}
              </span>
            </div>
            <div className="space-y-4">
              {stats.popularTemplates?.length > 0 ? (
                stats.popularTemplates.map((tpl: any, index: number) => (
                  <div
                    key={tpl.id}
                    className="flex justify-between items-center pb-3 border-b border-white/5 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold text-white/50 flex-shrink-0">
                        {index + 1}
                      </div>
                      <span className="text-white/80 font-medium whitespace-nowrap mr-4">
                        {tpl.name}
                      </span>
                    </div>
                    <span className="text-white/40 text-sm tabular-nums whitespace-nowrap">
                      {tpl.downloadCount} {t("admin.dashboard.dl") || "DL"}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-white/30 text-sm italic">
                  {t("admin.dashboard.noTemplateData") || "No template data available"}
                </div>
              )}
            </div>
          </BentoCard>

          <BentoCard
            colSpan={0}
            rowSpan={0}
            delay={0.8}
            noPadding
            className="flex-[2] min-w-[300px]"
          >
            <div className="p-6 pb-2 flex items-center justify-between">
              <div className="flex items-start gap-2 opacity-50">
                <BarChart3 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wide text-emerald-400 whitespace-nowrap">
                  {t("admin.dashboard.userActivityGrowth") || "User Activity Growth"}
                </span>
              </div>
            </div>
            <div className="flex-1 w-full h-[250px] px-2 pb-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.chartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#ffffff10"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    stroke="#ffffff40"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#ffffff40"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(255,255,255,0.05)" }}
                    contentStyle={{
                      backgroundColor: "rgba(10, 10, 10, 0.8)",
                      borderColor: "rgba(255,255,255,0.1)",
                      color: "#fff",
                      backdropFilter: "blur(10px)",
                      borderRadius: "12px",
                    }}
                  />
                  <Bar
                    dataKey="users"
                    name={t("admin.dashboard.activeUsers") || "Active Users"}
                    fill="#34d399"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </BentoCard>

          <div className="flex-1 min-w-[250px] flex flex-col gap-4 lg:gap-6 h-full">
            <BentoCard
              colSpan={0}
              rowSpan={0}
              delay={0.9}
              gradient="from-zinc-500/10 to-transparent"
              className="flex-1"
            >
              <div className="flex items-start justify-between opacity-50 mb-4 gap-4">
                <span className="text-xs font-bold uppercase tracking-wide whitespace-nowrap">
                  {t("admin.dashboard.generationStatus") || "Generation Status"}
                </span>
              </div>
              <div className="flex gap-4 h-full">
                <div className="flex-1 flex flex-col justify-center items-center p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                  <div className="text-3xl font-bold text-emerald-400">
                    {stats.generations.success}
                  </div>
                  <div className="text-[10px] text-emerald-500/70 mt-1 uppercase font-bold tracking-wider whitespace-nowrap">
                    {t("admin.dashboard.successStatus") || "Success"}
                  </div>
                </div>
                <div className="flex-1 flex flex-col justify-center items-center p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
                  <div className="text-3xl font-bold text-rose-400">
                    {stats.generations.failed}
                  </div>
                  <div className="text-[10px] text-rose-500/70 mt-1 uppercase font-bold tracking-wider whitespace-nowrap">
                    {t("admin.dashboard.failedStatus") || "Failed"}
                  </div>
                </div>
              </div>
            </BentoCard>

            <BentoCard
              colSpan={0}
              rowSpan={0}
              delay={1.0}
              gradient="from-indigo-500/10 to-transparent"
              className="flex-1"
            >
              <div className="flex flex-col h-full justify-between gap-6">
                <div className="flex items-start justify-between opacity-50 gap-4">
                  <span className="text-xs font-bold uppercase tracking-wide whitespace-nowrap">
                    {t("admin.dashboard.totalApiTokens") || "Total API Tokens"}
                  </span>
                  <Database className="w-4 h-4 flex-shrink-0" />
                </div>
                <div>
                  <div className="text-4xl font-bold tracking-tight text-white mt-4">
                    {stats.apiTokensUsed.toLocaleString()}
                  </div>
                  <p className="text-[10px] text-indigo-400/80 uppercase tracking-wider mt-1 whitespace-nowrap">
                    {t("admin.dashboard.platformUsage") || "Overall platform usage"}
                  </p>
                </div>
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  );
}
