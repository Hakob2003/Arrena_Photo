"use client";
import React from 'react';
import { TemplateCard } from '../../components/marketplace/TemplateCard';
import { useTranslation } from '../../lib/i18n';
import { useCardSize } from '../../hooks/useCardSize';
import { ViewSizeSelector } from '../../components/ui/ViewSizeSelector';
import { useUIStore } from '../../store';

export default function MarketplacePage() {
  const { t } = useTranslation();
  const { size: cardSize, setSize: setCardSize, mounted } = useCardSize('medium');
  const isLuxury = useUIStore(state => state.preferences?.skin === 'LUXURY');

  // Mock data for display, in reality fetch from /api/templates
  const mockTemplates = [
    {
      id: '1',
      name: 'Cyberpunk Neon Portraits',
      coverUrl: '/mock/neon_cyberpunk.png',
      price: 4.99,
      oldPrice: 2.99,
      avgRating: 4.8,
      author: { id: 'a1', name: 'NeonDreams' }
    },
    {
      id: '2',
      name: 'Minimalist Product Studio',
      coverUrl: '/mock/studio_coffee.png',
      price: 0,
      oldPrice: 5.0,
      avgRating: 5.0,
      author: { id: 'a2', name: 'StudioPro' }
    }
  ];

  return (
    <div className="min-h-screen bg-transparent text-gray-900 dark:text-gray-100 p-4 sm:p-8">
      <div className="w-full">
        <div className="mb-12 text-center space-y-4">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight break-words bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent luxury-override-text-gradient">
            {t('market.title')}
          </h1>
          <p className="text-base sm:text-lg text-slate-400 dark:text-gray-500 dark:text-gray-400 max-w-2xl mx-auto px-2">
            {t('market.description')}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap gap-4 flex-1">
            {[t('market.all'), t('market.free'), t('market.premium'), 'Anime', 'Realistic', 'Cyberpunk'].map(tag => (
            <button key={tag} className={`px-5 py-2 rounded-full border border-gray-200 dark:border-gray-800 transition-colors ${
              isLuxury ? 'hover:bg-[#D4AF37]/10 dark:hover:bg-[#D4AF37]/20 hover:border-[#D4AF37]' : 'hover:bg-blue-50 dark:hover:bg-blue-900/20'
            }`}>
              {tag}
            </button>
          ))}
          </div>

          {mounted && (
            <div className="flex-shrink-0 ml-auto sm:ml-0">
              <ViewSizeSelector size={cardSize} onChange={setCardSize} />
            </div>
          )}
        </div>

        {/* Grid */}
        <div className={`grid gap-6 ${
          cardSize === 'small' ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6' :
          cardSize === 'large' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3' :
          'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
        }`}>
          {mockTemplates.map(template => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      </div>
    </div>
  );
}
