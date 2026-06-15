"use client";
import React, { useEffect, useState } from 'react';
import { PageHeader } from '../../components/admin/PageHeader';
import { adminApi } from '../../lib/admin.api';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    adminApi.getDashboardStats().then(setStats).catch(console.error);
  }, []);

  const kpis = [
    { label: 'Total Revenue', value: stats ? `$${stats.revenue.toFixed(2)}` : '...', trend: 'All Time' },
    { label: 'Total Users', value: stats ? stats.users.toString() : '...', trend: stats ? `+${stats.newUsers.week} this week` : '...' },
    { label: 'Total Templates', value: stats ? stats.templates.toString() : '...', trend: 'All Time' },
    { label: 'Total Generations', value: stats ? stats.generations.total.toString() : '...', trend: stats ? `${((stats.generations.success / (stats.generations.total || 1)) * 100).toFixed(1)}% success` : '...' },
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
              <span className="text-xs font-medium text-gray-500">
                {kpi.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 border border-white/10 rounded-lg bg-[#0a0a0a] p-6 h-[400px] flex flex-col">
          <h3 className="text-sm font-medium text-gray-400 mb-4">Revenue & Generations Overview (7 Days)</h3>
          <div className="flex-1 w-full">
            {stats?.chartData ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorGen" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis dataKey="date" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111', borderColor: '#333', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="revenue" name="Revenue ($)" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorRev)" />
                  <Area type="monotone" dataKey="generations" name="Generations" stroke="#3b82f6" fillOpacity={1} fill="url(#colorGen)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-600">Loading chart...</div>
            )}
          </div>
        </div>

        <div className="border border-white/10 rounded-lg bg-[#0a0a0a] p-6 h-[400px] flex flex-col">
          <h3 className="text-sm font-medium text-gray-400 mb-4">User Growth</h3>
          <div className="flex-1 w-full">
            {stats?.chartData ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis dataKey="date" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{ fill: '#222' }}
                    contentStyle={{ backgroundColor: '#111', borderColor: '#333', color: '#fff' }}
                  />
                  <Bar dataKey="users" name="Active Users" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-600">Loading chart...</div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="border border-white/10 rounded-lg bg-[#0a0a0a] p-6">
          <h3 className="text-sm font-medium text-gray-400 mb-4">Popular Templates</h3>
          <div className="space-y-4">
            {stats?.popularTemplates?.length > 0 ? stats.popularTemplates.map((t: any) => (
              <div key={t.id} className="flex justify-between items-center pb-3 border-b border-white/5 last:border-0 last:pb-0">
                <span className="text-white font-medium">{t.name}</span>
                <span className="text-gray-400 text-sm">{t.downloadCount} downloads</span>
              </div>
            )) : (
              <div className="text-gray-600">No data available</div>
            )}
          </div>
        </div>

        <div className="border border-white/10 rounded-lg bg-[#0a0a0a] p-6">
          <h3 className="text-sm font-medium text-gray-400 mb-4">Generation Status</h3>
          <div className="flex gap-4">
             <div className="flex-1 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
               <div className="text-2xl font-bold text-green-400">{stats?.generations?.success || 0}</div>
               <div className="text-xs text-green-500/70 mt-1 uppercase">Successful</div>
             </div>
             <div className="flex-1 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-center">
               <div className="text-2xl font-bold text-red-400">{stats?.generations?.failed || 0}</div>
               <div className="text-xs text-red-500/70 mt-1 uppercase">Failed</div>
             </div>
          </div>
        </div>
      </div>
    </>
  );
}
