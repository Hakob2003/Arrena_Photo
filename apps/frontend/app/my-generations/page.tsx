"use client";
import React, { useState } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export default function MyGenerationsPage() {
  const mockGens = [
    { id: 1, date: 'Today', image: 'https://picsum.photos/seed/mygen_neon/400/400', model: 'sdxl-1.0', prompt: 'Neon cyberpunk city street at night...' },
    { id: 2, date: 'Today', image: 'https://picsum.photos/seed/mygen_coffee/400/400', model: 'midjourney-v6', prompt: 'Cozy coffee cup on a wooden table...' },
    { id: 3, date: 'Yesterday', image: 'https://picsum.photos/seed/mygen_space/400/400', model: 'dall-e-3', prompt: 'Astronaut looking at earth from moon...' },
    { id: 4, date: 'Yesterday', image: 'https://picsum.photos/seed/mygen_anime/400/400', model: 'sdxl-1.0', prompt: 'Anime girl in a rainy school yard...' },
    { id: 5, date: '2 days ago', image: 'https://picsum.photos/seed/mygen_car/400/400', model: 'sdxl-1.0', prompt: 'Vintage red sports car driving on a coastal road...' },
    { id: 6, date: '2 days ago', image: 'https://picsum.photos/seed/mygen_dragon/400/400', model: 'dall-e-3', prompt: 'Fierce red dragon breathing fire over a mountain...' },
    { id: 7, date: '3 days ago', image: 'https://picsum.photos/seed/mygen_portrait/400/400', model: 'midjourney-v6', prompt: 'Hyper realistic portrait of a man with blue eyes...' },
    { id: 8, date: '3 days ago', image: 'https://picsum.photos/seed/mygen_dog/400/400', model: 'sdxl-1.0', prompt: 'Cute golden retriever playing in autumn leaves...' },
    { id: 9, date: '1 week ago', image: 'https://picsum.photos/seed/mygen_logo/400/400', model: 'dall-e-3', prompt: 'Modern minimalist logo for a bakery...' },
    { id: 10, date: '1 week ago', image: 'https://picsum.photos/seed/mygen_shoes/400/400', model: 'midjourney-v6', prompt: 'Product shot of futuristic running shoes...' },
    { id: 11, date: '2 weeks ago', image: 'https://picsum.photos/seed/mygen_forest/400/400', model: 'sdxl-1.0', prompt: 'Magical forest with glowing mushrooms and fairies...' },
    { id: 12, date: '2 weeks ago', image: 'https://picsum.photos/seed/mygen_robot/400/400', model: 'dall-e-3', prompt: 'Steampunk robot reading a book in a library...' },
  ];

  const [savingId, setSavingId] = useState<number | null>(null);

  const saveToDrive = async (e: React.MouseEvent, id: number, imageUrl: string) => {
    e.stopPropagation();
    try {
      setSavingId(id);
      await api.post('/integrations/google-drive/save', { imageUrl });
      toast.success('Сохранено на Google Drive!');
    } catch (error: any) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('not connected')) {
        toast.error('Google Drive не подключен. Привяжите его в настройках Cloud Storage.');
      } else {
        toast.error('Ошибка при сохранении на Google Drive');
      }
    } finally {
      setSavingId(null);
    }
  };

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
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-between">
              <div className="flex justify-end">
                <button 
                  onClick={(e) => saveToDrive(e, gen.id, gen.image)}
                  disabled={savingId === gen.id}
                  className="bg-black/50 hover:bg-black/80 text-white p-2 rounded-lg backdrop-blur-md transition-colors"
                  title="Сохранить на Google Drive"
                >
                  {savingId === gen.id ? (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                  )}
                </button>
              </div>
              <div>
                <span className="text-xs text-indigo-400 font-bold mb-1 block">{gen.model}</span>
                <p className="text-xs text-white line-clamp-2">{gen.prompt}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
