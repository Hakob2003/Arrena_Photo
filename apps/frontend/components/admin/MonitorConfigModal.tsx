import React, { useState } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface MonitorConfigModalProps {
  provider: { id: string; name: string; isAutoMonitorOn: boolean; monitorInterval: string };
  onClose: () => void;
  onSuccess: () => void;
}

export function MonitorConfigModal({ provider, onClose, onSuccess }: MonitorConfigModalProps) {
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
      toast.success('Настройки мониторинга сохранены');
      onSuccess();
    } catch (e) {
      toast.error('Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-[#111] border border-border rounded-2xl w-full max-w-md flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">Автомониторинг: {provider.name}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Включить автопроверку</p>
              <p className="text-xs text-muted-foreground mt-1">Регулярно проверять доступность API и баланс</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={isOn} onChange={e => setIsOn(e.target.checked)} />
              <div className="w-11 h-6 bg-muted/50 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-primary after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className={`space-y-2 transition-opacity ${!isOn ? 'opacity-50 pointer-events-none' : ''}`}>
            <label className="text-sm font-medium text-muted-foreground">Интервал проверки</label>
            <select 
              value={interval}
              onChange={e => setIntervalVal(e.target.value)}
              className="w-full bg-muted border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-indigo-500"
            >
              <option value="REALTIME" className="bg-[#111]">Real-time (каждые 10 сек)</option>
              <option value="1m" className="bg-[#111]">Каждую минуту</option>
              <option value="5m" className="bg-[#111]">Каждые 5 минут</option>
              <option value="10m" className="bg-[#111]">Каждые 10 минут</option>
              <option value="30m" className="bg-[#111]">Каждые 30 минут</option>
              <option value="1h" className="bg-[#111]">Каждый час</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-foreground text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  );
}
