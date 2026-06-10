"use client";
import React from 'react';
import { motion } from 'framer-motion';

export default function TemplatesPage() {
  const categories = ['Anime', 'Realistic', 'Cyberpunk', 'Fantasy', 'Product Photography', 'Logo'];
  const mockTemplates = Array(8).fill(null).map((_, i) => ({
    id: i,
    name: `Pro Template ${i + 1}`,
    category: categories[i % categories.length],
    cover: `https://images.unsplash.com/photo-${1600000000000 + i * 1000}?auto=format&fit=crop&q=80&w=400`
  }));

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
