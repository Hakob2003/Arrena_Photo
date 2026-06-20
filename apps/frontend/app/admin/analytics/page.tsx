"use client";
import React from 'react';
import { PageHeader } from '../../../components/admin/PageHeader';

export default function AdminAnalytics() {
  return (
    <>
      <PageHeader 
        title="Analytics" 
        description="Deep dive into platform metrics."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-black/10 dark:border-white/10 rounded-lg bg-[#0a0a0a] p-6 h-96 flex flex-col items-center justify-center text-slate-400 dark:text-gray-500">
           <span className="text-4xl mb-4">📈</span>
           <p>Generations over Time (Chart Placeholder)</p>
        </div>
        <div className="border border-black/10 dark:border-white/10 rounded-lg bg-[#0a0a0a] p-6 h-96 flex flex-col items-center justify-center text-slate-400 dark:text-gray-500">
           <span className="text-4xl mb-4">🥧</span>
           <p>Model Distribution (Chart Placeholder)</p>
        </div>
        <div className="border border-black/10 dark:border-white/10 rounded-lg bg-[#0a0a0a] p-6 h-96 flex flex-col items-center justify-center text-slate-400 dark:text-gray-500">
           <span className="text-4xl mb-4">🗺️</span>
           <p>User Geography (Chart Placeholder)</p>
        </div>
        <div className="border border-black/10 dark:border-white/10 rounded-lg bg-[#0a0a0a] p-6 h-96 flex flex-col items-center justify-center text-slate-400 dark:text-gray-500">
           <span className="text-4xl mb-4">📊</span>
           <p>Revenue by Category (Chart Placeholder)</p>
        </div>
      </div>
    </>
  );
}
