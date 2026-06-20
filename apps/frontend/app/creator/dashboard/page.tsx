import React from 'react';

export default function CreatorDashboardPage() {
  return (
    <div className="min-h-screen bg-background dark:bg-background text-foreground dark:text-foreground p-8">
      <div className="w-full">
        <h1 className="text-3xl font-bold mb-8">Creator Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-primary dark:bg-card p-6 rounded-2xl border border-border dark:border-border shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Earnings</h3>
            <p className="text-4xl font-bold text-green-500">$1,240.50</p>
          </div>
          <div className="bg-primary dark:bg-card p-6 rounded-2xl border border-border dark:border-border shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Downloads</h3>
            <p className="text-4xl font-bold">14,203</p>
          </div>
          <div className="bg-primary dark:bg-card p-6 rounded-2xl border border-border dark:border-border shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Followers</h3>
            <p className="text-4xl font-bold text-blue-500">892</p>
          </div>
        </div>

        <div className="bg-primary dark:bg-card rounded-2xl border border-border dark:border-border p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">My Templates</h2>
            <button className="bg-blue-600 hover:bg-blue-700 text-foreground px-4 py-2 rounded-lg font-medium transition-colors">
              + New Template
            </button>
          </div>
          
          <div className="text-center text-muted-foreground py-12">
            Table of templates will be displayed here...
          </div>
        </div>
      </div>
    </div>
  );
}
