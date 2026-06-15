"use client";
import React from 'react';
import { useAuthStore } from '../../store';

export default function ProfilePage() {
  const { user, credits } = useAuthStore();

  return !user ? (
    <div className="p-8 max-w-4xl mx-auto flex items-center justify-center h-full">
      <div className="text-center">
        <div className="text-6xl mb-6">🔒</div>
        <h2 className="text-2xl font-bold mb-2">Войдите для просмотра</h2>
        <p className="text-gray-400 mb-6">Войдите в аккаунт, чтобы управлять настройками профиля.</p>
        <a href="/login" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors">
          Войти
        </a>
      </div>
    </div>
  ) : (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-10">Настройки аккаунта</h1>

      <div className="space-y-8">
        {/* Profile Card */}
        <div className="glass-card p-6 sm:p-8 rounded-2xl flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-6 relative">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-3xl sm:text-4xl text-white font-bold shadow-[0_0_30px_rgba(99,102,241,0.4)]">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{user?.name}</h2>
            <p className="text-gray-400">{user?.email}</p>
            <div className="mt-3 inline-block px-3 py-1 bg-white/10 rounded-full text-xs font-bold uppercase tracking-wider text-indigo-300">
              {user?.role}
            </div>
          </div>
          <button className="px-5 py-2 glass rounded-lg hover:bg-white/10 text-sm font-medium w-full sm:w-auto mt-4 sm:mt-0">Редактировать</button>
        </div>

        {/* Billing / Credits */}
        <div className="glass-card p-6 sm:p-8 rounded-2xl">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <span>💳</span> Баланс и Кредиты
          </h3>
          
          <div className="flex flex-col sm:flex-row items-center sm:items-center sm:justify-between p-4 sm:p-6 bg-black/40 rounded-xl border border-white/5 gap-4">
            <div className="text-center sm:text-left">
              <p className="text-gray-400 text-sm mb-1">Доступный баланс</p>
              <p className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                {credits?.toLocaleString('en-US') || 0} <span className="text-base sm:text-lg text-gray-500 font-medium">CR</span>
              </p>
            </div>
            <button className="w-full sm:w-auto px-6 py-3 bg-white text-black font-bold rounded-xl hover:scale-105 transition-transform">
              Купить кредиты
            </button>
          </div>

          <div className="mt-6 border-t border-white/10 pt-6">
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Подписка</h4>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-indigo-500/30 bg-indigo-500/5 rounded-xl gap-3">
              <div>
                <p className="font-bold text-lg text-white">Pro Plan</p>
                <p className="text-sm text-gray-400">Next billing date: 24 July 2026</p>
              </div>
              <button className="w-full sm:w-auto text-indigo-400 text-sm font-bold hover:text-white bg-indigo-500/10 sm:bg-transparent py-2 sm:py-0 rounded-lg sm:rounded-none">Управление</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
