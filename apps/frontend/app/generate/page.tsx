"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGenerationStore, useAuthStore } from '../../store';
import { useSearchParams } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { api } from '../../lib/api';

function GeneratorContent() {
  const searchParams = useSearchParams();
  const templateName = searchParams.get('template');

  const { prompt, setPrompt, model, setModel, isGenerating, setGenerating, resultImage, setResult, initImage, setInitImage } = useGenerationStore();
  const { user, deductCredits, setCredits } = useAuthStore();
  const [loadingText, setLoadingText] = useState('Initializing AI...');
  const [models, setModels] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);

  const fetchHistory = React.useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get('/generations/history');
      setHistory(res.data);
    } catch (e) {
      console.error('Failed to fetch history', e);
    }
  }, [user]);

  // 0. Prefill template if passed
  React.useEffect(() => {
    if (templateName && !prompt) {
      setPrompt(`Style of ${templateName}, detailed, masterpiece, 8k resolution, highly realistic...`);
    }
  }, [templateName]);

  // 2. Fetch Models from backend (Simulated or real if endpoint exists)
  React.useEffect(() => {
    // For now, hardcode the seeded models since we don't have a GET /models endpoint yet
    setModels([
      { id: 'sdxl-1.0', name: 'Stable Diffusion XL 1.0 (Seed)' },
      { id: 'dall-e-3', name: 'OpenAI DALL-E 3 (Seed)' }
    ]);
  }, []);

  const onDrop = React.useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setInitImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [setInitImage]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1
  });

  const handleGenerate = async () => {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    if (!prompt) return;
    setGenerating(true);
    setLoadingText('Отправка промпта...');
    
    try {
      // Note: We're mapping 'sdxl-1.0' to the actual DB ID. Since we seeded it, we need the UUID.
      // Wait, we seeded it by name, but we don't know the UUID here!
      // To fix this without a GET /models endpoint, we will temporarily just send the model name and let the backend resolve it, 
      // or we just bypass the DB model check in backend for this test.
      // Actually, let's just assume the backend expects aiModelId. We will send the string name and update the backend to find by name!
      
      const res = await api.post('/generations', {
        aiModelId: model, 
        prompt,
        initImage, // Send base64 image if available
      });

      const generationId = res.data.id;
      deductCredits(5); // Deduct only after backend accepted the request
      setLoadingText('В очереди...');

      // Poll every 1.5 seconds, max 60 seconds
      let elapsed = 0;
      const poll = setInterval(async () => {
        elapsed += 1500;
        if (elapsed > 60000) {
          clearInterval(poll);
          setGenerating(false);
          alert('Превышено время ожидания генерации. Попробуйте позже.');
          return;
        }
        try {
          const statusRes = await api.get(`/generations/${generationId}`);
          const status = statusRes.data.status;
          
          if (status === 'PROCESSING') {
            setLoadingText('Генерация...');
          } else if (status === 'DONE') {
            clearInterval(poll);
            setResult(statusRes.data.result.imageUrl);
            setGenerating(false);
            fetchHistory();
            // Sync credits from backend
            try {
              const meRes = await api.get('/auth/me');
              if (typeof meRes.data.credits === 'number') setCredits(meRes.data.credits);
            } catch (_) {}
          } else if (status === 'FAILED') {
            clearInterval(poll);
            alert('Генерация не удалась!');
            setGenerating(false);
          }
        } catch (pollErr) {
          console.error('Polling error:', pollErr);
        }
      }, 1500);

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

  React.useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6 p-6">
      
      {/* Left Panel: Controls */}
      <div className="w-full lg:w-[400px] flex flex-col gap-6">
        
        {/* Image Upload Zone */}
        <div className="glass-card p-5 rounded-2xl">
          <h2 className="text-lg font-bold mb-4">Исходное фото (Опционально)</h2>
          <div 
            {...getRootProps()} 
            className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/20 hover:border-white/40 bg-black/30'
            }`}
          >
            <input {...getInputProps()} />
            {initImage ? (
              <div className="relative group">
                <img src={initImage} alt="Initial" className="w-full h-32 object-contain rounded-lg" />
                <div 
                  className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => { e.stopPropagation(); setInitImage(null); }}
                >
                  <span className="text-white font-bold text-sm bg-red-500/80 px-3 py-1 rounded-full cursor-pointer">Удалить</span>
                </div>
              </div>
            ) : (
              <div className="text-gray-400 py-6">
                <p>Перетащите фото сюда или нажмите для выбора</p>
                <p className="text-xs mt-2 text-gray-500">Поддерживаются форматы JPG, PNG</p>
              </div>
            )}
          </div>
        </div>

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
        
        {/* History Gallery */}
        <div className="h-48 border-t border-white/10 bg-black/40 p-4 overflow-x-auto overflow-y-hidden whitespace-nowrap scrollbar-hide">
          <h3 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">Мои генерации (Google Drive)</h3>
          <div className="flex gap-4 h-[100px]">
            {history.length === 0 ? (
              <div className="text-gray-500 text-sm flex items-center h-full">История пуста. Создайте свою первую картинку!</div>
            ) : (
              history.map((item) => (
                <div key={item.id} className="relative aspect-square h-full rounded-lg overflow-hidden group cursor-pointer" onClick={() => setResult(item.imageUrl)}>
                  <img src={item.imageUrl} alt={item.prompt} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                    <span className="text-white text-[10px] font-bold truncate">{item.template || item.model}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

    </div>
  );
}

export default function GeneratorPage() {
  return (
    <React.Suspense fallback={<div className="h-full flex items-center justify-center text-white">Loading...</div>}>
      <GeneratorContent />
    </React.Suspense>
  );
}
