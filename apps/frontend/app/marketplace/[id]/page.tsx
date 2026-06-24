"use client";
import React, { use } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

type PageProps = {
  params: Promise<{ id: string }>;
};

import { useUIStore } from '../../../store';

export default function TemplateDetailsPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const isLuxury = useUIStore(state => state.preferences?.skin === 'LUXURY');
  // Mock data
  const template = {
    id: resolvedParams.id,
    name: resolvedParams.id === '2' ? 'Minimalist Product Studio' : 'Cyberpunk Neon Portraits',
    description: 'A highly detailed prompt for generating cyberpunk style portraits with neon lighting. Best used with DALL-E 3 or SDXL.',
    coverUrl: resolvedParams.id === '2' ? '/mock/studio_coffee.png' : '/mock/neon_cyberpunk.png',
    price: resolvedParams.id === '2' ? 0 : 4.99,
    oldPrice: resolvedParams.id === '2' ? 5.0 : 2.99,
    avgRating: 4.8,
    reviewsCount: 124,
    downloads: 3000,
    author: { name: 'NeonDreams', followers: 890 }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 py-6 sm:py-12 px-4 sm:px-8">
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
        {/* Left: Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-square w-full rounded-3xl overflow-hidden shadow-2xl">
            <img src={template.coverUrl} alt="Cover" className="w-full h-full object-cover" />
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {/* Additional gallery images would go here */}
            {[1,2,3].map(i => (
              <div key={i} className={`w-24 h-24 flex-shrink-0 bg-gray-200 dark:bg-gray-800 rounded-xl overflow-hidden cursor-pointer hover:ring-2 transition-all ${isLuxury ? 'ring-[#D4AF37]' : 'ring-blue-500'}`}>
                <img src={template.coverUrl} className="w-full h-full object-cover opacity-60 hover:opacity-100" />
              </div>
            ))}
          </div>
        </div>

        {/* Right: Info & Actions */}
        <div className="flex flex-col justify-center space-y-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 break-words">{template.name}</h1>
            <div className="flex items-center gap-4 text-sm text-slate-400 dark:text-gray-500">
              <span className="flex items-center text-yellow-500">
                ⭐ <span className="ml-1 font-bold">{template.avgRating}</span>
                <span className="text-slate-500 dark:text-gray-400 ml-1">({template.reviewsCount} reviews)</span>
              </span>
              <span>•</span>
              <span>{template.downloads.toLocaleString('en-US')} downloads</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-400 dark:text-gray-500 mb-1">Created by</p>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${isLuxury ? 'bg-gradient-to-tr from-[#C5A028] to-[#D4AF37]' : 'bg-gradient-to-tr from-blue-500 to-purple-500'}`}></div>
                <div>
                  <p className="font-bold">{template.author.name}</p>
                  <p className="text-xs text-slate-500 dark:text-gray-400">{template.author.followers} followers</p>
                </div>
              </div>
            </div>
            <button className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors">
              Follow
            </button>
          </div>

          <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-300">
            {template.description}
          </p>

          <div className="pt-6 border-t border-gray-200 dark:border-gray-800 flex gap-2 sm:gap-4 sticky bottom-4 z-10 bg-[#fafafa] dark:bg-black/80 sm:bg-transparent backdrop-blur-md sm:backdrop-blur-none p-4 sm:p-0 rounded-2xl sm:rounded-none">
            <button className={`flex-1 flex justify-center items-center py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg shadow-lg transition-all transform hover:-translate-y-1 ${
              isLuxury ? 'bg-[#D4AF37] hover:bg-[#C5A028] text-black shadow-[#D4AF37]/30' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/30'
            }`}>
              Buy Prompt • {template.price === 0 ? 'FREE' : `$${template.price}`}
              {template.oldPrice !== null && template.oldPrice !== undefined && template.price > template.oldPrice && (
                <span title={`Previously $${template.oldPrice}`}>
                  <ArrowUp className="w-5 h-5 text-red-500 ml-2" />
                </span>
              )}
              {template.oldPrice !== null && template.oldPrice !== undefined && template.price < template.oldPrice && (
                <span title={`Previously $${template.oldPrice}`}>
                  <ArrowDown className="w-5 h-5 text-green-400 ml-2" />
                </span>
              )}
            </button>
            <button className="px-4 sm:px-6 border border-gray-200 dark:border-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-white dark:bg-gray-800 transition-colors">
              ❤️
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
