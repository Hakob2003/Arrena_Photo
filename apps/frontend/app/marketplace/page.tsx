import React from 'react';
import { TemplateCard } from '../../components/marketplace/TemplateCard';

export default function MarketplacePage() {
  // Mock data for display, in reality fetch from /api/templates
  const mockTemplates = [
    {
      id: '1',
      name: 'Cyberpunk Neon Portraits',
      coverUrl: '/mock/neon_cyberpunk.png',
      price: 4.99,
      avgRating: 4.8,
      author: { id: 'a1', name: 'NeonDreams' }
    },
    {
      id: '2',
      name: 'Minimalist Product Studio',
      coverUrl: '/mock/studio_coffee.png',
      price: 0,
      avgRating: 5.0,
      author: { id: 'a2', name: 'StudioPro' }
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 text-center space-y-4">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent break-words">
            Маркетплейс AI Шаблонов
          </h1>
          <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto px-2">
            Открывайте тысячи готовых AI-промптов, созданных лучшими авторами.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          {['Все', 'Бесплатные', 'Премиум', 'Anime', 'Realistic', 'Cyberpunk'].map(tag => (
            <button key={tag} className="px-5 py-2 rounded-full border border-gray-200 dark:border-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
              {tag}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {mockTemplates.map(template => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      </div>
    </div>
  );
}
