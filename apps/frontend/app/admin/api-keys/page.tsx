"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { PageHeader } from '../../../components/admin/PageHeader';
import { Badge } from '../../../components/admin/Badge';
import { MonitorConfigModal } from '../../../components/admin/MonitorConfigModal';

interface ProviderWithKey {
  id: string;
  name: string;
  isGlobal: boolean;
  hasKeySet: boolean;
  status: string;
  lastCheckedAt: string | null;
  balance: number | null;
  errorMessage: string | null;
  isAutoMonitorOn: boolean;
  monitorInterval: string;
}

export default function ApiKeysAdminPage() {
  const [providers, setProviders] = useState<ProviderWithKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [keyValue, setKeyValue] = useState('');
  const [checkingId, setCheckingId] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [monitorConfigProvider, setMonitorConfigProvider] = useState<ProviderWithKey | null>(null);

  const fetchProviders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/api-providers');
      setProviders(res.data);
    } catch (error) {
      toast.error('Ошибка загрузки провайдеров');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  const handleSaveKey = async (providerId: string) => {
    if (!keyValue.trim()) {
      toast.error('Введите API ключ');
      return;
    }
    try {
      await api.post(`/admin/api-providers/${providerId}/key`, { apiKey: keyValue });
      toast.success('API ключ сохранен');
      setEditingId(null);
      setKeyValue('');
      fetchProviders();
    } catch (error) {
      toast.error('Ошибка при сохранении ключа');
    }
  };

  const handleCheckConnection = async (providerId: string) => {
    try {
      setCheckingId(providerId);
      await api.post(`/admin/api-providers/${providerId}/check`);
      toast.success('Проверка завершена');
      fetchProviders();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Ошибка проверки соединения');
      fetchProviders();
    } finally {
      setCheckingId(null);
    }
  };

  const handleTestGeneration = async (providerId: string) => {
    try {
      setTestingId(providerId);
      const res = await api.post(`/admin/api-providers/${providerId}/test`);
      toast.success(res.data.message || 'Тест успешен');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Тест не удался');
    } finally {
      setTestingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONNECTED': return <Badge variant="success">Подключен</Badge>;
      case 'ERROR': return <Badge variant="error">Ошибка</Badge>;
      default: return <Badge variant="default">Не проверен</Badge>;
    }
  };

  const formatBalance = (balance: number | null) => {
    if (balance === null) return <span className="text-slate-400 dark:text-gray-500">Н/Д</span>;
    return <span className="text-green-400 font-mono">${balance.toFixed(4)}</span>;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Никогда';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    }).format(date);
  };

  const getIntervalLabel = (interval: string) => {
    const map: Record<string, string> = {
      'REALTIME': 'Real-time',
      '1m': '1 мин',
      '5m': '5 мин',
      '10m': '10 мин',
      '30m': '30 мин',
      '1h': '1 час'
    };
    return map[interval] || interval;
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] p-6 lg:p-8 flex flex-col gap-8">
      <PageHeader 
        title="API Ключи Провайдеров" 
        description="Управление глобальными ключами доступа к AI провайдерам, проверка статусов и баланса."
      />

      <div className="bg-[#111] border border-black/10 dark:border-white/10 rounded-2xl overflow-hidden flex flex-col min-h-0 flex-1">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-black/10 dark:border-white/10 text-sm text-slate-500 dark:text-gray-400 bg-white/[0.02]">
                <th className="px-6 py-4 font-medium">Провайдер</th>
                <th className="px-6 py-4 font-medium">API Ключ</th>
                <th className="px-6 py-4 font-medium">Статус</th>
                <th className="px-6 py-4 font-medium">Баланс</th>
                <th className="px-6 py-4 font-medium">Мониторинг</th>
                <th className="px-6 py-4 font-medium text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading && providers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 dark:text-gray-500">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-6 h-6 border-2 border-black/10 dark:border-white/10 border-t-indigo-500 rounded-full animate-spin" />
                      Загрузка провайдеров...
                    </div>
                  </td>
                </tr>
              ) : providers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 dark:text-gray-500">
                    Нет доступных провайдеров
                  </td>
                </tr>
              ) : (
                providers.map(p => (
                  <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                    {/* Provider Name */}
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                        {p.name}
                        {p.isGlobal && <span className="text-[10px] uppercase tracking-wider bg-black/[0.05] dark:bg-white/10 text-gray-300 px-1.5 py-0.5 rounded">Global</span>}
                      </div>
                    </td>

                    {/* API Key */}
                    <td className="px-6 py-4">
                      {editingId === p.id ? (
                        <div className="flex items-center gap-2 max-w-[300px]">
                          <input
                            type="password"
                            value={keyValue}
                            onChange={e => setKeyValue(e.target.value)}
                            placeholder="sk-..."
                            className="w-full px-3 py-1.5 bg-[#fafafa] dark:bg-black border border-black/20 dark:border-white/20 rounded-md text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                            autoFocus
                            onKeyDown={e => e.key === 'Enter' && handleSaveKey(p.id)}
                          />
                          <button onClick={() => handleSaveKey(p.id)} className="p-1.5 text-green-400 hover:bg-green-400/10 rounded">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                          <button onClick={() => setEditingId(null)} className="p-1.5 text-slate-500 dark:text-gray-400 hover:bg-black/[0.05] dark:bg-white/10 rounded">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          {p.hasKeySet ? (
                            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-gray-400 font-mono">
                              <span>••••••••••••••••</span>
                              <button 
                                onClick={() => { setEditingId(p.id); setKeyValue(''); }}
                                className="text-indigo-400 hover:text-indigo-300 transition-colors opacity-0 group-hover:opacity-100"
                                title="Изменить ключ"
                              >
                                Изменить
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => { setEditingId(p.id); setKeyValue(''); }}
                              className="text-sm text-indigo-400 hover:text-indigo-300 font-medium"
                            >
                              + Добавить ключ
                            </button>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div>{getStatusBadge(p.status)}</div>
                        {p.errorMessage && (
                          <div className="text-xs text-red-400 max-w-[200px] truncate" title={p.errorMessage}>
                            {p.errorMessage}
                          </div>
                        )}
                        <div className="text-[10px] text-slate-400 dark:text-gray-500">
                          {formatDate(p.lastCheckedAt)}
                        </div>
                      </div>
                    </td>

                    {/* Balance */}
                    <td className="px-6 py-4">
                      {formatBalance(p.balance)}
                    </td>

                    {/* Auto Monitor */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {p.isAutoMonitorOn ? (
                          <div className="flex items-center gap-1.5">
                            <span className="relative flex h-2.5 w-2.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                            </span>
                            <span className="text-xs text-green-400 font-medium">Вкл ({getIntervalLabel(p.monitorInterval)})</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="h-2.5 w-2.5 rounded-full bg-gray-600"></span>
                            <span className="text-xs text-slate-400 dark:text-gray-500">Выкл</span>
                          </div>
                        )}
                        <button 
                          onClick={() => setMonitorConfigProvider(p)}
                          className="ml-2 p-1 text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:text-white hover:bg-black/[0.05] dark:bg-white/10 rounded transition-colors opacity-0 group-hover:opacity-100"
                          title="Настройки мониторинга"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </button>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleCheckConnection(p.id)}
                          disabled={!p.hasKeySet || checkingId === p.id}
                          className="p-1.5 rounded-md hover:bg-black/[0.05] dark:bg-white/10 text-slate-500 dark:text-gray-400 hover:text-indigo-400 transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
                          title="Проверить соединение"
                        >
                          {checkingId === p.id ? (
                            <div className="w-4 h-4 border-2 border-black/10 dark:border-white/10 border-t-indigo-400 rounded-full animate-spin" />
                          ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          )}
                        </button>
                        <button
                          onClick={() => handleTestGeneration(p.id)}
                          disabled={!p.hasKeySet || p.status !== 'CONNECTED' || testingId === p.id}
                          className="p-1.5 rounded-md hover:bg-black/[0.05] dark:bg-white/10 text-slate-500 dark:text-gray-400 hover:text-green-400 transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
                          title="Тестовый запрос"
                        >
                          {testingId === p.id ? (
                            <div className="w-4 h-4 border-2 border-black/10 dark:border-white/10 border-t-green-400 rounded-full animate-spin" />
                          ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {monitorConfigProvider && (
        <MonitorConfigModal
          provider={monitorConfigProvider}
          onClose={() => setMonitorConfigProvider(null)}
          onSuccess={() => {
            setMonitorConfigProvider(null);
            fetchProviders();
          }}
        />
      )}
    </div>
  );
}
