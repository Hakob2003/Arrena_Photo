import React from 'react';
import Link from 'next/link';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface TemplateProps {
  id: string;
  name: string;
  coverUrl?: string;
  price?: number;
  oldPrice?: number;
  avgRating: number;
  author: { id: string; name: string };
}

export const TemplateCard: React.FC<{ template: TemplateProps }> = ({ template }) => {
  return (
    <Link href={`/marketplace/${template.id}`} className="group block rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden hover:shadow-xl transition-all duration-300">
      <div className="relative aspect-square w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
        {template.coverUrl ? (
          <img 
            src={template.coverUrl} 
            alt={template.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-slate-500 dark:text-gray-400">
            No Image
          </div>
        )}
        <div className="absolute top-3 right-3 flex items-center bg-[#fafafa] dark:bg-black/60 backdrop-blur-md text-slate-900 dark:text-slate-900 dark:text-white text-xs font-bold px-3 py-1 rounded-full">
          {template.price == null || template.price === 0 ? 'FREE' : `$${template.price.toFixed(2)}`}
          {template.oldPrice !== null && template.oldPrice !== undefined && (template.price || 0) > template.oldPrice && (
            <ArrowUp className="w-3 h-3 text-red-500 ml-1 shrink-0" title={`Previously $${template.oldPrice.toFixed(2)}`} />
          )}
          {template.oldPrice !== null && template.oldPrice !== undefined && (template.price || 0) < template.oldPrice && (
            <ArrowDown className="w-3 h-3 text-green-500 ml-1 shrink-0" title={`Previously $${template.oldPrice.toFixed(2)}`} />
          )}
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-900 dark:text-slate-900 dark:text-white truncate">{template.name}</h3>
        <div className="flex items-center justify-between mt-2">
          <p className="text-sm text-slate-400 dark:text-gray-500 dark:text-gray-400">by {template.author.name}</p>
          <div className="flex items-center text-yellow-500 text-sm">
            <span>⭐</span>
            <span className="ml-1 font-medium">{template.avgRating.toFixed(1)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};
