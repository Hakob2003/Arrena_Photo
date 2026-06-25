"use client";
import React from 'react';
import Link from 'next/link';
import { useTranslation } from '../../lib/i18n';
import { useUIStore } from '../../store';

export default function MyTemplatesPage() {
  const { t } = useTranslation();
  const isLuxury = useUIStore(state => state.preferences?.skin === 'LUXURY');

  return (
    <div className="p-4 sm:p-8 w-full h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-10">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">{t('myTpl.title')}</h1>
          <p className="text-slate-500 dark:text-gray-400 text-sm sm:text-base">{t('myTpl.description')}</p>
        </div>
        <button className="w-full sm:w-auto bg-white text-black px-6 py-3 sm:py-2.5 rounded-full font-bold hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.2)]">
          {t('myTpl.create')}
        </button>
      </div>

      <div className="flex-1 border border-black/10 dark:border-white/10 rounded-2xl bg-transparent/40 backdrop-blur-md p-10 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-black/[0.03] dark:bg-white/5 rounded-full flex items-center justify-center text-4xl mb-6">📁</div>
        <h2 className="text-2xl font-bold mb-2">{t('myTpl.empty')}</h2>
        <p className="text-slate-500 dark:text-gray-400 max-w-md mb-8">
          {t('myTpl.emptyDescription')}
        </p>
        <Link href="/generate">
          <button className={`px-6 py-3 glass rounded-xl font-bold hover:bg-black/[0.05] dark:bg-white/10 transition-colors ${
            isLuxury ? 'text-[#D4AF37] hover:text-[#C5A028]' : 'text-indigo-400 hover:text-indigo-300'
          }`}>
            {t('myTpl.goToGenerator')}
          </button>
        </Link>
      </div>
    </div>
  );
}
