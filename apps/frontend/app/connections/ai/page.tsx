"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function AiConnectionsPage() {
  const providers = [
    { id: 'openai', name: 'OpenAI', status: 'connected', color: 'from-green-500 to-emerald-700' },
    { id: 'huggingface', name: 'Hugging Face', status: 'disconnected', color: 'from-yellow-400 to-orange-500' },
    { id: 'comfyui', name: 'Local ComfyUI', status: 'disconnected', color: 'from-blue-500 to-indigo-600' },
    { id: 'stability', name: 'Stability AI', status: 'connected', color: 'from-purple-500 to-pink-600' },
  ];

  return (
    <div className="p-4 sm:p-8 w-full">
      <h1 className="text-3xl sm:text-4xl font-bold mb-2">AI Провайдеры</h1>
      <p className="text-slate-500 dark:text-gray-400 mb-10">Подключите свои API-ключи или локальные инстансы для генерации без траты кредитов платформы.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {providers.map((p, i) => (
          <motion.div 
            key={p.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6 rounded-2xl relative overflow-hidden"
          >
            <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${p.color}`} />
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-bold">{p.name}</h3>
              <span className={`text-xs px-2 py-1 rounded-md font-bold uppercase ${
                p.status === 'connected' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {p.status}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 dark:text-gray-500 uppercase font-semibold mb-1 block">API Key</label>
                <input 
                  type="password" 
                  placeholder={p.status === 'connected' ? '••••••••••••••••' : 'sk-...'}
                  className="w-full bg-transparent/50 border border-black/10 dark:border-white/10 rounded-lg p-2.5 text-sm text-slate-900 dark:text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              
              {p.id === 'comfyui' && (
                <div>
                  <label className="text-xs text-slate-400 dark:text-gray-500 uppercase font-semibold mb-1 block">Endpoint URL</label>
                  <input 
                    type="text" 
                    placeholder="http://127.0.0.1:8188"
                    className="w-full bg-transparent/50 border border-black/10 dark:border-white/10 rounded-lg p-2.5 text-sm text-slate-900 dark:text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button className={`w-full sm:w-auto px-4 py-3 sm:py-2 rounded-lg text-sm font-bold transition-colors min-h-[44px] ${
                  p.status === 'connected' 
                  ? 'bg-black/[0.05] dark:bg-white/10 hover:bg-red-500/20 hover:text-red-400 text-gray-300' 
                  : 'bg-indigo-600 shadow-[0_8px_24px_rgba(99,102,241,0.25)] dark:shadow-none hover:bg-indigo-700 text-white'
                }`}>
                  {p.status === 'connected' ? 'Отключить' : 'Подключить'}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
