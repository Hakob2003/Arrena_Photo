'use client';

import { useEffect, useState } from 'react';
import { api } from '../../../lib/api';

interface Provider {
  id: string;
  name: string;
  isGlobal: boolean;
  hasKeySet: boolean;
}

export default function ApiKeysAdminPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [keyValue, setKeyValue] = useState('');

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      const res = await api.get('/admin/api-providers');
      setProviders(res.data);
    } catch (error) {
      console.error('Failed to fetch API providers', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (providerId: string) => {
    if (!keyValue) return;
    try {
      await api.post(`/admin/api-providers/${providerId}/key`, { apiKey: keyValue });
      setEditingId(null);
      setKeyValue('');
      fetchProviders();
    } catch (error) {
      console.error('Failed to save API key', error);
      alert('Ошибка при сохранении ключа');
    }
  };

  if (loading) return <div className="p-8">Загрузка...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 dark:text-white">API Ключи (Глобальные Провайдеры)</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-6 py-4 font-medium text-gray-900 dark:text-white">Провайдер</th>
              <th className="px-6 py-4 font-medium text-gray-900 dark:text-white">Статус Ключа</th>
              <th className="px-6 py-4 font-medium text-gray-900 dark:text-white text-right">Действие</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {providers.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{p.name}</td>
                <td className="px-6 py-4">
                  {p.hasKeySet ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Установлен
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Не установлен
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  {editingId === p.id ? (
                    <div className="flex justify-end gap-2">
                      <input 
                        type="text" 
                        value={keyValue} 
                        onChange={(e) => setKeyValue(e.target.value)}
                        placeholder="Введите API ключ"
                        className="px-3 py-1 border rounded focus:ring-2 outline-none dark:bg-gray-900 dark:border-gray-600"
                      />
                      <button 
                        onClick={() => handleSave(p.id)}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Сохранить
                      </button>
                      <button 
                        onClick={() => { setEditingId(null); setKeyValue(''); }}
                        className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300"
                      >
                        Отмена
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => { setEditingId(p.id); setKeyValue(''); }}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {p.hasKeySet ? 'Обновить Ключ' : 'Добавить Ключ'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {providers.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center">Провайдеры не найдены</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
