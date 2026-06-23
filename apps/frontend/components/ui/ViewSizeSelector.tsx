"use client";

import React from 'react';
import { LayoutGrid, Grid3x3, Square } from 'lucide-react';
import { CardSize } from '../../hooks/useCardSize';

interface ViewSizeSelectorProps {
  size: CardSize;
  onChange: (size: CardSize) => void;
  className?: string;
}

export function ViewSizeSelector({ size, onChange, className = '' }: ViewSizeSelectorProps) {
  return (
    <div className={`flex items-center gap-1 bg-black/[0.03] dark:bg-white/5 p-1 rounded-full ${className}`}>
      <button
        onClick={() => onChange('large')}
        title="Large Cards"
        className={`p-1.5 rounded-full transition-all ${
          size === 'large' 
            ? 'bg-white dark:bg-[#1a1a1c] shadow-sm text-indigo-600 dark:text-indigo-400' 
            : 'text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-gray-200'
        }`}
      >
        <Square className="w-4 h-4" />
      </button>
      <button
        onClick={() => onChange('medium')}
        title="Medium Cards"
        className={`p-1.5 rounded-full transition-all ${
          size === 'medium' 
            ? 'bg-white dark:bg-[#1a1a1c] shadow-sm text-indigo-600 dark:text-indigo-400' 
            : 'text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-gray-200'
        }`}
      >
        <LayoutGrid className="w-4 h-4" />
      </button>
      <button
        onClick={() => onChange('small')}
        title="Small Cards"
        className={`p-1.5 rounded-full transition-all ${
          size === 'small' 
            ? 'bg-white dark:bg-[#1a1a1c] shadow-sm text-indigo-600 dark:text-indigo-400' 
            : 'text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-gray-200'
        }`}
      >
        <Grid3x3 className="w-4 h-4" />
      </button>
    </div>
  );
}
