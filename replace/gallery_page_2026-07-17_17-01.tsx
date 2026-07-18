"use client";
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslation } from "../../lib/i18n";

export default function GalleryPage() {
  const { t } = useTranslation();

  const mockGalleryItems = [
    {
      id: 1,
      height: 300,
      author: "@cyber_ninja",
      prompt:
        '"A stunning hyper-realistic portrait of a cyberpunk character in rain..."',
      seed: "cyberpunk_char",
    },
    {
      id: 2,
      height: 400,
      author: "@fantasy_art",
      prompt:
        '"Epic dragon breathing fire over a medieval castle, fantasy concept art..."',
      seed: "dragon_castle",
    },
    {
      id: 3,
      height: 250,
      author: "@minimal_studio",
      prompt:
        '"Minimalist setup of a coffee cup on a wooden desk, soft studio lighting..."',
      seed: "minimal_coffee",
    },
    {
      id: 4,
      height: 450,
      author: "@anime_fan",
      prompt:
        '"Anime girl looking at the stars, highly detailed, makoto shinkai style..."',
      seed: "anime_stars",
    },
    {
      id: 5,
      height: 350,
      author: "@nature_lover",
      prompt:
        '"A misty forest early in the morning, cinematic lighting, 8k resolution..."',
      seed: "misty_forest",
    },
    {
      id: 6,
      height: 300,
      author: "@space_explorer",
      prompt:
        '"Astronaut exploring an alien planet with glowing plants, sci-fi landscape..."',
      seed: "alien_planet",
    },
    {
      id: 7,
      height: 500,
      author: "@portrait_pro",
      prompt:
        '"Close up portrait of a young woman with neon face paint, highly detailed..."',
      seed: "neon_portrait",
    },
    {
      id: 8,
      height: 250,
      author: "@logo_master",
      prompt:
        '"Modern minimalist logo for a tech startup, vector art, flat design..."',
      seed: "tech_logo",
    },
  ];

  return (
    <div className="p-4 sm:p-8 max-w-screen-2xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6 sm:mb-10">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            {t("gallery.title")}
          </h1>
          <p className="text-slate-500 dark:text-gray-400 text-sm sm:text-base">
            {t("gallery.description")}
          </p>
        </div>
        <div className="flex bg-black/[0.03] dark:bg-white/5 rounded-lg p-1 w-full sm:w-auto overflow-x-auto">
          <button className="px-4 py-1.5 rounded-md bg-black/[0.05] dark:bg-white/10 text-slate-900 dark:text-slate-900 dark:text-white font-medium shadow-sm">
            {t("gallery.popular")}
          </button>
          <button className="px-4 py-1.5 rounded-md text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:text-slate-900 dark:text-white">
            {t("gallery.new")}
          </button>
          <button className="px-4 py-1.5 rounded-md text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:text-slate-900 dark:text-white">
            {t("gallery.best")}
          </button>
        </div>
      </div>

      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
        {mockGalleryItems.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="relative group rounded-2xl overflow-hidden break-inside-avoid bg-black/[0.03] dark:bg-white/5"
            style={{ height: item.height }}
          >
            <Image
              src={`https://picsum.photos/seed/${item.seed}/600/${item.height}`}
              alt={`Gallery image by ${item.author}`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              unoptimized
            />
            <div className="absolute inset-0 bg-transparent/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-orange-400" />
                <span className="text-slate-900 dark:text-slate-900 dark:text-white font-medium text-sm">
                  {item.author}
                </span>
              </div>
              <p className="text-slate-900 dark:text-white/80 text-sm line-clamp-2">
                {item.prompt}
              </p>
              <div className="flex gap-2 mt-4">
                <button className="flex-1 glass text-slate-900 dark:text-slate-900 dark:text-white text-xs font-bold py-2 rounded-lg hover:bg-white/5">
                  {t("gallery.remix")}
                </button>
                <button className="w-10 glass flex items-center justify-center rounded-lg hover:bg-white/5">
                  ❤️
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
