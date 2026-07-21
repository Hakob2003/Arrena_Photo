"use client";
import React, { useEffect, useState } from "react";
import { PageHeader } from "../../../components/admin/PageHeader";
import { BentoCard } from "../../../components/admin/BentoCard";
import {
  TrendingUp,
  PieChart,
  Map,
  DollarSign,
  Activity,
  Users,
  Zap,
} from "lucide-react";
import { adminApi } from "../../../lib/admin.api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from "recharts";

export default function AdminAnalytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .getAnalytics()
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Analytics"
          description="Deep dive into platform metrics."
        />
        <div className="p-8 text-slate-500 dark:text-gray-400 text-center">
          Loading analytics data...
        </div>
      </div>
    );
  }

  const COLORS = [
    "#6366f1",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Deep dive into platform metrics."
      />

      <div className="flex flex-wrap gap-4 lg:gap-6">
        {/* Main Chart Card */}
        <BentoCard
          colSpan={0}
          rowSpan={0}
          delay={0.1}
          className="w-full lg:w-[calc(66%-12px)] min-h-[400px]"
        >
          <div className="flex items-start gap-2 opacity-50 mb-6">
            <TrendingUp className="w-4 h-4 flex-shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wide whitespace-nowrap">
              Generations Over Time (30 Days)
            </span>
          </div>
          <div className="flex-1 flex flex-col h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.generationsOverTime || []}>
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
                  dy={10}
                />
                <YAxis
                  stroke="#ffffff40"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  dx={-10}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                  }}
                  itemStyle={{ color: "#fff" }}
                />
                <Line
                  type="monotone"
                  dataKey="success"
                  name="Successful"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="failed"
                  name="Failed"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </BentoCard>

        {/* Mini Stats Card */}
        <BentoCard
          colSpan={0}
          rowSpan={0}
          delay={0.2}
          gradient="from-purple-500/10 to-transparent"
          className="w-full sm:w-[calc(50%-8px)] lg:w-[calc(34%-12px)] min-h-[200px]"
        >
          <div className="flex flex-col h-full justify-between gap-4">
            <div className="flex items-start gap-2 opacity-50">
              <Zap className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs font-bold uppercase tracking-wide whitespace-nowrap">
                Active Models (30 Days)
              </span>
            </div>
            <div>
              <div className="text-4xl font-bold tracking-tight text-white mb-1">
                {data?.activeModels?.count || 0}
              </div>
              <p
                className={`text-xs font-mono tracking-wide ${data?.activeModels?.diff >= 0 ? "text-green-400" : "text-red-400"}`}
              >
                {data?.activeModels?.diff > 0 ? "+" : ""}
                {data?.activeModels?.diff} vs previous 30 days
              </p>
            </div>
          </div>
        </BentoCard>

        {/* Model Distribution Card */}
        <BentoCard
          colSpan={0}
          rowSpan={0}
          delay={0.3}
          className="w-full sm:w-[calc(50%-8px)] lg:w-[calc(33%-16px)] min-h-[300px]"
        >
          <div className="flex items-start gap-2 opacity-50 mb-2">
            <PieChart className="w-4 h-4 flex-shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wide whitespace-nowrap">
              Model Distribution
            </span>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center h-[200px]">
            {!data?.modelDistribution || data.modelDistribution.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-gray-400">
                No data available
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={data.modelDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {data.modelDistribution.map((entry: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#111",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                    }}
                    itemStyle={{ color: "#fff" }}
                    formatter={(value: number, name: string) => [
                      `${value}%`,
                      name,
                    ]}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="mt-2 text-xs text-slate-400 dark:text-gray-500">
            {(data?.modelDistribution || [])
              .slice(0, 3)
              .map((m: any, i: number) => (
                <div key={i} className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: COLORS[i % COLORS.length] }}
                    ></div>
                    <span className="truncate max-w-[120px]">{m.name}</span>
                  </div>
                  <span>{m.value}%</span>
                </div>
              ))}
          </div>
        </BentoCard>

        {/* User Geography Card */}
        <BentoCard
          colSpan={0}
          rowSpan={0}
          delay={0.4}
          className="w-full sm:w-[calc(50%-8px)] lg:w-[calc(33%-16px)] min-h-[300px]"
        >
          <div className="flex items-start gap-2 opacity-50 mb-6">
            <Map className="w-4 h-4 flex-shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wide whitespace-nowrap">
              Top Geographies
            </span>
          </div>
          <div className="flex-1 flex flex-col justify-start h-full mt-2">
            {!data?.userGeography || data.userGeography.length === 0 ? (
              <div className="text-center opacity-40 mt-10">
                <Map className="w-12 h-12 mb-4 text-white/20 mx-auto" />
                <p className="text-sm font-medium tracking-wide">
                  No location data found
                </p>
              </div>
            ) : (
              <div className="space-y-4 w-full">
                {data.userGeography.map((geo: any, i: number) => {
                  const maxVal = Math.max(
                    ...data.userGeography.map((g: any) => g.users),
                  );
                  const percentage = Math.round((geo.users / maxVal) * 100);
                  return (
                    <div key={i} className="w-full">
                      <div className="flex justify-between text-sm mb-1 text-slate-300">
                        <span>{geo.country}</span>
                        <span className="font-mono text-xs">{geo.users}</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </BentoCard>

        {/* Revenue by Category Card */}
        <BentoCard
          colSpan={0}
          rowSpan={0}
          delay={0.5}
          gradient="from-emerald-500/10 to-transparent"
          className="w-full sm:w-[calc(50%-8px)] lg:w-[calc(34%-16px)] min-h-[300px]"
        >
          <div className="flex items-start gap-2 opacity-50 mb-6">
            <DollarSign className="w-4 h-4 flex-shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wide whitespace-nowrap">
              Revenue Distribution
            </span>
          </div>
          <div className="flex-1 flex flex-col justify-center h-full">
            {data?.revenueDistribution?.map((item: any, i: number) => {
              const total = data.revenueDistribution.reduce(
                (a: any, b: any) => a + b.value,
                0,
              );
              const percentage = total > 0 ? (item.value / total) * 100 : 0;
              const bgColors = [
                "bg-emerald-500",
                "bg-blue-500",
                "bg-purple-500",
              ];
              return (
                <div key={i} className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-300">{item.name}</span>
                    <span className="font-mono font-medium">
                      ${item.value.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${bgColors[i % bgColors.length]} rounded-full`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </BentoCard>
      </div>
    </div>
  );
}
