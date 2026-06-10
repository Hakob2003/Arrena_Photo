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
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold mb-2">AI Providers</h1>
      <p className="text-gray-400 mb-10">Connect your API keys or local instances to generate images without spending platform credits.</p>

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
                <label className="text-xs text-gray-500 uppercase font-semibold mb-1 block">API Key</label>
                <input 
                  type="password" 
                  placeholder={p.status === 'connected' ? '••••••••••••••••' : 'sk-...'}
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              
              {p.id === 'comfyui' && (
                <div>
                  <label className="text-xs text-gray-500 uppercase font-semibold mb-1 block">Endpoint URL</label>
                  <input 
                    type="text" 
                    placeholder="http://127.0.0.1:8188"
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                  p.status === 'connected' 
                  ? 'bg-white/10 hover:bg-red-500/20 hover:text-red-400 text-gray-300' 
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}>
                  {p.status === 'connected' ? 'Disconnect' : 'Connect'}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
