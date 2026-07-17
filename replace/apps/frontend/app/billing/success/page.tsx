"use client";
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useUIStore } from '@/store';

export default function BillingSuccessPage() {
  const router = useRouter();
  const isLuxury = useUIStore(state => state.preferences?.skin === 'LUXURY');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/billing');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-transparent p-4">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="w-full max-w-md bg-white dark:bg-[#0a0a0a] border border-black/10 dark:border-white/10 rounded-3xl p-8 text-center shadow-xl"
      >
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isLuxury ? 'bg-[#D4AF37]/20' : 'bg-green-100 dark:bg-green-500/20'}`}>
          <svg className={`w-10 h-10 ${isLuxury ? 'text-[#D4AF37]' : 'text-green-600 dark:text-green-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Оплата прошла успешно!</h1>
        <p className="text-slate-600 dark:text-gray-400 mb-8">
          Ваш тариф успешно обновлен. Спасибо, что выбираете нас! Все новые функции уже доступны в вашем аккаунте.
        </p>

        <div className="flex flex-col gap-3">
          <button 
            onClick={() => router.push('/billing')}
            className={`w-full py-3 font-medium rounded-xl transition-colors ${isLuxury ? 'bg-[#D4AF37] hover:bg-[#C5A028] text-black' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
          >
            Вернуться в настройки
          </button>
          <p className="text-sm text-slate-400 mt-2">
            Автоматический возврат через {countdown} сек...
          </p>
        </div>
      </motion.div>
    </div>
  );
}
