'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Проверка токена...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Токен подтверждения не найден.');
      return;
    }

    api.get(`/auth/verify?token=${token}`)
      .then((res) => {
        setStatus('success');
        setMessage(res.data.message || 'Email успешно подтвержден!');
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Не удалось подтвердить Email.');
      });
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 text-center">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Подтверждение Email</h2>
        
        {status === 'loading' && <div className="text-blue-600">Загрузка...</div>}
        
        {status === 'success' && (
          <div className="text-green-600">
            <p className="mb-4">{message}</p>
            <Link href="/login" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-block">
              Войти
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="text-red-600">
            <p className="mb-4">{message}</p>
            <Link href="/login" className="text-blue-600 hover:underline">Вернуться на страницу входа</Link>
          </div>
        )}
      </div>
    </div>
  );
}
