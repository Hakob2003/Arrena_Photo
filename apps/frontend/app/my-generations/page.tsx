"use client";
import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store';

export default function MyGenerationsPage() {
  const { user } = useAuthStore();
  const [generations, setGenerations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchGenerations();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchGenerations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/generations/history');
      setGenerations(res.data);
    } catch (e) {
      console.error('Failed to fetch generations:', e);
    } finally {
      setLoading(false);
    }
  };

  const saveToDrive = async (e: React.MouseEvent, id: string, imageUrl: string) => {
    e.stopPropagation();
    try {
      setSavingId(id);
      await api.post('/integrations/google-drive/save', { imageUrl });
      toast.success('Сохранено на Google Drive!');
    } catch (error: any) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('not connected')) {
        toast.error('Google Drive не подключен. Привяжите его в настройках Cloud Storage.');
      } else {
        toast.error('Ошибка при сохранении на Google Drive');
      }
    } finally {
      setSavingId(null);
    }
  };

  if (!user) {
    return (
      <div className="p-8 max-w-7xl mx-auto h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-6">🔒</div>
          <h2 className="text-2xl font-bold mb-2">Войдите для просмотра</h2>
          <p className="text-gray-400 mb-6">Войдите в аккаунт, чтобы увидеть историю генераций.</p>
          <a href="/login" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors">
            Войти
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-bold">Мои генерации</h1>
          <p className="text-gray-400 mt-1">Все ваши сгенерированные изображения</p>
        </div>
        <button 
          onClick={fetchGenerations}
          className="px-5 py-2 glass rounded-lg hover:bg-white/10 text-sm font-bold"
        >
          Обновить
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-white/10 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      ) : generations.length === 0 ? (
        <div className="flex-1 border border-white/10 rounded-2xl bg-black/40 backdrop-blur-md p-10 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-4xl mb-6">🎨</div>
          <h2 className="text-2xl font-bold mb-2">Ещё нет генераций</h2>
          <p className="text-gray-400 max-w-md mb-8">
            Вы ещё не создали ни одного изображения. Перейдите в Генератор и создайте своё первое!
          </p>
          <a href="/generate" className="px-6 py-3 glass rounded-xl font-bold text-indigo-400 hover:text-indigo-300 hover:bg-white/10 transition-colors">
            Перейти в Генератор
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {generations.map(gen => (
            <div key={gen.id} className="group relative aspect-square rounded-xl overflow-hidden glass-card cursor-pointer">
              <img src={gen.imageUrl} alt="Generated" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-between">
                <div className="flex justify-end">
                  <button 
                    onClick={(e) => saveToDrive(e, gen.id, gen.imageUrl)}
                    disabled={savingId === gen.id}
                    className="bg-black/50 hover:bg-black/80 text-white p-2 rounded-lg backdrop-blur-md transition-colors"
                    title="Сохранить на Google Drive"
                  >
                    {savingId === gen.id ? (
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                    )}
                  </button>
                </div>
                <div>
                  <span className="text-xs text-indigo-400 font-bold mb-1 block">{gen.model}</span>
                  {gen.template && <span className="text-xs text-gray-300 block">Шаблон: {gen.template}</span>}
                  <span className="text-xs text-gray-500 block mt-1">{new Date(gen.createdAt).toLocaleDateString('ru-RU')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
