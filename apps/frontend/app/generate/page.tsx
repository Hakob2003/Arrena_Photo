"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGenerationStore, useAuthStore } from '../../store';

export default function GeneratorPage() {
  const { prompt, setPrompt, model, setModel, isGenerating, setGenerating, resultImage, setResult } = useGenerationStore();
  const { deductCredits } = useAuthStore();
  const [loadingText, setLoadingText] = useState('Initializing AI...');

  const handleGenerate = () => {
    if (!prompt) return;
    setGenerating(true);
    deductCredits(5);
    
    // Fake progress simulation
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      if (progress === 30) setLoadingText('Loading model weights...');
      if (progress === 60) setLoadingText('Sampling latents (steps 15/30)...');
      if (progress === 90) setLoadingText('Decoding VAE image...');
      
      if (progress >= 100) {
        clearInterval(interval);
        setGenerating(false);
        setResult('https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80');
      }
    }, 400);
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6 p-6">
      
      {/* Left Panel: Controls */}
      <div className="w-full lg:w-[400px] flex flex-col gap-6">
        <div className="glass-card p-5 rounded-2xl">
          <h2 className="text-lg font-bold mb-4">Prompt</h2>
          <textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A futuristic cyberpunk city at night with neon lights reflecting in puddles..."
            className="w-full h-40 bg-black/50 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <h2 className="text-lg font-bold mb-4">Model & Settings</h2>
          <select 
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white mb-4 outline-none"
          >
            <option value="sdxl-1.0">Stable Diffusion XL 1.0</option>
            <option value="dall-e-3">OpenAI DALL-E 3</option>
            <option value="midjourney-v6">Midjourney v6 (Via API)</option>
            <option value="comfyui">Custom ComfyUI Workflow</option>
          </select>

          {/* Fake settings sliders */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Aspect Ratio</span>
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
          {isGenerating ? 'Generating...' : 'Generate ⚡ 5 Credits'}
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
              Waiting for your prompt...
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
