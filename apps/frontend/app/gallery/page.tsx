"use client";
import React from 'react';
import { motion } from 'framer-motion';

export default function GalleryPage() {
  // Creating a random masonry layout feel by assigning random heights
  const heights = [300, 400, 250, 450, 350, 300, 500, 250];

  return (
    <div className="p-8 max-w-screen-2xl mx-auto">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-4xl font-bold mb-2">Community Gallery</h1>
          <p className="text-gray-400">Discover what others are creating right now.</p>
        </div>
        <div className="flex bg-white/5 rounded-lg p-1">
          <button className="px-4 py-1.5 rounded-md bg-white/10 text-white font-medium shadow-sm">Trending</button>
          <button className="px-4 py-1.5 rounded-md text-gray-400 hover:text-white">Recent</button>
          <button className="px-4 py-1.5 rounded-md text-gray-400 hover:text-white">Top Rated</button>
        </div>
      </div>

      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
        {heights.map((h, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="relative group rounded-2xl overflow-hidden break-inside-avoid bg-white/5"
            style={{ height: h }}
          >
            <img 
              src={`https://images.unsplash.com/photo-${1600000000000 + i * 2000}?auto=format&fit=crop&q=80&w=600`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-orange-400" />
                <span className="text-white font-medium text-sm">@creator_{i}</span>
              </div>
              <p className="text-white/80 text-sm line-clamp-2">
                "A stunning hyper-realistic portrait of a cyberpunk character..."
              </p>
              <div className="flex gap-2 mt-4">
                <button className="flex-1 glass text-white text-xs font-bold py-2 rounded-lg hover:bg-white/20">Remix</button>
                <button className="w-10 glass flex items-center justify-center rounded-lg hover:bg-white/20">❤️</button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
