'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuthStore, useUIStore } from '@/store';
import { useTranslation } from '@/lib/i18n';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { login } = useAuthStore();
  const { t } = useTranslation();
  const isLuxury = useUIStore(state => state.preferences?.skin === 'LUXURY');
  
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
        setError(t('auth.invalidToken'));
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
      console.log('Login failed:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  const handleOAuth = (provider: string) => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/${provider}`;
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center p-4">
      <div className="w-full max-w-md p-6 sm:p-8 bg-white dark:bg-[#0a0a0a] glass-card rounded-2xl shadow-xl border border-black/10 dark:border-white/10">
        <h2 className="text-2xl font-bold mb-6 text-center text-slate-900 dark:text-white">{t('auth.loginTitle')}</h2>
        
        {error && <div className="mb-4 p-3 bg-red-100 text-red-600 border border-red-200 rounded-lg text-sm">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4" autoComplete="off">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Email</label>
            <input 
              type="email" 
              required
              autoComplete="off"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none bg-slate-50 dark:bg-[#111] text-slate-900 dark:text-white transition-colors ${
                isLuxury ? 'border-black/10 dark:border-white/10 focus:border-[#D4AF37] focus:ring-[#D4AF37]/20' : 'border-black/10 dark:border-white/10 focus:border-indigo-500 focus:ring-indigo-500/20'
              }`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">{t('auth.password')}</label>
            <input 
              type="password" 
              required
              autoComplete="new-password"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none bg-slate-50 dark:bg-[#111] text-slate-900 dark:text-white transition-colors ${
                isLuxury ? 'border-black/10 dark:border-white/10 focus:border-[#D4AF37] focus:ring-[#D4AF37]/20' : 'border-black/10 dark:border-white/10 focus:border-indigo-500 focus:ring-indigo-500/20'
              }`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button 
            type="submit" 
            className={`w-full py-2.5 rounded-lg font-medium transition-all ${
              isLuxury 
                ? 'bg-[#D4AF37] hover:bg-[#C5A028] text-black shadow-[0_4px_14px_rgba(212,175,55,0.4)]'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-[0_4px_14px_rgba(79,70,229,0.4)]'
            }`}
          >
            {t('auth.login')}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-center space-x-2 text-sm text-slate-400 dark:text-gray-500">
          <span className="h-px bg-black/10 dark:bg-white/10 flex-1"></span>
          <span>{t('auth.orLoginWith')}</span>
          <span className="h-px bg-black/10 dark:bg-white/10 flex-1"></span>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
          <button onClick={() => handleOAuth('google')} className="py-2.5 bg-white dark:bg-[#111] border border-black/10 dark:border-white/10 text-slate-700 dark:text-gray-300 rounded-lg flex justify-center items-center hover:bg-slate-50 dark:hover:bg-white/5 transition text-sm font-medium">
            Google
          </button>
          <button onClick={() => handleOAuth('facebook')} className="py-2.5 bg-white dark:bg-[#111] border border-black/10 dark:border-white/10 text-slate-700 dark:text-gray-300 rounded-lg flex justify-center items-center hover:bg-slate-50 dark:hover:bg-white/5 transition text-sm font-medium">
            Facebook
          </button>
          <button onClick={() => handleOAuth('vk')} className="py-2.5 bg-white dark:bg-[#111] border border-black/10 dark:border-white/10 text-slate-700 dark:text-gray-300 rounded-lg flex justify-center items-center hover:bg-slate-50 dark:hover:bg-white/5 transition text-sm font-medium">
            VK
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-slate-600 dark:text-gray-400">
          {t('auth.noAccount')}{' '}
          <Link href="/register" className={`font-medium hover:underline transition-colors ${isLuxury ? 'text-[#D4AF37]' : 'text-indigo-600 dark:text-indigo-400'}`}>
            {t('auth.registerLink')}
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
