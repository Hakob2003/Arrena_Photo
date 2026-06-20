"use client";
import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export default function CloudConnectionsPage() {
  const [driveConnected, setDriveConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatus();
    
    // Check URL for success/error
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'drive_connected') {
      toast.success('Google Drive успешно подключен!');
      window.history.replaceState({}, '', '/connections/cloud');
    } else if (params.get('error')) {
      toast.error('Ошибка при подключении Google Drive');
      window.history.replaceState({}, '', '/connections/cloud');
    }
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await api.get(`/integrations/google-drive/status?t=${Date.now()}`);
      setDriveConnected(res.data.connected);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const connectDrive = async () => {
    try {
      const res = await api.get('/integrations/google-drive/auth-url');
      window.location.href = res.data.url;
    } catch (e) {
      toast.error('Не удалось получить ссылку для авторизации');
    }
  };

  const disconnectDrive = async () => {
    try {
      await api.post('/integrations/google-drive/disconnect');
      setDriveConnected(false);
      toast.success('Google Drive отключен');
    } catch (e) {
      toast.error('Ошибка при отключении');
    }
  };
  return (
    <div className="p-4 sm:p-8 w-full">
      <h1 className="text-4xl font-bold mb-2">Облачное хранилище</h1>
      <p className="text-gray-400 mb-10">Подключите S3-хранилище для сохранения сгенерированных изображений.</p>

      <div className="glass-card p-6 sm:p-8 rounded-2xl border-t-2 border-t-blue-500 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <svg viewBox="0 0 87.3 122.8" className="w-6 h-6" xmlns="http://www.w3.org/2000/svg"><path d="M58.06 85.34l-29.03 50.28H87.3l29.03-50.28z" fill="#0066da"/><path d="M58.06 85.34L29.03 135.62h58.27L116.33 85.34z" fill="#00ac47"/><path d="M58.06 85.34L0 85.34l29.03-50.28 58.27.01z" fill="#ea4335"/><path d="M58.06 85.34l29.03-50.28L58.06 35.06 29.03 85.34z" fill="#00832d"/><path d="M58.06 85.34L29.03 85.34 0 85.34l29.03 50.28z" fill="#2684fc"/><path d="M58.06 85.34L87.3 35.06 116.33 85.34 87.3 135.62z" fill="#ffba00"/></svg>
            Google Drive
          </h3>
          {loading ? (
            <span className="text-gray-400 text-sm">Загрузка...</span>
          ) : driveConnected ? (
            <span className="px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full text-sm font-medium">Подключено</span>
          ) : (
            <span className="px-3 py-1 bg-gray-500/10 text-gray-400 border border-gray-500/20 rounded-full text-sm font-medium">Не подключено</span>
          )}
        </div>
        
        <p className="text-gray-400 mb-6 text-sm">
          Привяжите свой аккаунт Google Drive, чтобы сохранять сгенерированные изображения прямо в свое облако одним кликом.
        </p>

        <div className="flex justify-end mt-4">
          {driveConnected ? (
            <button onClick={disconnectDrive} className="w-full sm:w-auto px-6 py-3 sm:py-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-lg font-medium transition-colors">
              Отключить
            </button>
          ) : (
            <button onClick={connectDrive} className="w-full sm:w-auto px-6 py-3 sm:py-2 bg-white text-black hover:bg-gray-100 rounded-lg font-bold shadow-lg transition-colors">
              Привязать Google Drive
            </button>
          )}
        </div>
      </div>

      <div className="glass-card p-6 sm:p-8 rounded-2xl border-t-2 border-t-purple-500">
        <h3 className="text-xl font-bold mb-6">AWS S3 / Cloudflare R2 / MinIO</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-xs text-gray-500 uppercase font-semibold mb-1 block">Endpoint URL</label>
            <input 
              type="text" 
              placeholder="https://s3.amazonaws.com or https://<id>.r2.cloudflarestorage.com"
              className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase font-semibold mb-1 block">Bucket Name</label>
            <input 
              type="text" 
              placeholder="my-ai-studio-bucket"
              className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase font-semibold mb-1 block">Access Key ID</label>
            <input 
              type="text" 
              placeholder="AKIAIOSFODNN7EXAMPLE"
              className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase font-semibold mb-1 block">Secret Access Key</label>
            <input 
              type="password" 
              placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
              className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
          <button className="w-full sm:w-auto px-6 py-3 sm:py-2 glass rounded-lg text-white font-medium hover:bg-white/10">Тест соединения</button>
          <button className="w-full sm:w-auto px-6 py-3 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-[0_0_15px_rgba(37,99,235,0.4)]">Сохранить</button>
        </div>
      </div>
    </div>
  );
}
