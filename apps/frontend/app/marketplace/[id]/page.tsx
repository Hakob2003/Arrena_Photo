import React from 'react';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function TemplateDetailsPage({ params }: PageProps) {
  const resolvedParams = await params;
  // Mock data
  const template = {
    id: resolvedParams.id,
    name: resolvedParams.id === '2' ? 'Minimalist Product Studio' : 'Cyberpunk Neon Portraits',
    description: 'A highly detailed prompt for generating cyberpunk style portraits with neon lighting. Best used with DALL-E 3 or SDXL.',
    coverUrl: resolvedParams.id === '2' ? '/mock/studio_coffee.png' : '/mock/neon_cyberpunk.png',
    price: 4.99,
    avgRating: 4.8,
    reviewsCount: 124,
    downloads: 3000,
    author: { name: 'NeonDreams', followers: 890 }
  };

  return (
    <div className="min-h-screen bg-background dark:bg-background text-foreground dark:text-foreground py-6 sm:py-12 px-4 sm:px-8">
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
        {/* Left: Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-square w-full rounded-3xl overflow-hidden shadow-2xl">
            <img src={template.coverUrl} alt="Cover" className="w-full h-full object-cover" />
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {/* Additional gallery images would go here */}
            {[1,2,3].map(i => (
              <div key={i} className="w-24 h-24 flex-shrink-0 bg-secondary dark:bg-muted rounded-xl overflow-hidden cursor-pointer hover:ring-2 ring-blue-500 transition-all">
                <img src={template.coverUrl} className="w-full h-full object-cover opacity-60 hover:opacity-100" />
              </div>
            ))}
          </div>
        </div>

        {/* Right: Info & Actions */}
        <div className="flex flex-col justify-center space-y-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 break-words">{template.name}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center text-yellow-500">
                ⭐ <span className="ml-1 font-bold">{template.avgRating}</span>
                <span className="text-muted-foreground ml-1">({template.reviewsCount} reviews)</span>
              </span>
              <span>•</span>
              <span>{template.downloads.toLocaleString('en-US')} downloads</span>
            </div>
          </div>

          <div className="bg-primary dark:bg-card p-6 rounded-2xl border border-border dark:border-border shadow-sm flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Created by</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full"></div>
                <div>
                  <p className="font-bold">{template.author.name}</p>
                  <p className="text-xs text-muted-foreground">{template.author.followers} followers</p>
                </div>
              </div>
            </div>
            <button className="px-4 py-2 bg-muted dark:bg-muted hover:bg-secondary dark:hover:bg-gray-700 rounded-lg font-medium transition-colors">
              Follow
            </button>
          </div>

          <p className="text-lg leading-relaxed text-muted-foreground dark:text-muted-foreground">
            {template.description}
          </p>

          <div className="pt-6 border-t border-border dark:border-border flex gap-2 sm:gap-4 sticky bottom-4 z-10 bg-background/80 sm:bg-transparent backdrop-blur-md sm:backdrop-blur-none p-4 sm:p-0 rounded-2xl sm:rounded-none">
            <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-foreground py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-1">
              Buy Prompt • ${template.price}
            </button>
            <button className="px-4 sm:px-6 border border-border dark:border-border rounded-xl hover:bg-muted dark:hover:bg-muted transition-colors">
              ❤️
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
