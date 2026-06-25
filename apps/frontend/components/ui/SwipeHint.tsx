"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../store';

const HandIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <path d="M12.75 3a2.25 2.25 0 00-4.5 0v8.632l-1.01-1.01a2.25 2.25 0 00-3.182 3.182l5.06 5.06A4.5 4.5 0 0012.3 20.25h2.45a4.5 4.5 0 004.5-4.5v-6.5a2.25 2.25 0 00-4.5 0V3z" />
  </svg>
);

const SLIDES = [
  {
    id: 1,
    title: "Свайп вправо",
    description: "Открывает главное меню приложения",
    animation: {
      x: [-50, 50, -50], // Moves left to right
      y: [0, 0, 0]
    },
    fingers: 1
  },
  {
    id: 2,
    title: "Свайп влево",
    description: "Закрывает меню и возвращает к контенту",
    animation: {
      x: [50, -50, 50], // Moves right to left
      y: [0, 0, 0]
    },
    fingers: 1
  },
  {
    id: 3,
    title: "Свайп вниз",
    description: "Обновление страницы сверху",
    animation: {
      x: [0, 0, 0],
      y: [-40, 40, -40] // Moves top to bottom
    },
    fingers: 1
  },
  {
    id: 4,
    title: "Свайп двумя пальцами",
    description: "Быстрое переключение между страницами (вверх/вниз)",
    animation: {
      x: [0, 0, 0],
      y: [40, -40, 40] // Moves bottom to top (or up/down)
    },
    fingers: 2
  }
];

export function SwipeHint() {
  const { isMobile, showSwipeHints, setShowSwipeHints, setHasSeenSwipeHints, preferences } = useUIStore();
  const isLuxury = preferences?.skin === 'LUXURY';
  const [currentSlide, setCurrentSlide] = useState(0);

  // If not mobile or not showing hints, render nothing
  if (!isMobile || !showSwipeHints) return null;

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(s => s + 1);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    setShowSwipeHints(false);
    setHasSeenSwipeHints(true);
    setCurrentSlide(0);
  };

  const slide = SLIDES[currentSlide];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      >
        <div className="relative w-full max-w-sm px-6 flex flex-col items-center">
          
          {/* Skip Button */}
          <button 
            onClick={handleClose}
            className="absolute -top-16 right-6 text-slate-300 hover:text-white text-sm"
          >
            Пропустить
          </button>

          {/* Animation Container */}
          <div className="w-48 h-48 mb-8 relative flex items-center justify-center rounded-full bg-white/5 border border-white/10 shadow-[0_0_40px_rgba(255,255,255,0.1)]">
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute"
              >
                <motion.div
                  animate={{
                    x: slide.animation.x,
                    y: slide.animation.y
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="flex items-center justify-center gap-1"
                >
                  <HandIcon className="w-16 h-16 text-white/70 drop-shadow-lg" />
                  {slide.fingers === 2 && (
                    <HandIcon className="w-16 h-16 text-white/70 drop-shadow-lg -ml-8" />
                  )}
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Text Content */}
          <div className="text-center mb-8 h-20">
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <h3 className="text-xl font-semibold text-white mb-2">{slide.title}</h3>
                <p className="text-slate-400 text-sm">{slide.description}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="flex flex-col w-full gap-4">
            <button
              onClick={handleNext}
              className={`w-full py-3.5 rounded-xl font-medium transition-colors ${isLuxury ? 'bg-[#D4AF37] hover:bg-[#C5A028] text-black shadow-none' : 'bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)]'}`}
            >
              {currentSlide < SLIDES.length - 1 ? 'Далее' : 'Понятно!'}
            </button>
            
            {/* Dots */}
            <div className="flex justify-center gap-2 mt-2">
              {SLIDES.map((_, i) => (
                <div 
                  key={i} 
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    currentSlide === i 
                      ? (isLuxury ? 'bg-[#D4AF37] w-6' : 'bg-indigo-500 w-6') 
                      : 'bg-white/20'
                  }`}
                />
              ))}
            </div>
          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
}
