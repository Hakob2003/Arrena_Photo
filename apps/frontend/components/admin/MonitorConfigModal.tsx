import React, { useState } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { useTranslation } from '../../lib/i18n';

interface MonitorConfigModalProps {
  provider: { id: string; name: string; isAutoMonitorOn: boolean; monitorInterval: string };
  onClose: () => void;
  onSuccess: () => void;
}

export function MonitorConfigModal({ provider, onClose, onSuccess }: MonitorConfigModalProps) {
  const { t } = useTranslation();
  const [isOn, setIsOn] = useState(provider.isAutoMonitorOn);
  const [interval, setIntervalVal] = useState(provider.monitorInterval || '1h');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.post(`/admin/api-providers/${provider.id}/toggle-monitor`, {
        isAutoMonitorOn: isOn,
        monitorInterval: interval
      });
      toast.success(t('admin.monitor.success'));
      onSuccess();
    } catch (e) {
      toast.error(t('admin.monitor.error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#fafafa] dark:bg-black/5 backdrop-blur-none z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-[#111] border border-black/10 dark:border-white/10 rounded-2xl w-full max-w-md flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/10 dark:border-white/10">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-900 dark:text-white">{t('admin.monitor.title')}: {provider.name}</h3>
          <button onClick={onClose} className="text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:text-slate-900 dark:text-white p-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-900 dark:text-white">{t('admin.monitor.enable')}</p>
              <p className="text-xs text-slate-400 dark:text-gray-500 mt-1">{t('admin.monitor.desc')}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={isOn} onChange={e => setIsOn(e.target.checked)} />
              <div className="w-11 h-6 bg-black/[0.05] dark:bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 shadow-[0_8px_24px_rgba(99,102,241,0.25)] dark:shadow-none"></div>
            </label>
          </div>

          <div className={`space-y-2 transition-opacity ${!isOn ? 'opacity-50 pointer-events-none' : ''}`}>
            <label className="text-sm font-medium text-gray-300">{t('admin.monitor.interval')}</label>
            <select 
              value={interval}
              onChange={e => setIntervalVal(e.target.value)}
              className="w-full bg-black/[0.03] dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg px-4 py-2 text-slate-900 dark:text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="REALTIME" className="bg-[#111]">{t('admin.monitor.intervals.realtime')}</option>
              <option value="1m" className="bg-[#111]">{t('admin.monitor.intervals.1m')}</option>
              <option value="5m" className="bg-[#111]">{t('admin.monitor.intervals.5m')}</option>
              <option value="10m" className="bg-[#111]">{t('admin.monitor.intervals.10m')}</option>
              <option value="30m" className="bg-[#111]">{t('admin.monitor.intervals.30m')}</option>
              <option value="1h" className="bg-[#111]">{t('admin.monitor.intervals.1h')}</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-black/10 dark:border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:text-slate-900 dark:text-white transition-colors"
          >
            {t('ui.confirmDelete.cancel')}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 bg-indigo-600 shadow-[0_8px_24px_rgba(99,102,241,0.25)] dark:shadow-none hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? t('admin.monitor.saving') : t('admin.monitor.save')}
          </button>
        </div>
      </div>
    </div>
  );
}
