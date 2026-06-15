"use client";
import React from 'react';
import { motion } from 'framer-motion';

export default function TemplatesPage() {
  const [selectedCategory, setSelectedCategory] = React.useState('Все');
  
  const categories = ['Anime', 'Realistic', 'Cyberpunk', 'Fantasy', 'Product Photography', 'Logo'];
  const mockTemplates = [
    { id: 1, name: 'Neon City Cyberpunk', category: 'Cyberpunk', cover: '/mock/neon_cyberpunk.png' },
    { id: 2, name: 'Studio Coffee Cup', category: 'Product Photography', cover: '/mock/studio_coffee.png' },
    { id: 3, name: 'Epic Fantasy Landscape', category: 'Fantasy', cover: '/mock/fantasy_landscape.png' },
    { id: 4, name: 'Anime School Girl', category: 'Anime', cover: '/mock/anime_schoolgirl.png' },
    { id: 5, name: 'Modern Tech Logo', category: 'Logo', cover: '/mock/tech_logo.png' },
    { id: 6, name: 'Realistic Portrait', category: 'Realistic', cover: '/mock/realistic_portrait.png' },
    { id: 7, name: 'Sci-Fi Spaceship', category: 'Cyberpunk', cover: '/mock/scifi_spaceship.png' },
    { id: 8, name: 'Minimalist Watch', category: 'Product Photography', cover: '/mock/minimalist_watch.png' },
    { id: 9, name: 'Dragon in the Clouds', category: 'Fantasy', cover: '/mock/dragon_clouds.png' },
    { id: 10, name: 'Vintage Camera', category: 'Realistic', cover: '/mock/vintage_camera.png' },
    { id: 11, name: 'Mecha Robot', category: 'Anime', cover: '/mock/mecha_robot.png' },
    { id: 12, name: 'Bakery Logo', category: 'Logo', cover: '/mock/bakery_logo.png' },
  ];

  const filteredTemplates = selectedCategory === 'Все' 
    ? mockTemplates 
    : mockTemplates.filter(t => t.category === selectedCategory);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-4xl font-bold mb-4">Шаблоны промптов</h1>
        <p className="text-gray-400 text-lg">Начните создание с идеально составленных промптов.</p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 mb-8 custom-scrollbar">
        {['Все', ...categories].map(c => (
          <button 
            key={c} 
            onClick={() => setSelectedCategory(c)}
            className={`px-5 py-2 rounded-full whitespace-nowrap transition-colors ${
              selectedCategory === c 
                ? 'bg-indigo-600 text-white' 
                : 'glass hover:bg-white/10'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredTemplates.map((t, i) => (
          <motion.div 
            key={t.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => window.location.href = `/generate?template=${encodeURIComponent(t.name)}`}
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
