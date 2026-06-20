import React from 'react';
import Link from 'next/link';

interface TemplateProps {
  id: string;
  name: string;
  coverUrl?: string;
  price?: number;
  avgRating: number;
  author: { id: string; name: string };
}

export const TemplateCard: React.FC<{ template: TemplateProps }> = ({ template }) => {
  return (
    <Link href={`/marketplace/${template.id}`} className="group block rounded-2xl border border-border dark:border-border bg-primary dark:bg-card overflow-hidden hover:shadow-xl transition-all duration-300">
      <div className="relative aspect-square w-full overflow-hidden bg-muted dark:bg-muted">
        {template.coverUrl ? (
          <img 
            src={template.coverUrl} 
            alt={template.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-muted-foreground">
            No Image
          </div>
        )}
        <div className="absolute top-3 right-3 bg-background/60 backdrop-blur-md text-foreground text-xs font-bold px-3 py-1 rounded-full">
          {template.price == null || template.price === 0 ? 'FREE' : `$${template.price.toFixed(2)}`}
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-lg text-foreground dark:text-foreground truncate">{template.name}</h3>
        <div className="flex items-center justify-between mt-2">
          <p className="text-sm text-muted-foreground dark:text-muted-foreground">by {template.author.name}</p>
          <div className="flex items-center text-yellow-500 text-sm">
            <span>⭐</span>
            <span className="ml-1 font-medium">{template.avgRating.toFixed(1)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};
