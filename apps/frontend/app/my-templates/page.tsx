"use client";
import React from 'react';
import Link from 'next/link';

export default function MyTemplatesPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-bold mb-2">My Templates</h1>
          <p className="text-gray-400">Manage your created workflows and prompts.</p>
        </div>
        <button className="bg-white text-black px-6 py-2.5 rounded-full font-bold hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.2)]">
          + Create New
        </button>
      </div>

      <div className="flex-1 border border-white/10 rounded-2xl bg-black/40 backdrop-blur-md p-10 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-4xl mb-6">📁</div>
        <h2 className="text-2xl font-bold mb-2">No Templates Yet</h2>
        <p className="text-gray-400 max-w-md mb-8">
          You haven't created any templates. Package your best prompts and model settings into a template to share or sell on the marketplace.
        </p>
        <Link href="/generate">
          <button className="px-6 py-3 glass rounded-xl font-bold text-indigo-400 hover:text-indigo-300 hover:bg-white/10 transition-colors">
            Go to Generator
          </button>
        </Link>
      </div>
    </div>
  );
}
