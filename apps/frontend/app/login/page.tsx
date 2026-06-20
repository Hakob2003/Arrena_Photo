'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { login } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Handle auto-login if token is present in URL (e.g. from OAuth redirect)
  useEffect(() => {
    if (token) {
      try {
        // Simple JWT decode to get user info
        const payload = JSON.parse(atob(token.split('.')[1]));
        const user = {
          id: payload.sub,
          email: payload.email,
          role: typeof payload.role === 'object' && payload.role !== null ? payload.role.name : payload.role,
          name: payload.email?.split('@')[0] || 'User',
        };
        // Store in localStorage for persistence if needed in other places
        localStorage.setItem('token', token);
        login(user, token);
        if (user.role === 'ADMIN') {
          router.push('/admin');
        } else {
          router.push('/');
        }
      } catch (err) {
        console.error('Failed to parse token', err);
        setError('Неверный токен авторизации');
      }
    }
  }, [token, login, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      const token = res.data.access_token;
      localStorage.setItem('token', token);
      
      // Decode JWT token
      const payload = JSON.parse(atob(token.split('.')[1]));
      const user = {
        id: payload.sub,
        email: payload.email,
        role: typeof payload.role === 'object' && payload.role !== null ? payload.role.name : payload.role,
        name: payload.email?.split('@')[0] || 'User',
      };

      login(user, token);
      if (user.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  const handleOAuth = (provider: string) => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/${provider}`;
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md p-6 sm:p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">Вход</h2>
        
        {error && <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-md text-sm">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4" autoComplete="off">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input 
              type="email" 
              required
              autoComplete="off"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Пароль</label>
            <input 
              type="password" 
              required
              autoComplete="new-password"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-slate-900 dark:text-white rounded-lg font-medium transition-colors">
            Войти
          </button>
        </form>

        <div className="mt-6 flex items-center justify-center space-x-2 text-sm text-slate-400 dark:text-gray-500">
          <span className="h-px bg-gray-300 flex-1"></span>
          <span>Или войти через</span>
          <span className="h-px bg-gray-300 flex-1"></span>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
          <button onClick={() => handleOAuth('google')} className="py-2 border border-gray-300 dark:border-gray-600 rounded-lg flex justify-center items-center hover:bg-gray-50 dark:hover:bg-gray-700 transition text-sm">
            Google
          </button>
          <button onClick={() => handleOAuth('facebook')} className="py-2 border border-gray-300 dark:border-gray-600 rounded-lg flex justify-center items-center hover:bg-gray-50 dark:hover:bg-gray-700 transition text-sm">
            Facebook
          </button>
          <button onClick={() => handleOAuth('vk')} className="py-2 border border-gray-300 dark:border-gray-600 rounded-lg flex justify-center items-center hover:bg-gray-50 dark:hover:bg-gray-700 transition text-sm">
            VK
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          Нет аккаунта? <Link href="/register" className="text-blue-600 hover:underline">Зарегистрироваться</Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Загрузка...</div>}>
      <LoginContent />
    </Suspense>
  );
}
