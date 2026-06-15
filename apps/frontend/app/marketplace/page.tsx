import React from 'react';
import { TemplateCard } from '../../components/marketplace/TemplateCard';

export default function MarketplacePage() {
  // Mock data for display, in reality fetch from /api/templates
  const mockTemplates = [
    {
      id: '1',
      name: 'Cyberpunk Neon Portraits',
      coverUrl: 'https://image.pollinations.ai/prompt/cyberpunk%20neon%20portrait?width=400&height=400&nologo=true',
      price: 4.99,
      avgRating: 4.8,
      author: { id: 'a1', name: 'NeonDreams' }
    },
    {
      id: '2',
      name: 'Minimalist Product Studio',
      coverUrl: 'https://image.pollinations.ai/prompt/minimalist%20product%20studio?width=400&height=400&nologo=true',
      price: 0,
      avgRating: 5.0,
      author: { id: 'a2', name: 'StudioPro' }
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 text-center space-y-4">
          <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI Template Marketplace
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Discover thousands of production-ready AI prompts, workflows, and models curated by top creators.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          {['All', 'Free', 'Premium', 'Anime', 'Realistic', 'Cyberpunk'].map(tag => (
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
