"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGenerationStore, useAuthStore } from '../../store';

import { api } from '../../lib/api';

export default function GeneratorPage() {
  const { prompt, setPrompt, model, setModel, isGenerating, setGenerating, resultImage, setResult } = useGenerationStore();
  const { user, login, deductCredits } = useAuthStore();
  const [loadingText, setLoadingText] = useState('Initializing AI...');
  const [models, setModels] = useState<any[]>([]);

  // 1. Auto-login as test user for now (Bypassing UI login page)
  React.useEffect(() => {
    if (!user) {
      api.post('/auth/login', { email: 'test@example.com', password: 'dummy_password' })
        .then(res => {
          login(res.data.user, res.data.accessToken);
        })
        .catch(err => console.error('Failed to auto-login test user:', err));
    }
  }, [user, login]);

  // 2. Fetch Models from backend (Simulated or real if endpoint exists)
  React.useEffect(() => {
    // For now, hardcode the seeded models since we don't have a GET /models endpoint yet
    setModels([
      { id: 'sdxl-1.0', name: 'Stable Diffusion XL 1.0 (Seed)' },
      { id: 'dall-e-3', name: 'OpenAI DALL-E 3 (Seed)' }
    ]);
  }, []);

  const handleGenerate = async () => {
    if (!prompt || !user) return;
    setGenerating(true);
    deductCredits(5);
    setLoadingText('Submitting prompt to backend...');
    
    try {
      // Note: We're mapping 'sdxl-1.0' to the actual DB ID. Since we seeded it, we need the UUID.
      // Wait, we seeded it by name, but we don't know the UUID here!
      // To fix this without a GET /models endpoint, we will temporarily just send the model name and let the backend resolve it, 
      // or we just bypass the DB model check in backend for this test.
      // Actually, let's just assume the backend expects aiModelId. We will send the string name and update the backend to find by name!
      
      const res = await api.post('/generations', {
        aiModelId: model, // Temporarily sending name, will fix backend to accept name
        prompt,
      });

      const generationId = res.data.id;
      setLoadingText('Waiting in queue (BullMQ)...');

      // Poll every 1 second
      const poll = setInterval(async () => {
        try {
          const statusRes = await api.get(`/generations/${generationId}`);
          const status = statusRes.data.status;
          
          if (status === 'PROCESSING') {
            setLoadingText('Generation in progress...');
          } else if (status === 'DONE') {
            clearInterval(poll);
            setResult(statusRes.data.result.imageUrl);
            setGenerating(false);
          } else if (status === 'FAILED') {
            clearInterval(poll);
            alert('Generation failed!');
            setGenerating(false);
          }
        } catch (pollErr) {
          console.error('Polling error:', pollErr);
        }
      }, 1000);

    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 400 && err.response?.data?.message === 'Insufficient credits') {
        alert('У вас недостаточно кредитов для генерации! (Insufficient credits)');
      } else {
        alert('Failed to submit generation');
      }
      setGenerating(false);
    }
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6 p-6">
      
      {/* Left Panel: Controls */}
      <div className="w-full lg:w-[400px] flex flex-col gap-6">
        <div className="glass-card p-5 rounded-2xl">
          <h2 className="text-lg font-bold mb-4">Промпт (Описание)</h2>
          <textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Футуристический киберпанк город ночью, неоновые огни отражаются в лужах..."
            className="w-full h-40 bg-black/50 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <h2 className="text-lg font-bold mb-4">Модель и Настройки</h2>
          <select 
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white mb-4 outline-none"
          >
            {models.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>

          {/* Fake settings sliders */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Соотношение сторон (Aspect Ratio)</span>
                <span>16:9</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="w-[70%] h-full bg-indigo-500 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        <button 
          onClick={handleGenerate}
          disabled={isGenerating || !prompt}
          className={`mt-auto py-4 rounded-xl font-bold text-lg transition-all ${
            isGenerating || !prompt 
            ? 'bg-white/10 text-gray-500 cursor-not-allowed' 
            : 'bg-white text-black hover:bg-gray-200 hover:scale-[1.02] neon-glow'
          }`}
        >
          {isGenerating ? 'Генерация...' : 'Создать ⚡ 5 Кредитов'}
        </button>
      </div>

      {/* Right Panel: Output */}
      <div className="flex-1 glass-card rounded-2xl flex flex-col relative overflow-hidden">
        {/* Topbar inside output */}
        <div className="absolute top-0 w-full h-14 bg-gradient-to-b from-black/80 to-transparent z-10 flex items-center px-6 justify-end">
           {resultImage && !isGenerating && (
             <div className="flex gap-2">
               <button className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/20 transition-colors">📥</button>
               <button className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/20 transition-colors">🔍</button>
             </div>
           )}
        </div>

        {/* Content Area */}
        <div className="flex-1 flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/[0.02] to-transparent">
          {isGenerating ? (
            <div className="flex flex-col items-center gap-6">
              <div className="w-24 h-24 border-4 border-white/10 border-t-indigo-500 rounded-full animate-spin" />
              <motion.p 
                key={loadingText}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-indigo-400 font-medium tracking-wide"
              >
                {loadingText}
              </motion.p>
            </div>
          ) : resultImage ? (
            <motion.img 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              src={resultImage} 
              alt="Generated" 
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl" 
            />
          ) : (
            <div className="text-gray-600 text-lg">
              Ожидание вашего промпта...
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
