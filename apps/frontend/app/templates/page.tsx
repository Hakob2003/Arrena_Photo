"use client";
import React from 'react';
import { motion } from 'framer-motion';

export default function TemplatesPage() {
  const categories = ['Anime', 'Realistic', 'Cyberpunk', 'Fantasy', 'Product Photography', 'Logo'];
  const mockTemplates = [
    { id: 1, name: 'Neon City Cyberpunk', category: 'Cyberpunk', cover: 'https://picsum.photos/seed/cyberpunk/400/500' },
    { id: 2, name: 'Studio Coffee Cup', category: 'Product Photography', cover: 'https://picsum.photos/seed/coffee/400/500' },
    { id: 3, name: 'Epic Fantasy Landscape', category: 'Fantasy', cover: 'https://picsum.photos/seed/fantasy/400/500' },
    { id: 4, name: 'Anime School Girl', category: 'Anime', cover: 'https://picsum.photos/seed/anime1/400/500' },
    { id: 5, name: 'Modern Tech Logo', category: 'Logo', cover: 'https://picsum.photos/seed/logo1/400/500' },
    { id: 6, name: 'Realistic Portrait', category: 'Realistic', cover: 'https://picsum.photos/seed/portrait1/400/500' },
    { id: 7, name: 'Sci-Fi Spaceship', category: 'Cyberpunk', cover: 'https://picsum.photos/seed/spaceship/400/500' },
    { id: 8, name: 'Minimalist Watch', category: 'Product Photography', cover: 'https://picsum.photos/seed/watch/400/500' },
    { id: 9, name: 'Dragon in the Clouds', category: 'Fantasy', cover: 'https://picsum.photos/seed/dragon/400/500' },
    { id: 10, name: 'Vintage Camera', category: 'Realistic', cover: 'https://picsum.photos/seed/camera/400/500' },
    { id: 11, name: 'Mecha Robot', category: 'Anime', cover: 'https://picsum.photos/seed/mecha/400/500' },
    { id: 12, name: 'Bakery Logo', category: 'Logo', cover: 'https://picsum.photos/seed/bakery/400/500' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-4xl font-bold mb-4">Prompt Templates</h1>
        <p className="text-gray-400 text-lg">Start your creation with perfectly engineered prompts.</p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 mb-8 custom-scrollbar">
        {['All', ...categories].map(c => (
          <button key={c} className="px-5 py-2 glass rounded-full whitespace-nowrap hover:bg-white/10 transition-colors">
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {mockTemplates.map((t, i) => (
          <motion.div 
            key={t.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="group glass-card rounded-2xl overflow-hidden cursor-pointer"
          >
            <div className="aspect-[4/5] relative overflow-hidden bg-white/5">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
              <img src={t.cover} alt={t.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute bottom-4 left-4 right-4 z-20">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">{t.category}</span>
                <h3 className="text-lg font-bold text-white mt-1">{t.name}</h3>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
