'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store';

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const login = useAuthStore((state) => state.login);
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Проверка токена...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Токен подтверждения не найден.');
      return;
    }

    api.get(`/auth/verify?token=${token}`)
      .then((res: any) => {
        setStatus('success');
        setMessage(res.data.message || 'Email успешно подтвержден!');
        // Automatically log the user in if the token is provided
        if (res.data && res.data.token && res.data.user) {
          login(res.data.user, res.data.token);
          setTimeout(() => router.push('/'), 2000);
        }
      })
      .catch((err: any) => {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Не удалось подтвердить Email.');
      });
  }, [token, router, login]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md p-8 bg-primary dark:bg-muted rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 text-center">
        <h2 className="text-2xl font-bold mb-6 text-foreground dark:text-foreground">Подтверждение Email</h2>
        
        {status === 'loading' && <div className="text-blue-600">Загрузка...</div>}
        
        {status === 'success' && (
          <div className="text-green-600">
            <p className="mb-4">{message}</p>
            <Link href="/login" className="px-6 py-2 bg-blue-600 text-foreground rounded-lg hover:bg-blue-700 inline-block">
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

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Загрузка...</div>}>
      <VerifyContent />
    </Suspense>
  );
}
