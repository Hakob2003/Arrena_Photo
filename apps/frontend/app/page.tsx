"use client";
import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-full flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
      
      {/* Hero Content */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="z-10 max-w-4xl"
      >
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6">
          ВООБРАЖЕНИЕ <br />
          <span className="neon-text">ВНЕ РЕАЛЬНОСТИ</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-400 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
          Ультимативная AI-студия. Объединяйте модели, используйте профессиональные промпты и создавайте идеальные изображения.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link href="/generate">
            <button className="px-8 py-4 bg-white text-black font-bold rounded-full text-lg hover:bg-gray-200 hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)]">
              Начать генерацию
            </button>
          </Link>
          <Link href="/marketplace">
            <button className="px-8 py-4 glass text-white font-bold rounded-full text-lg hover:bg-white/10 transition-all border border-white/20">
              Перейти в Маркетплейс
            </button>
          </Link>
        </div>
      </motion.div>

      {/* Floating Mockup Images */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30 z-0">
        <motion.div 
          animate={{ y: [0, -20, 0], rotate: [0, 2, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[10%] left-[10%] w-64 h-64 rounded-3xl overflow-hidden glass p-2"
        >
          <img src="https://picsum.photos/seed/home1/400/400" className="w-full h-full object-cover rounded-2xl" />
        </motion.div>
        
        <motion.div 
          animate={{ y: [0, 30, 0], rotate: [0, -3, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[20%] right-[10%] w-80 h-96 rounded-3xl overflow-hidden glass p-2"
        >
          <img src="https://picsum.photos/seed/home2/400/400" className="w-full h-full object-cover rounded-2xl" />
        </motion.div>
      </div>

    </div>
  );
}
