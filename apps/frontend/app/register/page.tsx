'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/register', { email, password, name });
      setMessage(res.data.message || 'Регистрация успешна! Проверьте вашу почту.');
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
      setMessage('');
    }
  };

  const handleOAuth = (provider: string) => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/${provider}`;
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md p-6 sm:p-8 bg-primary dark:bg-muted rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-6 text-center text-foreground dark:text-foreground">Регистрация</h2>
        
        {error && <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-md text-sm">{error}</div>}
        {message && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md text-sm">{message}</div>}

        <form onSubmit={handleRegister} className="space-y-4" autoComplete="off">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-muted-foreground mb-1">Имя</label>
            <input 
              type="text" 
              required
              autoComplete="off"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-foreground"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-muted-foreground mb-1">Email</label>
            <input 
              type="email" 
              required
              autoComplete="off"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-foreground"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-muted-foreground mb-1">Пароль</label>
            <input 
              type="password" 
              required
              autoComplete="new-password"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-foreground"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-foreground rounded-lg font-medium transition-colors">
            Зарегистрироваться
          </button>
        </form>

        <div className="mt-6 flex items-center justify-center space-x-2 text-sm text-muted-foreground">
          <span className="h-px bg-gray-300 flex-1"></span>
          <span>Или войти через</span>
          <span className="h-px bg-gray-300 flex-1"></span>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
          <button onClick={() => handleOAuth('google')} className="py-2 border border-gray-300 dark:border-gray-600 rounded-lg flex justify-center items-center hover:bg-background dark:hover:bg-gray-700 transition text-sm">
            Google
          </button>
          <button onClick={() => handleOAuth('facebook')} className="py-2 border border-gray-300 dark:border-gray-600 rounded-lg flex justify-center items-center hover:bg-background dark:hover:bg-gray-700 transition text-sm">
            Facebook
          </button>
          <button onClick={() => handleOAuth('vk')} className="py-2 border border-gray-300 dark:border-gray-600 rounded-lg flex justify-center items-center hover:bg-background dark:hover:bg-gray-700 transition text-sm">
            VK
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground dark:text-muted-foreground">
          Уже есть аккаунт? <Link href="/login" className="text-blue-600 hover:underline">Войти</Link>
        </p>
      </div>
    </div>
  );
}
