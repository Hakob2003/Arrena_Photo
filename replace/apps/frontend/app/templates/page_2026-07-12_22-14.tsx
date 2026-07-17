"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { templatesApi } from '../../lib/templates.api';
import { useTranslation } from '../../lib/i18n';
import { useCardSize } from '../../hooks/useCardSize';
import { ViewSizeSelector } from '../../components/ui/ViewSizeSelector';
import { useUIStore } from '../../store';

export default function TemplatesPage() {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState('__all__');
  const [categories, setCategories] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const { size: cardSize, setSize: setCardSize, mounted } = useCardSize('medium');
  const isLuxury = useUIStore(state => state.preferences?.skin === 'LUXURY');

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

    const savedPageSize = localStorage.getItem('templatesPageSize');
    if (savedPageSize) {
      setPageSize(Number(savedPageSize));
    }
    
    fetchData();
  }, []);

  const filteredTemplates = selectedCategory === '__all__'
    ? templates
    : templates.filter(t => t.categoryId === selectedCategory);

  const totalPages = Math.ceil(filteredTemplates.length / pageSize);
  const currentTemplates = filteredTemplates.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  if (loading) {
    return (
      <div className="p-8 w-full animate-fade-in">
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-4">{t('templates.title')}</h1>
          <div className="h-6 w-64 bg-black/[0.03] dark:bg-white/5 animate-pulse rounded mb-2" />
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 mb-8">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-10 w-24 bg-black/[0.03] dark:bg-white/5 animate-pulse rounded-full flex-shrink-0" />
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="aspect-[4/5] rounded-2xl bg-black/[0.03] dark:bg-white/5 animate-pulse border border-black/10 dark:border-white/10" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 w-full">
      <div className="mb-10">
        <h1 className="text-4xl font-bold mb-4">{t('templates.title')}</h1>
        <p className="text-slate-500 dark:text-gray-400 text-lg">{t('templates.description')}</p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex gap-4 overflow-x-auto pb-2 sm:pb-0 custom-scrollbar flex-1">
          <button 
            onClick={() => {
              setSelectedCategory('__all__');
              setCurrentPage(1);
            }}
          className={`px-5 py-2 rounded-full whitespace-nowrap transition-colors ${
            selectedCategory === '__all__' 
              ? (isLuxury ? 'bg-[#D4AF37] shadow-none text-black' : 'bg-indigo-600 shadow-[0_8px_24px_rgba(99,102,241,0.25)] dark:shadow-none text-white')
              : 'glass hover:bg-black/[0.05] dark:bg-white/10'
          }`}
        >
          {t('templates.all')}
        </button>
        {categories.filter(c => templates.some(t => t.categoryId === c.id)).map(c => (
          <button 
            key={c.id} 
            onClick={() => {
              setSelectedCategory(c.id);
              setCurrentPage(1);
            }}
            className={`px-5 py-2 rounded-full whitespace-nowrap transition-colors ${
              selectedCategory === c.id 
                ? (isLuxury ? 'bg-[#D4AF37] shadow-none text-black' : 'bg-indigo-600 shadow-[0_8px_24px_rgba(99,102,241,0.25)] dark:shadow-none text-white')
                : 'glass hover:bg-black/[0.05] dark:bg-white/10'
            }`}
          >
            {c.name}
          </button>
        ))}
        </div>
        
        {mounted && (
          <div className="flex-shrink-0 ml-auto sm:ml-0 flex items-center gap-4">
            <select
              value={pageSize}
              onChange={(e) => {
                const newSize = Number(e.target.value);
                setPageSize(newSize);
                localStorage.setItem('templatesPageSize', newSize.toString());
                setCurrentPage(1);
              }}
              className="glass px-3 py-1.5 rounded-xl text-sm bg-transparent border border-black/10 dark:border-white/10 outline-none cursor-pointer"
            >
              <option value={5} className="dark:bg-[#0A0A0A]">5 {t('templates.perPage')}</option>
              <option value={10} className="dark:bg-[#0A0A0A]">10 {t('templates.perPage')}</option>
              <option value={20} className="dark:bg-[#0A0A0A]">20 {t('templates.perPage')}</option>
            </select>
            <ViewSizeSelector size={cardSize} onChange={setCardSize} />
          </div>
        )}
      </div>

      {filteredTemplates.length === 0 ? (
        <div className="text-center py-20 text-slate-400 dark:text-gray-500 glass-card rounded-2xl p-8">
          {t('templates.emptyCategory')}
        </div>
      ) : (
        <div className={`grid gap-6 ${
          cardSize === 'small' ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6' :
          cardSize === 'large' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3' :
          'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
        }`}>
          {currentTemplates.map((tpl, i) => {
            const fallbackCover = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80";
            return (
              <motion.div 
                key={tpl.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => window.location.href = `/generate?templateId=${tpl.id}`}
                className="group glass-card rounded-2xl overflow-hidden cursor-pointer relative"
              >
                {tpl.price !== undefined && tpl.price !== null && (
                  <div className={`absolute top-4 right-4 z-20 backdrop-blur-none px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg ${
                    isLuxury ? 'bg-[#D4AF37]/90 text-black shadow-none' : 'bg-indigo-600 shadow-[0_8px_24px_rgba(99,102,241,0.25)] dark:shadow-none/90 text-white'
                  }`}>
                    <span>⚡ {tpl.price}</span>
                    {tpl.oldPrice !== undefined && tpl.oldPrice !== null && tpl.price > tpl.oldPrice && (
                      <span title={`Previously ${tpl.oldPrice}`}>
                        <ArrowUp className="w-3 h-3 text-red-300" />
                      </span>
                    )}
                    {tpl.oldPrice !== undefined && tpl.oldPrice !== null && tpl.price < tpl.oldPrice && (
                      <span title={`Previously ${tpl.oldPrice}`}>
                        <ArrowDown className="w-3 h-3 text-green-300" />
                      </span>
                    )}
                  </div>
                )}
                
                <div className="aspect-[4/5] relative overflow-hidden bg-black/[0.03] dark:bg-white/5">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                  <img 
                    src={tpl.coverUrl || fallbackCover} 
                    alt={tpl.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  />
                  <div className="absolute bottom-4 left-4 right-4 z-20">
                    <span className={`text-xs font-bold uppercase tracking-wider ${isLuxury ? 'text-[#D4AF37]' : 'text-indigo-400'}`}>{tpl.category?.name || 'Uncategorized'}</span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-900 dark:text-white mt-1">{tpl.name}</h3>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {!loading && totalPages > 1 && (() => {
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        if (endPage - startPage + 1 < maxVisiblePages) {
          startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        const visiblePages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

        return (
          <div className="flex justify-center mt-12 gap-2 flex-wrap">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="px-4 py-2 rounded-xl glass disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black/[0.05] dark:hover:bg-white/10 transition-colors"
            >
              {t('common.prev')}
            </button>
            
            <div className="flex gap-2 flex-wrap justify-center">
              {visiblePages.map(pageNum => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-10 h-10 rounded-xl transition-colors flex items-center justify-center ${
                  currentPage === pageNum
                    ? (isLuxury ? 'bg-[#D4AF37] text-black font-bold' : 'bg-indigo-600 text-white font-bold shadow-md')
                    : 'glass hover:bg-black/[0.05] dark:hover:bg-white/10'
                }`}
              >
                {pageNum}
              </button>
            ))}
          </div>

            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="px-4 py-2 rounded-xl glass disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black/[0.05] dark:hover:bg-white/10 transition-colors"
            >
              {t('common.next')}
            </button>
          </div>
        );
      })()}
    </div>
  );
}
