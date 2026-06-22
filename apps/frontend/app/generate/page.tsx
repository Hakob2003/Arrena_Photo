"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGenerationStore, useAuthStore } from '../../store';
import { useSearchParams } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { api } from '../../lib/api';
import { AuthImage } from '@/components/ui/AuthImage';
import { templatesApi } from '../../lib/templates.api';
import toast from 'react-hot-toast';

function GeneratorContent() {
  const searchParams = useSearchParams();
  const templateId = searchParams.get('templateId');
  const templateName = searchParams.get('template');

  const { prompt, setPrompt, model, setModel, isGenerating, setGenerating, resultImage, setResult, initImage, setInitImage } = useGenerationStore();
  const { user, deductCredits, setCredits } = useAuthStore();
  const [loadingText, setLoadingText] = useState('Initializing AI...');
  const [models, setModels] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [cost, setCost] = useState(5);

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
    const loadTemplateData = async () => {
      if (templateId) {
        try {
          const tpl = await templatesApi.getTemplate(templateId);
          if (tpl) {
            const latestVersion = tpl.versions?.[0];
            if (latestVersion?.prompt) {
              setPrompt(latestVersion.prompt);
            } else if (tpl.prompt) {
              setPrompt(tpl.prompt);
            }
            if (tpl.recommendedModels?.[0]) {
              setModel(tpl.recommendedModels[0]);
            }
            if (tpl.price !== undefined && tpl.price !== null) {
              setCost(tpl.price);
            }
          }
        } catch (error) {
          console.error("Failed to load template details:", error);
        }
      } else if (templateName && !prompt) {
        setPrompt(`Style of ${templateName}, detailed, masterpiece, 8k resolution, highly realistic...`);
      }
    };

    loadTemplateData();
  }, [templateId, templateName, setPrompt, setModel]);

  // 2. Fetch Models from backend
  React.useEffect(() => {
    const fetchModels = async () => {
      try {
        const res = await api.get('/generations/models');
        if (res.data && res.data.length > 0) {
          setModels(res.data);
          // Set first model as default if none selected
          const currentModel = useGenerationStore.getState().model;
          const matchedModel = res.data.find((m: any) => m.id === currentModel || m.slug === currentModel || m.name === currentModel);
          if (matchedModel) {
            // Update to use the actual UUID so the <select> works correctly
            if (currentModel !== matchedModel.id) {
              setModel(matchedModel.id);
            }
          } else {
            setModel(res.data[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to fetch AI models', err);
        // Fallback for development if backend is down
        setModels([
          { id: 'sdxl-1.0', name: 'Stable Diffusion XL 1.0 (Fallback)' },
          { id: 'dall-e-3', name: 'OpenAI DALL-E 3 (Fallback)' }
        ]);
      }
    };
    fetchModels();
  }, [setModel]);

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

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1,
    noClick: !!initImage,
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
      const res = await api.post('/generations', {
        prompt,
        negativePrompt: '',
        aiModelId: model,
        templateId: templateId || undefined,

        initImage: initImage
      });

      const generationId = res.data.id;
      deductCredits(cost); // Deduct only after backend accepted the request
      setLoadingText('В очереди...');

      // Poll every 1.5 seconds, max 60 seconds
      let elapsed = 0;
      const poll = setInterval(async () => {
        elapsed += 1500;
        if (elapsed > 60000) {
          clearInterval(poll);
          setGenerating(false);
          toast.error('Превышено время ожидания генерации. Попробуйте позже.');
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
            toast.error('Генерация не удалась!');
            setGenerating(false);
          }
        } catch (pollErr) {
          console.error('Polling error:', pollErr);
        }
      }, 1500);

    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 400 && err.response?.data?.message === 'Insufficient credits') {
        toast.error('У вас недостаточно кредитов для генерации!');
      } else {
        toast.error('Ошибка при отправке запроса генерации');
      }
      setGenerating(false);
    }
  };

  React.useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return (
    <div className="h-full flex flex-col lg:flex-row gap-3 sm:gap-4 xl:gap-6 p-3 sm:p-4 xl:p-6 overflow-y-auto lg:overflow-hidden">
      
      {/* Left Panel: Controls */}
      <div className="w-full lg:w-[320px] xl:w-[380px] 2xl:w-[400px] lg:shrink-0 flex flex-col gap-4 sm:gap-6 overflow-y-auto pb-2 pr-1 custom-scrollbar">
        
        {/* Image Upload Zone */}
        <div className="glass-card p-5 rounded-2xl shrink-0">
          <h2 className="text-lg font-bold mb-4">Исходное фото (Опционально)</h2>
          <div 
            {...getRootProps()} 
            className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-indigo-500 bg-indigo-500/10' : 'border-black/20 dark:border-white/20 hover:border-white/40 bg-[#fafafa] dark:bg-black/30'
            }`}
          >
            <input {...getInputProps()} />
            {initImage ? (
              <div className="relative group">
                <img src={initImage} alt="Initial" className="w-full h-32 object-contain rounded-lg" />
                <div 
                  className="absolute inset-0 bg-[#fafafa] dark:bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => { e.stopPropagation(); setInitImage(null); }}
                >
                  <span className="text-slate-900 dark:text-white font-bold text-sm bg-red-500/80 px-3 py-1 rounded-full cursor-pointer">Удалить</span>
                </div>
              </div>
            ) : (
              <div className="text-slate-500 dark:text-gray-400 py-6">
                <p>Перетащите фото сюда или нажмите для выбора</p>
                <p className="text-xs mt-2 text-slate-400 dark:text-gray-500">Поддерживаются форматы JPG, PNG</p>
              </div>
            )}
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl shrink-0">
          <h2 className="text-lg font-bold mb-4">Промпт (Описание)</h2>
          <textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Футуристический киберпанк город ночью, неоновые огни отражаются в лужах..."
            className="w-full h-40 bg-[#fafafa] dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl p-4 text-slate-900 dark:text-slate-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
        </div>

        <div className="glass-card p-5 rounded-2xl shrink-0">
          <h2 className="text-lg font-bold mb-4">Модель и Настройки</h2>
          <select 
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full bg-[#fafafa] dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-slate-900 dark:text-white mb-4 outline-none"
          >
            {models.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>

          {/* Fake settings sliders */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs text-slate-500 dark:text-gray-400 mb-1">
                <span>Соотношение сторон (Aspect Ratio)</span>
                <span>16:9</span>
              </div>
              <div className="h-2 bg-black/[0.05] dark:bg-white/10 rounded-full overflow-hidden">
                <div className="w-[70%] h-full bg-indigo-500 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        <button 
          onClick={handleGenerate}
          disabled={isGenerating || !prompt}
          className={`shrink-0 mt-auto py-4 rounded-xl font-bold text-lg transition-all ${
            isGenerating || !prompt 
            ? 'bg-black/[0.05] dark:bg-white/10 text-slate-400 dark:text-gray-500 cursor-not-allowed' 
            : 'bg-white text-black hover:bg-gray-200 hover:scale-[1.02] neon-glow'
          }`}
        >
          {isGenerating ? 'Генерация...' : `Создать ⚡ ${cost} Кредитов`}
        </button>
      </div>

      {/* Right Panel: Output */}
      <div className="flex-1 min-h-[400px] lg:min-h-0 glass-card rounded-2xl flex flex-col relative overflow-hidden">
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
        <div className="flex-1 flex items-center justify-center p-3 sm:p-4 lg:p-6 preview-area-compact bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/[0.02] to-transparent">
          {isGenerating ? (
            <div className="flex flex-col items-center gap-4 sm:gap-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-black/10 dark:border-white/10 border-t-indigo-500 rounded-full animate-spin" />
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
        <div className="h-32 sm:h-36 lg:h-40 xl:h-44 shrink-0 gallery-container-compact border-t border-black/10 dark:border-white/10 bg-[#fafafa] dark:bg-black/40 p-3 sm:p-4 overflow-x-auto overflow-y-hidden whitespace-nowrap scrollbar-hide">
          <h3 className="text-[10px] sm:text-xs font-bold gallery-title-compact text-slate-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Мои генерации (Google Drive)</h3>
          <div className="flex w-max gap-2 sm:gap-4 h-[60px] sm:h-[70px] lg:h-[80px] xl:h-[90px] gallery-items-compact">
            {history.length === 0 ? (
              <div className="text-slate-400 dark:text-gray-500 text-sm flex items-center h-full">История пуста. Создайте свою первую картинку!</div>
            ) : (
              history.map((item) => (
                <div key={item.id} className="relative aspect-square h-full shrink-0 rounded-lg overflow-hidden group cursor-pointer" onClick={() => setResult(item.imageUrl)}>
                  <AuthImage driveFileId={item.driveFileId} fallbackUrl={item.imageUrl} alt={item.prompt} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  <div className="absolute inset-0 bg-[#fafafa] dark:bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                    <span className="text-slate-900 dark:text-slate-900 dark:text-white text-[10px] font-bold truncate">{item.template || item.model}</span>
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
    <React.Suspense fallback={<div className="h-full flex items-center justify-center text-slate-900 dark:text-slate-900 dark:text-white">Loading...</div>}>
      <GeneratorContent />
    </React.Suspense>
  );
}
