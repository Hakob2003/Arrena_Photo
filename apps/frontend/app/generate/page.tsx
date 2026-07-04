"use client";
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Maximize2, X } from 'lucide-react';
import { useGenerationStore, useAuthStore } from '../../store';
import { useTranslation } from '../../lib/i18n';
import { useSearchParams } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { api } from '../../lib/api';
import { AuthImage } from '@/components/ui/AuthImage';
import { templatesApi } from '../../lib/templates.api';
import { generationsApi } from '../../lib/generations.api';
import toast from 'react-hot-toast';
import { useUIStore } from '../../store';
import Link from 'next/link';

function GeneratorContent() {
  const searchParams = useSearchParams();
  const templateId = searchParams.get('templateId');
  const templateName = searchParams.get('template');
  const remixId = searchParams.get('remixId');

  const { prompt, setPrompt, model, setModel, aspectRatio, setAspectRatio, resolution, setResolution, isGenerating, setGenerating, resultImage, resultDriveFileId, setResult, initImage, setInitImage, progress, setProgress } = useGenerationStore();
  const { user, deductCredits, setCredits, planId } = useAuthStore();
  const { t } = useTranslation();
  const [loadingText, setLoadingText] = useState('');
  const [models, setModels] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [cost, setCost] = useState(5);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [activeGenerationId, setActiveGenerationId] = useState<string | null>(null);
  const pollRef = React.useRef<NodeJS.Timeout | null>(null);
  const [mounted, setMounted] = useState(false);
  const isLuxury = useUIStore(state => state.preferences?.skin === 'LUXURY');

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchHistory = React.useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get('/generations/history');
      setHistory(res.data);
      
      // Sync credits and planId from backend to avoid state mismatch
      const meRes = await api.get('/auth/me');
      if (typeof meRes.data.credits === 'number') setCredits(meRes.data.credits);
      if (meRes.data.planId && meRes.data.planId !== useAuthStore.getState().planId) {
        useAuthStore.setState({ planId: meRes.data.planId });
      }
    } catch (e) {
      console.log('Failed to fetch history or sync profile', e);
    }
  }, [user, setCredits]);

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
            
            const fetchedCost = tpl.price !== undefined && tpl.price !== null ? tpl.price : 5;
            setCost(fetchedCost);
            
            // Mark as premium template in the global store and persist ID/cost so it stays valid during SPA navigation
            useGenerationStore.getState().setPremiumTemplate(true, templateId, fetchedCost);
          }
        } catch (error) {
          console.log("Failed to load template details:", error);
        }
      } else if (templateName && !prompt) {
        setPrompt(`Style of ${templateName}, detailed, masterpiece, 8k resolution, highly realistic...`);
      } else if (useGenerationStore.getState().isPremiumTemplate && useGenerationStore.getState().activeTemplateCost !== null) {
        // If navigating back to generate page via SPA and premium template is still active
        setCost(useGenerationStore.getState().activeTemplateCost as number);
      }
    };

    const loadRemixData = async () => {
      if (remixId) {
        try {
          const gen = await generationsApi.getStatus(remixId);
          if (gen) {
            if (gen.prompt) setPrompt(gen.prompt);
            if (gen.settings?.resolution) setResolution(gen.settings.resolution);
            if (gen.settings?.aspectRatio) setAspectRatio(gen.settings.aspectRatio);
            if (gen.aiModelId) setModel(gen.aiModelId);
          }
        } catch (e) {
          console.log("Failed to load remix data", e);
        }
      }
    };

    if (remixId) {
      loadRemixData();
    } else {
      loadTemplateData();
    }
  }, [templateId, templateName, remixId, setPrompt, setModel, setResolution, setAspectRatio]);

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
        console.log('Failed to fetch AI models', err);
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


  const handleStopRequest = () => {
    setShowCancelModal(true);
  };

  const confirmStop = async () => {
    if (pollRef.current) clearInterval(pollRef.current);
    
    if (activeGenerationId) {
      try {
        await api.post(`/generations/${activeGenerationId}/cancel`);
      } catch (err) {
        console.log('Failed to cancel generation on backend', err);
      }
      setActiveGenerationId(null);
    }

    setShowCancelModal(false);
    setGenerating(false);
    setProgress(0);
    setLoadingText('');
    toast.error(t('generate.cancelError'));
  };

  const cancelStop = () => {
    setShowCancelModal(false);
  };

  const handleGenerate = async () => {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    if (!prompt || !initImage) return;

    setGenerating(true);
    setLoadingText(t('gen.sendingPrompt'));
    
    try {
      const storeTemplateId = useGenerationStore.getState().activeTemplateId;
      const finalTemplateId = storeTemplateId || ((templateId && templateId !== 'null' && templateId !== 'undefined' && templateId.length > 20) ? templateId : undefined);

      const prefs = useUIStore.getState().preferences;
      const payload: {
        prompt: string;
        negativePrompt?: string;
        aiModelId: string;
        templateId?: string;
        aspectRatio?: string;
        resolution?: string;
        initImage?: string;
        skin?: string;
        accentColor?: string;
      } = {
        prompt,
        negativePrompt: '',
        aiModelId: model,
        templateId: finalTemplateId,
        aspectRatio,
        resolution,
        initImage: initImage,
        skin: prefs.skin,
        accentColor: prefs.accentColor
      };
      const res = await api.post('/generations', payload);

      const generationId = res.data.id;
      setActiveGenerationId(generationId);
      deductCredits(cost); // Deduct only after backend accepted the request
      setLoadingText(t('gen.inQueue'));

      // Poll every 1.5 seconds, max 60 seconds
      let elapsed = 0;
      setProgress(0);
      const estimatedTotalTime = (planId === 'FREE' || planId === 'free') ? 30000 : (planId === 'STARTER' || planId === 'starter') ? 15000 : (planId === 'PRO' || planId === 'pro') ? 10000 : 5000;
      
      pollRef.current = setInterval(async () => {
        elapsed += 1500;
        setProgress(Math.min(99, Math.floor((elapsed / estimatedTotalTime) * 100)));
        if (elapsed > 60000) {
          if (pollRef.current) clearInterval(pollRef.current);
          setGenerating(false);
          toast.error(t('gen.timeoutError'));
          return;
        }
        try {
          const statusRes = await api.get(`/generations/${generationId}`);
          const status = statusRes.data.status;
          
          if (status === 'PROCESSING') {
            setLoadingText(t('gen.generatingStatus'));
          } else if (status === 'DONE') {
            if (pollRef.current) clearInterval(pollRef.current);
            setProgress(100);
            setTimeout(() => {
              if (statusRes.data.result) {
                setResult(statusRes.data.result.imageUrl, statusRes.data.result.driveFileId);
              } else {
                toast.error(t('gen.failedError'));
              }
              setGenerating(false);
            }, 500);
            fetchHistory();
            // Sync credits from backend
            try {
              const meRes = await api.get('/auth/me');
              if (typeof meRes.data.credits === 'number') setCredits(meRes.data.credits);
            } catch (_) {}
          } else if (status === 'FAILED') {
            if (pollRef.current) clearInterval(pollRef.current);
            toast.error(t('gen.failedError'));
            setGenerating(false);
          }
        } catch (pollErr) {
          console.log('Polling error:', pollErr);
        }
      }, 1500);

    } catch (error: unknown) {
      const err = error as any;
      // Use console.log instead of console.error to avoid triggering Next.js dev overlay for expected business errors
      console.log('Generate request failed:', err.response?.data || err.message);
      
      if (err.response?.status === 400 && err.response?.data?.message === 'Insufficient credits') {
        toast.error(t('gen.creditsError'));
      } else {
        toast.error(t('gen.requestError') + ': ' + (err.response?.data?.message || err.message));
      }
      setGenerating(false);
    }
  };

  React.useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);


  React.useEffect(() => {
    const allRatios = ['1:1', '4:3', '3:4', '16:9', '9:16'];
    const validRatios = (planId === 'FREE' || planId === 'free') ? ['1:1'] : (planId === 'STARTER' || planId === 'starter') ? ['1:1', '4:3', '3:4'] : allRatios;
    if (!validRatios.includes(aspectRatio)) {
      setAspectRatio('1:1');
    }
    const allRes = ['1K', '2K', '4K'];
    const validRes = (planId === 'FREE' || planId === 'free') ? ['1K'] : (planId === 'STARTER' || planId === 'starter') ? ['1K', '2K'] : allRes;
    if (!validRes.includes(resolution)) {
      setResolution('1K');
    }
  }, [planId, aspectRatio, resolution, setAspectRatio, setResolution]);

  const allRatios = ['1:1', '4:3', '3:4', '16:9', '9:16'];
  const allowedRatios = (planId === 'FREE' || planId === 'free') 
    ? ['1:1']
    : (planId === 'STARTER' || planId === 'starter') 
      ? ['1:1', '4:3', '3:4']
      : allRatios;

  const allResolutions = ['1K', '2K', '4K'];
  const allowedResolutions = (planId === 'FREE' || planId === 'free') 
    ? ['1K']
    : (planId === 'STARTER' || planId === 'starter') 
      ? ['1K', '2K']
      : allResolutions;


  return (
    <div className="h-full flex flex-col lg:flex-row gap-3 sm:gap-4 xl:gap-6 p-3 sm:p-4 xl:p-6 overflow-y-auto lg:overflow-hidden">
      
      {/* Left Panel: Controls */}
      <div className="w-full lg:w-[320px] xl:w-[380px] 2xl:w-[400px] lg:shrink-0 flex flex-col gap-4 sm:gap-6 overflow-y-auto pb-2 pr-1 custom-scrollbar">
        
        {/* Image Upload Zone */}
        <div className="glass-card p-5 rounded-2xl shrink-0">
          <h2 className="text-lg font-bold mb-4">{t('gen.sourcePhoto')}</h2>
          <div 
            {...getRootProps()} 
            className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
              isDragActive ? (isLuxury ? 'border-[#D4AF37] bg-[#D4AF37]/10' : 'border-indigo-500 bg-indigo-500/10') : 'border-black/20 dark:border-white/20 hover:border-white/40 bg-transparent/30'
            }`}
          >
            <input {...getInputProps()} />
            {initImage ? (
              <div className="relative group">
                <img src={initImage} alt="Initial" className="w-full h-32 object-contain rounded-lg" />
                <div 
                  className="absolute inset-0 bg-transparent/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => { e.stopPropagation(); setInitImage(null); }}
                >
                  <span className="text-slate-900 dark:text-white font-bold text-sm bg-red-500/80 px-3 py-1 rounded-full cursor-pointer">{t('gen.remove')}</span>
                </div>
              </div>
            ) : (
              <div className="text-slate-500 dark:text-gray-400 py-6">
                <p>{t('gen.dropzone')}</p>
                <p className="text-xs mt-2 text-slate-400 dark:text-gray-500">{t('gen.dropzoneFormats')}</p>
              </div>
            )}
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl shrink-0">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">{t('gen.promptTitle')}</h2>
            {useGenerationStore.getState().isPremiumTemplate && (
              <button 
                onClick={() => {
                  setPrompt('');
                  useGenerationStore.getState().setPremiumTemplate(false);
                  setCost(5); // Reset to base cost
                  if (typeof window !== 'undefined') window.history.pushState({}, '', '/generate');
                }} 
                className="text-xs text-red-500 hover:text-red-400 font-medium px-2 py-1 bg-red-500/10 rounded-lg transition-colors"
              >
                {t('generate.clearPrompt')}
              </button>
            )}
          </div>
          <div className="relative">
            <textarea 
              value={(!!templateId || useGenerationStore.getState().isPremiumTemplate) && (planId === 'FREE' || planId === 'STARTER' || planId === 'free' || planId === 'starter') ? '******************************************************************' : prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={t('gen.promptPlaceholder')}
              readOnly={(!!templateId || useGenerationStore.getState().isPremiumTemplate) && (planId === 'FREE' || planId === 'STARTER' || planId === 'free' || planId === 'starter')}
              disabled={(!!templateId || useGenerationStore.getState().isPremiumTemplate) && (planId === 'FREE' || planId === 'STARTER' || planId === 'free' || planId === 'starter')}
              className={`w-full h-40 bg-transparent/50 border border-black/10 dark:border-white/10 rounded-xl p-4 text-slate-900 dark:text-slate-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 resize-none ${isLuxury ? 'focus:ring-[#D4AF37]' : 'focus:ring-indigo-500'} ${
                (!!templateId || useGenerationStore.getState().isPremiumTemplate) && (planId === 'FREE' || planId === 'STARTER' || planId === 'free' || planId === 'starter') 
                  ? 'blur-md select-none pointer-events-none opacity-50' 
                  : ''
              }`}
            />
            {(!!templateId || useGenerationStore.getState().isPremiumTemplate) && (planId === 'FREE' || planId === 'STARTER' || planId === 'free' || planId === 'starter') && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-black/20 dark:bg-black/40 rounded-xl backdrop-blur-[2px]">
                 <svg className="w-8 h-8 text-white/70 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                 </svg>
                 <p className="text-white text-center text-sm font-medium mb-3">{t('generate.hiddenPrompt')}</p>
                 <Link href="/profile/billing" className="px-4 py-2 bg-white text-black text-xs font-bold rounded-full hover:scale-105 transition-transform">{t('generate.goToPlans')}</Link>
              </div>
            )}
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl shrink-0">
          <h2 className="text-lg font-bold mb-4">{t('gen.modelTitle')}</h2>
          <select 
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full bg-transparent/50 border border-black/10 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-slate-900 dark:text-white mb-4 outline-none"
          >
            {models.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>

          {/* Aspect Ratio Selection */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs text-slate-500 dark:text-gray-400 mb-2">
                <span>{t('gen.aspectRatio')}</span>
                <span>{aspectRatio}</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {allowedRatios.map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                      aspectRatio === ratio
                        ? (isLuxury ? 'bg-[#D4AF37] text-black shadow-md' : 'bg-indigo-500 text-white shadow-md')
                        : 'bg-black/[0.05] dark:bg-white/10 text-slate-600 dark:text-gray-300 hover:bg-black/10 dark:hover:bg-white/5'
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            {/* Resolution Selection */}
            <div>
              <div className="flex justify-between text-xs text-slate-500 dark:text-gray-400 mb-2">
                <span>{t('gen.resolution')}</span>
                <span>{resolution}</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {allowedResolutions.map((resOption) => (
                  <button
                    key={resOption}
                    onClick={() => setResolution(resOption)}
                    className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors ${
                      resolution === resOption
                        ? (isLuxury ? 'bg-[#D4AF37] text-black shadow-md' : 'bg-indigo-500 text-white shadow-md')
                        : 'bg-black/[0.05] dark:bg-white/10 text-slate-600 dark:text-gray-300 hover:bg-black/10 dark:hover:bg-white/5'
                    }`}
                  >
                    {resOption}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <button 
          onClick={handleGenerate}
          disabled={isGenerating || !prompt || !initImage}
          className={`shrink-0 mt-auto py-4 rounded-xl font-bold text-lg transition-all ${
            isGenerating || !prompt || !initImage
            ? 'bg-black/[0.05] dark:bg-white/10 text-slate-400 dark:text-gray-500 cursor-not-allowed' 
            : 'bg-white text-black hover:bg-gray-200 hover:scale-[1.02] neon-glow'
          }`}
        >
          {isGenerating ? t('gen.generating') : `${t('gen.createButton')} ⚡ ${cost} ${t('gen.creditsUnit')}`}
        </button>
      </div>

      {/* Right Panel: Output */}
      <div className="flex-1 min-h-[400px] lg:min-h-0 glass-card rounded-2xl flex flex-col relative overflow-hidden">
        {/* Topbar inside output */}
        <div className="absolute top-0 w-full h-14 bg-gradient-to-b from-black/80 to-transparent z-10 flex items-center px-6 justify-end">
           {resultImage && !isGenerating && (
             <div className="flex gap-2">
               <button 
                 onClick={async () => {
                   try {
                     if ('showSaveFilePicker' in window) {
                       let blob;
                       if (resultImage.startsWith('data:')) {
                         const res = await fetch(resultImage);
                         blob = await res.blob();
                       } else if (resultDriveFileId && resultDriveFileId !== 'saved') {
                         const res = await api.get(`/integrations/google-drive/file/${resultDriveFileId}`, { responseType: 'blob' });
                         blob = res.data;
                       } else {
                         const res = await fetch(resultImage);
                         blob = await res.blob();
                       }
                       const handle = await (window as any).showSaveFilePicker({
                         suggestedName: `generation-${Date.now()}.png`,
                         types: [{ description: 'PNG Image', accept: {'image/png': ['.png']} }],
                       });
                       const writable = await handle.createWritable();
                       await writable.write(blob);
                       await writable.close();
                       return;
                     }
                   } catch (err: any) {
                     if (err.name !== 'AbortError') console.log('Save failed', err);
                     return;
                   }
                   // Fallback for browsers without showSaveFilePicker
                   const a = document.createElement('a');
                   a.href = resultImage;
                   a.download = `generation-${Date.now()}.png`;
                   document.body.appendChild(a);
                   a.click();
                   document.body.removeChild(a);
                 }}
                 className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/5 transition-colors"
                 title="Download Image"
               >
                 <Download size={18} className="text-white" />
               </button>
               <button 
                 onClick={() => setIsFullscreen(true)}
                 className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/5 transition-colors"
                 title="Open Fullscreen"
               >
                 <Maximize2 size={18} className="text-white" />
               </button>
             </div>
           )}
        </div>

        {/* Content Area */}
        <div className="flex-1 min-h-0 min-w-0 flex items-center justify-center p-3 sm:p-4 lg:p-6 preview-area-compact bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/[0.02] to-transparent">
          {isGenerating ? (
            <div className="flex flex-col items-center gap-4 sm:gap-6 w-full max-w-sm">
              <div className={`relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center`}>
                <div className={`absolute inset-0 border-4 border-black/10 dark:border-white/10 rounded-full animate-spin ${isLuxury ? 'border-t-[#D4AF37]' : 'border-t-indigo-500'}`} />
                <span className={`text-lg font-bold ${isLuxury ? 'text-[#D4AF37]' : 'text-indigo-400'}`}>{progress}%</span>
              </div>
              <motion.p 
                key={loadingText}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`font-medium tracking-wide ${isLuxury ? 'text-[#D4AF37]' : 'text-indigo-400'}`}
              >
                {loadingText}
              </motion.p>
              
              <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-2.5 mt-2 overflow-hidden">
                <div 
                  className={`h-2.5 rounded-full transition-all duration-300 ease-out ${isLuxury ? 'bg-[#D4AF37]' : 'bg-indigo-500'}`} 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              
              <button 
                onClick={handleStopRequest}
                className="mt-4 px-6 py-2 rounded-full font-bold bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/50 transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:shadow-[0_0_25px_rgba(239,68,68,0.6)]"
              >
                {t('generate.cancelGeneration')}
              </button>
            </div>
          ) : resultImage ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="max-w-full max-h-full flex justify-center items-center"
            >
              <AuthImage 
                driveFileId={resultDriveFileId || undefined}
                fallbackUrl={resultImage} 
                alt="Generated" 
                className="max-w-full max-h-full object-contain rounded-xl shadow-2xl" 
              />
            </motion.div>
          ) : (
            <div className="text-gray-600 text-lg">
              {t('gen.waitingPrompt')}
            </div>
          )}
        </div>
        
        {/* History Gallery */}
        <div className="h-32 sm:h-36 lg:h-40 xl:h-44 shrink-0 gallery-container-compact border-t border-black/10 dark:border-white/10 bg-white/5 p-3 sm:p-4 overflow-x-auto overflow-y-hidden whitespace-nowrap">
          <h3 className="text-[10px] sm:text-xs font-bold gallery-title-compact text-slate-500 dark:text-gray-400 mb-2 uppercase tracking-wider">{t('gen.galleryTitle')}</h3>
          <div className="flex w-max gap-2 sm:gap-4 h-[60px] sm:h-[70px] lg:h-[80px] xl:h-[90px] gallery-items-compact">
            {history.length === 0 ? (
              <div className="text-slate-400 dark:text-gray-500 text-sm flex items-center h-full">{t('gen.galleryEmpty')}</div>
            ) : (
              history.map((item) => (
                <div key={item.id} className="relative aspect-square h-full shrink-0 rounded-lg overflow-hidden group cursor-pointer" onClick={() => setResult(item.imageUrl, item.driveFileId)}>
                  <AuthImage driveFileId={item.driveFileId} fallbackUrl={item.imageUrl} alt={item.prompt} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  <div className="absolute inset-0 bg-transparent/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                    <span className="text-slate-900 dark:text-slate-900 dark:text-white text-[10px] font-bold truncate">{item.template || item.model}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      {mounted && createPortal(
        <AnimatePresence>
          {isFullscreen && resultImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 p-4 sm:p-8 backdrop-blur-sm"
              onClick={() => setIsFullscreen(false)}
              onTouchStart={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
              onTouchEnd={(e) => e.stopPropagation()}
            >
              <button 
                className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/5 text-white rounded-full transition-colors z-[99999]"
                onClick={() => setIsFullscreen(false)}
              >
                <X size={24} />
              </button>
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="relative flex items-center justify-center w-full h-full max-w-[100vw] max-h-[100vh] pointer-events-none"
              >
                <div className="pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                  <AuthImage 
                    driveFileId={resultDriveFileId || undefined}
                    fallbackUrl={resultImage} 
                    alt="Generated Fullscreen" 
                    className="max-w-[90vw] max-h-[90vh] object-contain rounded-xl shadow-2xl border border-white/10" 
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Cancel Modal */}
      <AnimatePresence>
        {showCancelModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={cancelStop}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`relative w-full max-w-md p-6 rounded-2xl border shadow-2xl ${isLuxury ? 'bg-[#111] border-[#D4AF37]/30' : 'bg-[#0a0a0a] border-white/10'}`}
            >
              <h3 className={`text-xl font-bold mb-4 ${isLuxury ? 'text-[#D4AF37]' : 'text-white'}`}>
                {t('generate.warning')}
              </h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                {t('generate.cancelConfirmText')}
              </p>
              <div className="flex gap-3 justify-end">
                <button 
                  onClick={cancelStop}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${isLuxury ? 'bg-white/5 hover:bg-white/10 text-white/90' : 'bg-white/5 hover:bg-white/10 text-white'}`}
                >
                  {t('generate.continue')}
                </button>
                <button 
                  onClick={confirmStop}
                  className="px-4 py-2 rounded-lg font-medium bg-red-500/90 hover:bg-red-500 text-white transition-colors shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:shadow-[0_0_20px_rgba(239,68,68,0.5)]"
                >
                  {t('generate.yesCancel')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
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
