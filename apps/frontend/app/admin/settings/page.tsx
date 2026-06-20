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
        <div className="p-6 border border-border rounded-lg bg-[#0a0a0a]">
          <h3 className="text-lg font-semibold text-foreground mb-4">General Configuration</h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-1">Platform Name</label>
              <input type="text" defaultValue="AI Template Studio" className="w-full bg-background border border-border rounded-md p-2 text-sm text-foreground outline-none focus:border-white/30" />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-1">Support Email</label>
              <input type="email" defaultValue="support@studio.ai" className="w-full bg-background border border-border rounded-md p-2 text-sm text-foreground outline-none focus:border-white/30" />
            </div>
          </div>
        </div>

        <div className="p-6 border border-border rounded-lg bg-[#0a0a0a]">
          <h3 className="text-lg font-semibold text-foreground mb-4">Feature Flags</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Public Registrations</p>
                <p className="text-xs text-muted-foreground">Allow new users to sign up.</p>
              </div>
              <input type="checkbox" defaultChecked className="rounded bg-background border-border" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Require Email Verification</p>
                <p className="text-xs text-muted-foreground">Users must verify email before generating.</p>
              </div>
              <input type="checkbox" defaultChecked className="rounded bg-background border-border" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Maintenance Mode</p>
                <p className="text-xs text-muted-foreground">Disable platform access for all non-admins.</p>
              </div>
              <input type="checkbox" className="rounded bg-background border-border" />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button className="px-4 py-2 bg-primary text-primary-foreground font-medium text-sm rounded-md hover:bg-secondary">Save Changes</button>
        </div>
      </div>
    </>
  );
}
