"use client";
import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../../components/admin/PageHeader';
import { api } from '../../../lib/api';

export default function AdminSettings() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/settings').then(res => {
      setSettings(res.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/settings', settings);
      alert('Settings saved successfully');
    } catch (e) {
      alert('Failed to save settings');
    }
    setSaving(false);
  };

  if (loading) return <div className="p-8 text-white">Loading...</div>;

  return (
    <>
      <PageHeader 
        title="Platform Settings" 
        description="Global configuration and flags."
      />

      <div className="space-y-6 max-w-3xl">
        <div className="p-6 border border-black/10 dark:border-white/10 rounded-lg bg-[#0a0a0a]">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">General Configuration</h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-300 block mb-1">Platform Name</label>
              <input type="text" value={settings?.platformName || ''} onChange={(e) => setSettings({...settings, platformName: e.target.value})} className="w-full bg-transparent border border-black/10 dark:border-white/10 rounded-md p-2 text-sm text-slate-900 dark:text-white outline-none focus:border-white/30" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300 block mb-1">Support Email</label>
              <input type="email" value={settings?.supportEmail || ''} onChange={(e) => setSettings({...settings, supportEmail: e.target.value})} className="w-full bg-transparent border border-black/10 dark:border-white/10 rounded-md p-2 text-sm text-slate-900 dark:text-white outline-none focus:border-white/30" />
            </div>
          </div>
        </div>

        <div className="p-6 border border-black/10 dark:border-white/10 rounded-lg bg-[#0a0a0a]">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Mock Generation Mode</h3>
          <p className="text-sm text-gray-400 mb-4">Select which provider to use when no API key is available.</p>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Use picsum.photos for Mock Generator</p>
                <p className="text-xs text-slate-400 dark:text-gray-500">If disabled, an inline SVG will be used (faster, 100% reliable).</p>
              </div>
              <input 
                type="checkbox" 
                checked={settings?.usePicsumMock || false} 
                onChange={(e) => setSettings({...settings, usePicsumMock: e.target.checked})} 
                className="rounded bg-transparent border-black/20 dark:border-white/20" 
              />
            </div>
          </div>
        </div>

        <div className="p-6 border border-black/10 dark:border-white/10 rounded-lg bg-[#0a0a0a]">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Feature Flags</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Public Registrations</p>
                <p className="text-xs text-slate-400 dark:text-gray-500">Allow new users to sign up.</p>
              </div>
              <input type="checkbox" checked={settings?.publicRegistrations || false} onChange={(e) => setSettings({...settings, publicRegistrations: e.target.checked})} className="rounded bg-transparent border-black/20 dark:border-white/20" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Require Email Verification</p>
                <p className="text-xs text-slate-400 dark:text-gray-500">Users must verify email before generating.</p>
              </div>
              <input type="checkbox" checked={settings?.requireEmailVerification || false} onChange={(e) => setSettings({...settings, requireEmailVerification: e.target.checked})} className="rounded bg-transparent border-black/20 dark:border-white/20" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Maintenance Mode</p>
                <p className="text-xs text-slate-400 dark:text-gray-500">Disable platform access for all non-admins.</p>
              </div>
              <input type="checkbox" checked={settings?.maintenanceMode || false} onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})} className="rounded bg-transparent border-black/20 dark:border-white/20" />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-white text-black font-medium text-sm rounded-md hover:bg-gray-200 disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </>
  );
}
