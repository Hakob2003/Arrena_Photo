"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, RefreshCw } from 'lucide-react';
import { generationsApi } from '@/lib/generations.api';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store';
import { AuthImage } from '@/components/ui/AuthImage';
import { useUIStore } from '@/store';

export default function FeedPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [generations, setGenerations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const isLuxury = useUIStore(state => state.preferences?.skin === 'LUXURY');

  useEffect(() => {
    fetchFeed();
  }, [user]); // refetch when auth state changes to get correct 'isLiked' state

  const fetchFeed = async () => {
    try {
      setLoading(true);
      const data = await generationsApi.getFeed();
      setGenerations(data);
    } catch (e) {
      console.error('Failed to fetch feed', e);
      toast.error('Failed to load feed');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!user) {
      toast.error('Please login to like');
      return router.push('/login');
    }

    // Optimistic update
    setGenerations(prev => prev.map(g => {
      if (g.id === id) {
        return {
          ...g,
          isLiked: !g.isLiked,
          likesCount: g.isLiked ? Math.max(0, g.likesCount - 1) : g.likesCount + 1
        };
      }
      return g;
    }));

    try {
      const res = await generationsApi.toggleLike(id);
      // Sync with server response just in case
      setGenerations(prev => prev.map(g => {
        if (g.id === id) {
          return { ...g, isLiked: res.liked };
        }
        return g;
      }));
    } catch (e) {
      toast.error('Failed to like');
      fetchFeed(); // revert on error
    }
  };

  const handleRemix = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!user) {
      toast.error('Please login to remix');
      return router.push('/login');
    }
    router.push(`/generate?remixId=${id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 p-4 sm:p-8">
      <div className="w-full">
        <div className="mb-12 text-center space-y-4">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent luxury-override-text-gradient">
            Community Feed
          </h1>
          <p className="text-base sm:text-lg text-slate-400 dark:text-gray-500 max-w-2xl mx-auto px-2">
            Discover amazing generations from the community. Found something you like? Remix it with your own face!
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
             <div className={`w-12 h-12 border-4 border-black/10 dark:border-white/10 rounded-full animate-spin ${isLuxury ? 'border-t-[#D4AF37]' : 'border-t-indigo-500'}`} />
          </div>
        ) : generations.length === 0 ? (
          <div className="text-center py-20 text-slate-400 glass-card rounded-2xl p-8">
            No public generations yet. Be the first to publish one!
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
            {generations.map((gen) => (
              <div key={gen.id} className="break-inside-avoid relative group rounded-2xl overflow-hidden glass-card">
                <AuthImage 
                  fallbackUrl={gen.imageUrl} 
                  driveFileId={gen.driveFileId} 
                  alt="Generation" 
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Overlay that appears on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  
                  {/* Prompt Text */}
                  {gen.prompt && (
                    <p className="text-white text-sm line-clamp-3 mb-4 font-medium drop-shadow-md">
                      {gen.prompt}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    {/* User info */}
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 overflow-hidden ${isLuxury ? 'bg-[#D4AF37]' : 'bg-indigo-500'}`}>
                        {gen.user?.image ? (
                           <img src={gen.user.image} alt="User" className="w-full h-full object-cover" />
                        ) : (
                           gen.user?.name?.charAt(0).toUpperCase() || 'U'
                        )}
                      </div>
                      <span className="text-white text-sm font-semibold truncate w-24">{gen.user?.name || 'Anonymous'}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={(e) => handleLike(e, gen.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md transition-colors ${gen.isLiked ? 'bg-red-500/20 text-red-400' : 'bg-white/20 text-white hover:bg-white/30'}`}
                      >
                        <Heart className={`w-4 h-4 ${gen.isLiked ? 'fill-current' : ''}`} />
                        <span className="text-xs font-bold">{gen.likesCount || 0}</span>
                      </button>
                      
                      <button 
                        onClick={(e) => handleRemix(e, gen.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors ${isLuxury ? 'bg-[#D4AF37] hover:bg-[#C5A028] text-black' : 'bg-indigo-600 hover:bg-indigo-500 text-white'}`}
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span className="text-xs font-bold">Remix</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
