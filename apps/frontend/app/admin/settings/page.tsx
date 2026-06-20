"use client";
import React from 'react';
import { PageHeader } from '../../../components/admin/PageHeader';

export default function AdminSettings() {
  return (
    <>
      <PageHeader 
        title="Platform Settings" 
        description="Global configuration and flags."
      />

      <div className="space-y-6 max-w-3xl">
        <div className="p-6 border border-black/10 dark:border-white/10 rounded-lg bg-[#0a0a0a]">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-900 dark:text-white mb-4">General Configuration</h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-300 block mb-1">Platform Name</label>
              <input type="text" defaultValue="AI Template Studio" className="w-full bg-[#fafafa] dark:bg-black border border-black/10 dark:border-white/10 rounded-md p-2 text-sm text-slate-900 dark:text-slate-900 dark:text-white outline-none focus:border-white/30" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300 block mb-1">Support Email</label>
              <input type="email" defaultValue="support@studio.ai" className="w-full bg-[#fafafa] dark:bg-black border border-black/10 dark:border-white/10 rounded-md p-2 text-sm text-slate-900 dark:text-slate-900 dark:text-white outline-none focus:border-white/30" />
            </div>
          </div>
        </div>

        <div className="p-6 border border-black/10 dark:border-white/10 rounded-lg bg-[#0a0a0a]">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-900 dark:text-white mb-4">Feature Flags</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-900 dark:text-white">Public Registrations</p>
                <p className="text-xs text-slate-400 dark:text-gray-500">Allow new users to sign up.</p>
              </div>
              <input type="checkbox" defaultChecked className="rounded bg-[#fafafa] dark:bg-black border-black/20 dark:border-white/20" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-900 dark:text-white">Require Email Verification</p>
                <p className="text-xs text-slate-400 dark:text-gray-500">Users must verify email before generating.</p>
              </div>
              <input type="checkbox" defaultChecked className="rounded bg-[#fafafa] dark:bg-black border-black/20 dark:border-white/20" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-900 dark:text-white">Maintenance Mode</p>
                <p className="text-xs text-slate-400 dark:text-gray-500">Disable platform access for all non-admins.</p>
              </div>
              <input type="checkbox" className="rounded bg-[#fafafa] dark:bg-black border-black/20 dark:border-white/20" />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button className="px-4 py-2 bg-white text-black font-medium text-sm rounded-md hover:bg-gray-200">Save Changes</button>
        </div>
      </div>
    </>
  );
}
