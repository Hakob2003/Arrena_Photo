"use client";
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function BillingFailedPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/profile/billing');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fafafa] dark:bg-black p-4">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="w-full max-w-md bg-white dark:bg-[#0a0a0a] border border-black/10 dark:border-white/10 rounded-3xl p-8 text-center shadow-xl"
      >
        <div className="w-20 h-20 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Ошибка оплаты</h1>
        <p className="text-slate-600 dark:text-gray-400 mb-8">
          К сожалению, ваш платеж был отклонен банком. Пожалуйста, проверьте данные карты или попробуйте другой способ оплаты.
        </p>

        <div className="flex flex-col gap-3">
          <button 
            onClick={() => router.push('/profile/billing?tab=payment')}
            className="w-full py-3 bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-gray-200 dark:text-black text-white font-medium rounded-xl transition-colors"
          >
            Сменить метод оплаты
          </button>
          <button 
            onClick={() => router.push('/profile/billing')}
            className="w-full py-3 bg-transparent border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-slate-900 dark:text-white font-medium rounded-xl transition-colors"
          >
            Вернуться назад
          </button>
          <p className="text-sm text-slate-400 mt-2">
            Автоматический возврат через {countdown} сек...
          </p>
        </div>
      </motion.div>
    </div>
  );
}
