"use client";
import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, Cell } from 'recharts';
import { useTranslation } from '../../../lib/i18n';
import { useUIStore } from '../../../store';

export function UsageTab() {
  const [timeRange, setTimeRange] = useState<'7d'|'30d'>('7d');
  const { t } = useTranslation();
  const isLuxury = useUIStore(state => state.preferences?.skin === 'LUXURY');

  const usageData = [
    { date: '15 Jun', credits: 120 },
    { date: '16 Jun', credits: 240 },
    { date: '17 Jun', credits: 180 },
    { date: '18 Jun', credits: 450 },
    { date: '19 Jun', credits: 300 },
    { date: '20 Jun', credits: 800 },
    { date: '21 Jun', credits: 210 },
  ];

  const modelUsageData = [
    { name: t('billing.usage.imageGen'), value: 1200, fill: '#8b5cf6' },
    { name: 'Text', value: 800, fill: '#3b82f6' },
    { name: 'Video', value: 1500, fill: '#ec4899' },
  ];

  const categories = [
    {
      title: t('billing.usage.imageGen'),
      models: [
        { name: 'Flux Pro', limit: 500, used: 127, access: true, type: 'Premium' },
        { name: 'Stable Diffusion XL', limit: 2000, used: 1840, access: true, type: 'Standard' },
        { name: 'Imagen 4', limit: 100, used: 0, access: false, type: 'Enterprise' },
      ]
    },
    {
      title: "Video Generation",
      models: [
        { name: 'Veo', limit: 50, used: 12, access: true, type: 'Premium' },
        { name: 'Kling', limit: 10, used: 10, access: false, type: 'Pro' },
      ]
    },
    {
      title: "Text Models",
      models: [
        { name: 'Gemini 1.5 Pro', limit: 1000, used: 450, access: true, type: 'Premium' },
        { name: 'Claude 3.5 Sonnet', limit: 500, used: 490, access: true, type: 'Premium' },
      ]
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in">
      
      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#0a0a0a] border border-black/10 dark:border-white/10 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">{t('billing.usage.chartTitle')}</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={usageData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCredits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}`} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(0,0,0,0.8)', color: '#fff' }} />
                <Area type="monotone" dataKey="credits" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorCredits)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0a0a0a] border border-black/10 dark:border-white/10 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Expenses by Category</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={modelUsageData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} layout="vertical">
                <XAxis type="number" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(0,0,0,0.8)', color: '#fff' }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {modelUsageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Models Detailed Breakdown */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">{t('billing.usage.title')}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {categories.map((cat, i) => (
            <div key={i} className="bg-white dark:bg-[#0a0a0a] border border-black/10 dark:border-white/10 rounded-2xl p-6 shadow-sm">
              <h3 className="text-md font-semibold text-slate-900 dark:text-white border-b border-black/10 dark:border-white/10 pb-3 mb-4">{cat.title}</h3>
              <div className="space-y-6">
                {cat.models.map((model, j) => {
                  const percent = (model.used / model.limit) * 100;
                  const isWarning = percent > 85;
                  const isExhausted = percent >= 100;

                  return (
                    <div key={j} className={!model.access ? "opacity-50" : ""}>
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-900 dark:text-white text-sm">{model.name}</span>
                          {!model.access && <span className="text-[10px] bg-black/10 dark:bg-white/10 px-1.5 py-0.5 rounded text-slate-500">Upgrade required</span>}
                        </div>
                        {model.access && (
                          <span className={`text-xs font-semibold ${isExhausted ? 'text-red-500' : isWarning ? 'text-amber-500' : 'text-slate-500 dark:text-gray-400'}`}>
                            {model.used} / {model.limit}
                          </span>
                        )}
                      </div>
                      
                      {model.access ? (
                        <>
                          <div className="w-full bg-slate-100 dark:bg-white/10 rounded-full h-1.5 mt-2">
                            <div 
                              className={`h-1.5 rounded-full ${isExhausted ? 'bg-red-500' : isWarning ? 'bg-amber-500' : (isLuxury ? 'bg-[#D4AF37]' : 'bg-indigo-500')}`} 
                              style={{ width: `${Math.min(percent, 100)}%` }}
                            ></div>
                          </div>
                          {isWarning && !isExhausted && <p className="text-[10px] text-amber-500 mt-1">Limit almost reached</p>}
                          {isExhausted && <p className="text-[10px] text-red-500 mt-1">Limit reached.</p>}
                        </>
                      ) : (
                        <p className="text-xs text-slate-400 mt-1">Model unavailable.</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
