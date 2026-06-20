'use client'; // Error boundaries must be Client Components

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Next.js caught an error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] dark:bg-black text-slate-900 dark:text-white p-4">
      <div className="max-w-md w-full bg-red-900/20 border border-red-500/50 rounded-xl p-6 text-center shadow-xl">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Произошла ошибка (Что-то пошло не так)</h2>
        <p className="text-gray-300 mb-6 font-mono text-sm break-all">{error.message || 'Неизвестная ошибка интерфейса'}</p>
        <button
          className="px-6 py-2 bg-red-600 hover:bg-red-700 text-slate-900 dark:text-white font-bold rounded-lg transition-colors"
          onClick={
            // Attempt to recover by trying to re-render the segment
            () => reset()
          }
        >
          Попробовать снова
        </button>
      </div>
    </div>
  );
}
