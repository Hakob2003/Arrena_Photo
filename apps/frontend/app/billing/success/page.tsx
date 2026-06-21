"use client";
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function BillingSuccessPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

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
        <div className="w-20 h-20 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Оплата прошла успешно!</h1>
        <p className="text-slate-600 dark:text-gray-400 mb-8">
          Ваш тариф успешно обновлен. Спасибо, что выбираете нас! Все новые функции уже доступны в вашем аккаунте.
        </p>

        <div className="flex flex-col gap-3">
          <button 
            onClick={() => router.push('/profile/billing')}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors"
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
