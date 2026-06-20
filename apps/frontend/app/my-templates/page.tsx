"use client";
import React from 'react';
import Link from 'next/link';

export default function MyTemplatesPage() {
  return (
    <div className="p-4 sm:p-8 w-full h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-10">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Мои шаблоны</h1>
          <p className="text-gray-400 text-sm sm:text-base">Управление созданными промптами и шаблонами.</p>
        </div>
        <button className="w-full sm:w-auto bg-white text-black px-6 py-3 sm:py-2.5 rounded-full font-bold hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.2)]">
          + Создать
        </button>
      </div>

      <div className="flex-1 border border-white/10 rounded-2xl bg-black/40 backdrop-blur-md p-10 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-4xl mb-6">📁</div>
        <h2 className="text-2xl font-bold mb-2">Пока нет шаблонов</h2>
        <p className="text-gray-400 max-w-md mb-8">
          Вы ещё не создали ни одного шаблона. Упакуйте лучшие промпты в шаблон и делитесь или продавайте на маркетплейсе.
        </p>
        <Link href="/generate">
          <button className="px-6 py-3 glass rounded-xl font-bold text-indigo-400 hover:text-indigo-300 hover:bg-white/10 transition-colors">
            Перейти в Генератор
          </button>
        </Link>
      </div>
    </div>
  );
}
