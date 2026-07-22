"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "../../lib/utils";

interface BentoCardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: React.ReactNode;
  colSpan?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 0;
  rowSpan?: 1 | 2 | 3 | 4 | 0;
  gradient?: string; // Optional gradient class for the background glow
  delay?: number; // Animation delay
  noPadding?: boolean;
}

export function BentoCard({
  children,
  className,
  colSpan,
  rowSpan,
  gradient,
  delay = 0,
  noPadding = false,
  ...props
}: BentoCardProps) {
  // Map standard spans to actual tailwind classes because dynamic template literals in Tailwind don't always purge correctly
  const colSpanClass = {
    1: "md:col-span-1",
    2: "md:col-span-2",
    3: "md:col-span-3",
    4: "md:col-span-4",
    5: "md:col-span-5",
    6: "md:col-span-6",
    7: "md:col-span-7",
    8: "md:col-span-8",
    9: "md:col-span-9",
    10: "md:col-span-10",
    11: "md:col-span-11",
    12: "md:col-span-12",
    0: "",
  }[colSpan || 0];

  const rowSpanClass = {
    1: "row-span-1",
    2: "row-span-2",
    3: "row-span-3",
    4: "row-span-4",
    0: "",
  }[rowSpan || 0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.23, 1, 0.32, 1] }}
      className={cn(
        "group relative overflow-hidden rounded-[24px] border border-white/5 bg-[#0A0A0A]/80 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.4)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_8px_40px_rgb(0,0,0,0.6)] hover:border-white/10 flex flex-col",
        colSpan ? "col-span-12" : "",
        colSpanClass,
        rowSpanClass,
        !noPadding && "p-6",
        className,
      )}
      {...props}
    >
      {/* Background Subtle Gradient Glow */}
      {gradient && (
        <div
          className={cn(
            "absolute inset-0 opacity-20 transition-opacity duration-500 group-hover:opacity-30",
            gradient,
          )}
          style={{ filter: "blur(60px)", transform: "translateZ(0)" }}
        />
      )}

      {/* Glossy top highlight overlay */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      {/* Content wrapper relative to be above the absolute backgrounds */}
      <div className="relative z-10 h-full w-full flex flex-col">
        {children}
      </div>
    </motion.div>
  );
}
