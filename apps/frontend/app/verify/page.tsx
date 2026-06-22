'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store';
import { useTranslation } from '@/lib/i18n';

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const login = useAuthStore((state) => state.login);
  const { t } = useTranslation();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState(t('verify.checking'));

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage(t('verify.tokenNotFound'));
      return;
    }

    api.get(`/auth/verify?token=${token}`)
      .then((res: any) => {
        setStatus('success');
        setMessage(res.data.message || t('verify.success'));
        // Automatically log the user in if the token is provided
        if (res.data && res.data.token && res.data.user) {
          login(res.data.user, res.data.token);
          setTimeout(() => router.push('/'), 2000);
        }
      })
      .catch((err: any) => {
        setStatus('error');
        setMessage(err.response?.data?.message || t('verify.tokenNotFound'));
      });
  }, [token, router, login]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 text-center">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-slate-900 dark:text-white">{t('verify.title')}</h2>
        
        {status === 'loading' && <div className="text-blue-600">{t('auth.loading')}</div>}
        
        {status === 'success' && (
          <div className="text-green-600">
            <p className="mb-4">{message}</p>
            <Link href="/login" className="px-6 py-2 bg-blue-600 text-slate-900 dark:text-slate-900 dark:text-white rounded-lg hover:bg-blue-700 inline-block">
              {t('auth.login')}
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="text-red-600">
            <p className="mb-4">{message}</p>
            <Link href="/login" className="text-blue-600 hover:underline">{t('verify.backToLogin')}</Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <VerifyContent />
    </Suspense>
  );
}
