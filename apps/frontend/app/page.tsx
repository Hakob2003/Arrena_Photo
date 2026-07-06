"use client";
import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useTranslation } from "../lib/i18n";
import { useUIStore } from "../store";
import { cn } from "../lib/utils";
import { ArrowRight, Sparkles, Zap, Layers, Lock, Shield } from "lucide-react";

// Add Marquee Component
const Marquee = () => {
  return (
    <div className="relative w-full overflow-hidden border-y border-white/10 bg-white/5 py-6 flex items-center backdrop-blur-md">
      <motion.div
        className="flex whitespace-nowrap gap-12 items-center"
        animate={{ x: [0, -1035] }}
        transition={{ ease: "linear", duration: 15, repeat: Infinity }}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <span key={i} className="text-xl md:text-3xl font-black tracking-[0.2em] text-white/70 uppercase flex items-center gap-8">
            <Sparkles className="w-6 h-6 text-white/40" />
            AI TEMPLATE STUDIO
            <Sparkles className="w-6 h-6 text-white/40" />
            PREMIUM EDITION
          </span>
        ))}
      </motion.div>
    </div>
  );
};

export default function HomePage() {
  const { t, locale } = useTranslation();
  const { preferences } = useUIStore();
  const isPremium = preferences.skin === 'PREMIUM';
  const containerRef = useRef(null);

  // Parallax for Hero
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.85]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.5], ["0%", "15%"]);

  return (
    <div ref={containerRef} className="w-full flex flex-col relative bg-background overflow-hidden">
      
      {/* Dynamic Background */}
      {isPremium && (
        <div className="fixed inset-0 z-[0] pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-[100vh] bg-[#060606]" />
          <motion.div 
            className="absolute top-[20%] left-[50%] -translate-x-1/2 w-[80vw] max-w-[1000px] h-[50vh] bg-white/5 blur-[120px] rounded-full pointer-events-none"
          />
        </div>
      )}

      {/* Hero Section (Sticky Parallax) */}
      <div className="h-[120vh] relative z-10 w-full">
        <motion.div 
          style={{ scale: heroScale, opacity: heroOpacity, y: heroY }}
          className="sticky top-0 h-[100dvh] w-full flex flex-col items-center justify-center p-6 text-center"
        >
          <div className="max-w-[1400px] w-full flex flex-col items-center">
            {isPremium && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="px-6 py-2.5 mb-10 rounded-full border border-white/20 bg-white/5 backdrop-blur-xl flex items-center gap-3 shadow-[0_0_30px_rgba(255,255,255,0.05)]"
              >
                <Sparkles className="w-4 h-4 text-white" />
                <span className="text-sm font-bold text-white tracking-[0.15em] uppercase">Shopify Editions Style</span>
              </motion.div>
            )}

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                "font-black tracking-tighter mb-8 leading-[0.85]",
                locale === "hy" 
                  ? "text-5xl sm:text-7xl md:text-8xl lg:text-[100px]" 
                  : "text-6xl sm:text-8xl md:text-[130px] lg:text-[180px]",
                isPremium ? "text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/40" : "text-foreground"
              )}
            >
              {t("home.heroTitle1").toUpperCase()}
              {locale !== "hy" ? <br /> : " "}
              <span className={isPremium ? "text-transparent bg-clip-text bg-gradient-to-r from-gray-400 to-gray-700" : "neon-text"}>
                {t("home.heroTitle2").toUpperCase()}
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 1 }}
              className={cn(
                "text-lg sm:text-2xl md:text-4xl mb-14 max-w-4xl mx-auto font-light leading-relaxed px-4 tracking-tight",
                isPremium ? "text-gray-400" : "text-slate-500 dark:text-gray-400"
              )}
            >
              {t("home.heroDescription")}
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 1 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 px-4 w-full sm:w-auto"
            >
              <Link href="/generate" className="w-full sm:w-auto">
                <button className={cn(
                  "w-full sm:w-auto px-12 py-6 font-bold rounded-full text-base sm:text-xl transition-all group relative overflow-hidden",
                  isPremium 
                    ? "bg-white text-black hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.15)]" 
                    : "bg-white text-black hover:bg-gray-200 hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.3)]"
                )}>
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    {t("home.startGenerating")}
                    {isPremium && <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />}
                  </span>
                  {isPremium && <div className="absolute inset-0 bg-gradient-to-r from-white via-gray-200 to-white opacity-0 group-hover:opacity-100 transition-opacity" />}
                </button>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Marquee Section */}
      <div className="relative z-20 w-full bg-background pt-10">
        {isPremium && <Marquee />}
      </div>

      {/* Bento Grid Features Section */}
      <section className="relative w-full z-20 bg-background px-6 py-32 rounded-t-[60px] mt-[-60px] border-t border-white/10 shadow-[0_-30px_60px_rgba(0,0,0,0.8)]">
        <div className="max-w-[1400px] mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-24"
          >
            <h2 className={cn("text-5xl sm:text-7xl md:text-8xl font-black mb-8 tracking-tighter", isPremium ? "text-white" : "text-foreground")}>
              Designed for Performance.
            </h2>
            <p className={cn("text-2xl sm:text-3xl font-light", isPremium ? "text-gray-400" : "text-slate-500 dark:text-gray-400")}>
              Everything you need to create stunning visuals at lightspeed.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[450px]">
            {/* Feature 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                "md:col-span-2 rounded-[40px] p-10 md:p-14 flex flex-col justify-end relative overflow-hidden group",
                isPremium ? "glass-card bg-[#0A0A0A]/80 hover:bg-[#111111] border border-white/10 backdrop-blur-3xl shadow-[inset_0_0_80px_rgba(255,255,255,0.02)]" : "bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10"
              )}
            >
              <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 blur-[100px] rounded-full translate-x-1/3 -translate-y-1/3 group-hover:bg-white/10 transition-colors duration-700" />
              <div className="absolute top-12 right-12">
                <Zap className={cn("w-14 h-14", isPremium ? "text-white/80" : "text-indigo-500")} />
              </div>
              <div className="relative z-10">
                <h3 className={cn("text-4xl sm:text-5xl font-bold mb-4 tracking-tight", isPremium ? "text-white" : "text-foreground")}>Ultra-Fast Generation</h3>
                <p className={cn("text-xl sm:text-2xl max-w-lg leading-relaxed font-light", isPremium ? "text-gray-400" : "text-slate-500 dark:text-gray-400")}>
                  Powered by next-gen GPUs to deliver your assets in sub-second times without compromising on quality.
                </p>
              </div>
            </motion.div>

            {/* Feature 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                "rounded-[40px] p-10 md:p-14 flex flex-col justify-end relative overflow-hidden group",
                isPremium ? "glass-card bg-[#0A0A0A]/80 hover:bg-[#111111] border border-white/10 backdrop-blur-3xl shadow-[inset_0_0_80px_rgba(255,255,255,0.02)]" : "bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10"
              )}
            >
              <div className="absolute top-12 right-12">
                <Layers className={cn("w-14 h-14", isPremium ? "text-white/80" : "text-indigo-500")} />
              </div>
              <div className="relative z-10">
                <h3 className={cn("text-3xl sm:text-4xl font-bold mb-4 tracking-tight", isPremium ? "text-white" : "text-foreground")}>Infinite Styles</h3>
                <p className={cn("text-lg sm:text-xl leading-relaxed font-light", isPremium ? "text-gray-400" : "text-slate-500 dark:text-gray-400")}>
                  Access thousands of premium community templates.
                </p>
              </div>
            </motion.div>

            {/* Feature 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                "rounded-[40px] p-10 md:p-14 flex flex-col justify-end relative overflow-hidden group",
                isPremium ? "glass-card bg-[#0A0A0A]/80 hover:bg-[#111111] border border-white/10 backdrop-blur-3xl shadow-[inset_0_0_80px_rgba(255,255,255,0.02)]" : "bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10"
              )}
            >
              <div className="absolute top-12 right-12">
                <Shield className={cn("w-14 h-14", isPremium ? "text-white/80" : "text-indigo-500")} />
              </div>
              <div className="relative z-10">
                <h3 className={cn("text-3xl sm:text-4xl font-bold mb-4 tracking-tight", isPremium ? "text-white" : "text-foreground")}>Enterprise Grade</h3>
                <p className={cn("text-lg sm:text-xl leading-relaxed font-light", isPremium ? "text-gray-400" : "text-slate-500 dark:text-gray-400")}>
                  Secure infrastructure with 99.99% uptime.
                </p>
              </div>
            </motion.div>

            {/* Feature 4 */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                "md:col-span-2 rounded-[40px] p-10 md:p-14 flex flex-col justify-end relative overflow-hidden group",
                isPremium ? "glass-card bg-[#0A0A0A]/80 hover:bg-[#111111] border border-white/10 backdrop-blur-3xl shadow-[inset_0_0_80px_rgba(255,255,255,0.02)]" : "bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10"
              )}
            >
              <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-white/5 blur-[120px] rounded-full -translate-x-1/3 -translate-y-1/3 group-hover:bg-white/10 transition-colors duration-700" />
              <div className="absolute top-12 right-12">
                <Lock className={cn("w-14 h-14", isPremium ? "text-white/80" : "text-indigo-500")} />
              </div>
              <div className="relative z-10">
                <h3 className={cn("text-4xl sm:text-5xl font-bold mb-4 tracking-tight", isPremium ? "text-white" : "text-foreground")}>Private & Secure</h3>
                <p className={cn("text-xl sm:text-2xl max-w-xl leading-relaxed font-light", isPremium ? "text-gray-400" : "text-slate-500 dark:text-gray-400")}>
                  Your generations and prompts are fully private. We never use your data to train our models.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final Massive CTA */}
      <section className="relative w-full py-40 flex flex-col items-center justify-center text-center z-20 bg-background border-t border-white/5">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-[1200px] w-full px-6 flex flex-col items-center relative"
        >
          {isPremium && (
            <div className="absolute inset-0 bg-white/5 blur-[150px] rounded-full z-[-1] pointer-events-none" />
          )}
          <h2 className={cn("text-6xl sm:text-8xl md:text-[120px] font-black tracking-tighter mb-12 leading-[0.9]", isPremium ? "text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60" : "text-foreground")}>
            BUILD THE FUTURE.
          </h2>
          <Link href="/generate">
            <button className={cn(
              "px-16 py-8 font-bold rounded-full text-xl sm:text-2xl transition-all shadow-2xl group overflow-hidden relative",
              isPremium 
                ? "bg-white text-black hover:scale-105 shadow-[0_0_80px_rgba(255,255,255,0.2)]" 
                : "bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105 shadow-indigo-500/25"
            )}>
              <span className="relative z-10 flex items-center justify-center gap-3">
                {t("home.startGenerating").toUpperCase()}
                <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
              </span>
              {isPremium && <div className="absolute inset-0 bg-gradient-to-r from-white via-gray-200 to-white opacity-0 group-hover:opacity-100 transition-opacity" />}
            </button>
          </Link>
        </motion.div>
      </section>

    </div>
  );
}
