"use client";
import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store';
import { useTranslation } from '@/lib/i18n';
import { generationsApi } from '@/lib/generations.api';
import { useRouter } from 'next/navigation';
import { AuthImage } from '@/components/ui/AuthImage';
import { useUIStore } from '@/store';

export default function MyGenerationsPage() {
  const { user } = useAuthStore();
  const { t, locale } = useTranslation();
  const isLuxury = useUIStore(state => state.preferences?.skin === 'LUXURY');
  const [generations, setGenerations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  
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
      await api.post('/integrations/google-drive/save', { imageUrl, generationId: id });
      toast.success(t('myGen.savedToDrive'));
      // Update local state to reflect it's saved
      setGenerations(prev => prev.map(g => g.id === id ? { ...g, driveFileId: 'saved' } : g));
    } catch (error: any) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('not connected')) {
        toast.error(t('myGen.driveNotConnected'));
      } else {
        toast.error(t('myGen.saveError'));
      }
    } finally {
      setSavingId(null);
    }
  };

  const togglePublish = async (e: React.MouseEvent, id: string, currentStatus: boolean) => {
    e.stopPropagation();
    try {
      setPublishingId(id);
      await generationsApi.publish(id, !currentStatus);
      toast.success(currentStatus ? t('myGen.unpublished') : t('myGen.published'));
      setGenerations(prev => prev.map(g => g.id === id ? { ...g, isPublic: !currentStatus } : g));
    } catch (error) {
      toast.error(t('myGen.publishError') || 'Failed to update status');
    } finally {
      setPublishingId(null);
    }
  };

  if (!user) {
    return (
      <div className="p-8 w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-6">🔒</div>
          <h2 className="text-2xl font-bold mb-2">{t('myGen.loginRequired')}</h2>
          <p className="text-slate-500 dark:text-gray-400 mb-6">{t('myGen.loginDescription')}</p>
          <a href="/login" className={`px-6 py-3 font-bold rounded-xl transition-colors ${
            isLuxury ? 'bg-[#D4AF37] hover:bg-[#C5A028] text-black shadow-none' : 'bg-indigo-600 shadow-[0_8px_24px_rgba(99,102,241,0.25)] dark:shadow-none hover:bg-indigo-700 text-white'
          }`}>
            {t('auth.login')}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-10">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold">{t('myGen.title')}</h1>
          <p className="text-slate-500 dark:text-gray-400 mt-1 text-sm sm:text-base">{t('myGen.description')}</p>
        </div>
        <button 
          onClick={fetchGenerations}
          className="w-full sm:w-auto px-5 py-2 glass rounded-lg hover:bg-black/[0.05] dark:bg-white/10 text-sm font-bold min-h-[44px]"
        >
          {t('myGen.refresh')}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className={`w-12 h-12 border-4 border-black/10 dark:border-white/10 rounded-full animate-spin ${isLuxury ? 'border-t-[#D4AF37]' : 'border-t-indigo-500'}`} />
        </div>
      ) : generations.length === 0 ? (
        <div className="flex-1 border border-black/10 dark:border-white/10 rounded-2xl bg-[#fafafa] dark:bg-black/40 backdrop-blur-md p-10 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-black/[0.03] dark:bg-white/5 rounded-full flex items-center justify-center text-4xl mb-6">🎨</div>
          <h2 className="text-2xl font-bold mb-2">{t('myGen.empty')}</h2>
          <p className="text-slate-500 dark:text-gray-400 max-w-md mb-8">
            {t('myGen.emptyDescription')}
          </p>
          <a href="/generate" className={`px-6 py-3 glass rounded-xl font-bold hover:bg-black/[0.05] dark:bg-white/10 transition-colors ${
            isLuxury ? 'text-[#D4AF37] hover:text-[#C5A028]' : 'text-indigo-400 hover:text-indigo-300'
          }`}>
            {t('myGen.goToGenerator')}
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {generations.map(gen => (
            <div key={gen.id} className="group relative aspect-square rounded-xl overflow-hidden glass-card cursor-pointer">
              <AuthImage driveFileId={gen.driveFileId !== 'saved' ? gen.driveFileId : undefined} fallbackUrl={gen.imageUrl} alt="Generated" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              <div className="absolute inset-0 bg-[#fafafa] dark:bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-between">
                <div className="flex justify-end">
                  <button 
                    onClick={(e) => saveToDrive(e, gen.id, gen.imageUrl)}
                    disabled={savingId === gen.id || !!gen.driveFileId}
                    className={`${gen.driveFileId ? 'bg-green-500/50 text-green-200' : 'bg-[#fafafa] dark:bg-black/50 hover:bg-[#fafafa] dark:bg-black/80 text-slate-900 dark:text-white'} p-2 rounded-lg backdrop-blur-md transition-colors`}
                    title={gen.driveFileId ? t('myGen.alreadySaved') : t('myGen.saveToDrive')}
                  >
                    {savingId === gen.id ? (
                      <div className="w-4 h-4 border-2 border-black/20 dark:border-white/20 border-t-white rounded-full animate-spin" />
                    ) : gen.driveFileId ? (
                      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                    ) : (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                    )}
                  </button>
                  <button 
                    onClick={(e) => togglePublish(e, gen.id, gen.isPublic)}
                    disabled={publishingId === gen.id}
                    className={`${gen.isPublic ? (isLuxury ? 'bg-[#D4AF37]/50 text-[#D4AF37]' : 'bg-indigo-500/50 text-indigo-200') : 'bg-[#fafafa] dark:bg-black/50 hover:bg-[#fafafa] dark:bg-black/80 text-slate-900 dark:text-white'} p-2 rounded-lg backdrop-blur-md transition-colors ml-2`}
                    title={gen.isPublic ? 'Unpublish from Feed' : 'Publish to Feed'}
                  >
                    {publishingId === gen.id ? (
                      <div className="w-4 h-4 border-2 border-black/20 dark:border-white/20 border-t-white rounded-full animate-spin" />
                    ) : gen.isPublic ? (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8z"/></svg>
                    ) : (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    )}
                  </button>
                </div>
                <div>
                  <span className={`text-xs font-bold mb-1 block ${isLuxury ? 'text-[#D4AF37]' : 'text-indigo-400'}`}>{gen.model}</span>
                  {gen.template && <span className="text-xs text-gray-300 block">{t('myGen.template')}: {gen.template}</span>}
                  <span className="text-xs text-slate-400 dark:text-gray-500 block mt-1">{new Date(gen.createdAt).toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'en-US')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
