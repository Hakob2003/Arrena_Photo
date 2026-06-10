"use client";
import React from 'react';

export default function MyGenerationsPage() {
  const mockGens = Array(12).fill(null).map((_, i) => ({
    id: i,
    date: new Date(Date.now() - i * 86400000).toLocaleDateString(),
    image: `https://images.unsplash.com/photo-${1550000000000 + i * 5000}?auto=format&fit=crop&q=80&w=400`,
    model: 'sdxl-1.0',
    prompt: 'A futuristic cityscape...'
  }));

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold">My Generations</h1>
        <button className="px-5 py-2 glass rounded-lg hover:bg-white/10 text-sm font-bold">Filter</button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {mockGens.map(gen => (
          <div key={gen.id} className="group relative aspect-square rounded-xl overflow-hidden glass-card cursor-pointer">
            <img src={gen.image} alt={gen.prompt} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
              <span className="text-xs text-indigo-400 font-bold mb-1">{gen.model}</span>
              <p className="text-xs text-white line-clamp-2">{gen.prompt}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
