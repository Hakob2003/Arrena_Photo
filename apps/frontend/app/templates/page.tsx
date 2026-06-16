"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { templatesApi } from '../../lib/templates.api';

export default function TemplatesPage() {
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [categories, setCategories] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [catsRes, tplsRes] = await Promise.all([
          templatesApi.getCategories(),
          templatesApi.getTemplates({ take: 100, status: 'PUBLISHED' })
        ]);
        setCategories(catsRes);
        setTemplates(tplsRes.items || []);
      } catch (error) {
        console.error("Failed to load templates data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredTemplates = selectedCategory === 'Все'
    ? templates
    : templates.filter(t => t.categoryId === selectedCategory);

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto animate-fade-in">
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-4">Шаблоны промптов</h1>
          <div className="h-6 w-64 bg-white/5 animate-pulse rounded mb-2" />
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 mb-8">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-10 w-24 bg-white/5 animate-pulse rounded-full flex-shrink-0" />
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="aspect-[4/5] rounded-2xl bg-white/5 animate-pulse border border-white/10" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-4xl font-bold mb-4">Шаблоны промптов</h1>
        <p className="text-gray-400 text-lg">Начните создание с идеально составленных промптов.</p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 mb-8 custom-scrollbar">
        <button 
          onClick={() => setSelectedCategory('Все')}
          className={`px-5 py-2 rounded-full whitespace-nowrap transition-colors ${
            selectedCategory === 'Все' 
              ? 'bg-indigo-600 text-white' 
              : 'glass hover:bg-white/10'
          }`}
        >
          Все
        </button>
        {categories.map(c => (
          <button 
            key={c.id} 
            onClick={() => setSelectedCategory(c.id)}
            className={`px-5 py-2 rounded-full whitespace-nowrap transition-colors ${
              selectedCategory === c.id 
                ? 'bg-indigo-600 text-white' 
                : 'glass hover:bg-white/10'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {filteredTemplates.length === 0 ? (
        <div className="text-center py-20 text-gray-500 glass-card rounded-2xl p-8">
          Шаблоны в этой категории пока отсутствуют.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredTemplates.map((t, i) => {
            const fallbackCover = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80";
            return (
              <motion.div 
                key={t.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => window.location.href = `/generate?template=${encodeURIComponent(t.name)}`}
                className="group glass-card rounded-2xl overflow-hidden cursor-pointer relative"
              >
                {t.price !== undefined && t.price !== null && (
                  <div className="absolute top-4 right-4 z-20 bg-indigo-600/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-white flex items-center gap-1 shadow-lg">
                    <span>⚡ {t.price}</span>
                  </div>
                )}
                
                <div className="aspect-[4/5] relative overflow-hidden bg-white/5">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                  <img 
                    src={t.coverUrl || fallbackCover} 
                    alt={t.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  />
                  <div className="absolute bottom-4 left-4 right-4 z-20">
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">{t.category?.name || 'Uncategorized'}</span>
                    <h3 className="text-lg font-bold text-white mt-1">{t.name}</h3>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
