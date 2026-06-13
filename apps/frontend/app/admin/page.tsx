"use client";
import React, { useEffect, useState } from 'react';
import { PageHeader } from '../../components/admin/PageHeader';
import { adminApi } from '../../lib/admin.api';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    adminApi.getDashboardStats().then(setStats).catch(console.error);
  }, []);

  const kpis = [
    { label: 'Total Revenue', value: stats ? `$${stats.revenue.toFixed(2)}` : '...', trend: '+0.0%' },
    { label: 'Total Users', value: stats ? stats.users.toString() : '...', trend: '+0.0%' },
    { label: 'Total Templates', value: stats ? stats.templates.toString() : '...', trend: '+0.0%' },
    { label: 'Total Generations', value: stats ? stats.generations.toString() : '...', trend: '+0.0%' },
  ];

  return (
    <>
      <PageHeader 
        title="Dashboard" 
        description="Overview of your platform's performance"
        actions={<button className="px-3 py-1.5 bg-white text-black text-sm font-medium rounded-md hover:bg-gray-200">Download Report</button>}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map((kpi, i) => (
          <div key={i} className="p-5 border border-white/10 rounded-lg bg-[#0a0a0a]">
            <p className="text-sm text-gray-500 mb-1">{kpi.label}</p>
            <div className="flex items-end justify-between">
              <h3 className="text-2xl font-semibold text-white tracking-tight">{kpi.value}</h3>
              <span className={`text-xs font-medium text-gray-500`}>
                {kpi.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Area Mock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 border border-white/10 rounded-lg bg-[#0a0a0a] p-6 h-80 flex flex-col">
          <h3 className="text-sm font-medium text-gray-400 mb-4">Revenue Overview</h3>
          <div className="flex-1 border-b border-l border-white/10 relative flex items-end justify-between px-4 pb-2">
            {/* Fake bars */}
            {[40, 60, 45, 80, 50, 90, 70].map((h, i) => (
              <div key={i} className="w-12 bg-white/20 rounded-t-sm hover:bg-white/40 transition-colors cursor-pointer" style={{ height: `${h}%` }}></div>
            ))}
          </div>
        </div>

        <div className="border border-white/10 rounded-lg bg-[#0a0a0a] p-6 h-80 flex flex-col">
          <h3 className="text-sm font-medium text-gray-400 mb-4">AI Model Usage</h3>
          <div className="flex-1 flex flex-col gap-4">
             <div className="space-y-1"><div className="flex justify-between text-sm"><span>SDXL 1.0</span><span>45%</span></div><div className="w-full h-2 bg-white/10 rounded-full"><div className="w-[45%] h-full bg-white rounded-full"></div></div></div>
             <div className="space-y-1"><div className="flex justify-between text-sm"><span>DALL-E 3</span><span>30%</span></div><div className="w-full h-2 bg-white/10 rounded-full"><div className="w-[30%] h-full bg-gray-400 rounded-full"></div></div></div>
             <div className="space-y-1"><div className="flex justify-between text-sm"><span>Midjourney API</span><span>15%</span></div><div className="w-full h-2 bg-white/10 rounded-full"><div className="w-[15%] h-full bg-gray-500 rounded-full"></div></div></div>
             <div className="space-y-1"><div className="flex justify-between text-sm"><span>ComfyUI</span><span>10%</span></div><div className="w-full h-2 bg-white/10 rounded-full"><div className="w-[10%] h-full bg-gray-600 rounded-full"></div></div></div>
          </div>
        </div>
      </div>
    </>
  );
}
