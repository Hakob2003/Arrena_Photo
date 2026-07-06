"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useLenis } from 'lenis/react';

export function InfiniteLoop({ children }: { children: React.ReactNode }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  // Measure the height of a single clone
  useEffect(() => {
    const measure = () => {
      if (contentRef.current) {
        setContentHeight(contentRef.current.offsetHeight);
      }
    };
    
    // Initial measurement
    measure();
    
    // Fallback measurement after images load
    setTimeout(measure, 500);
    setTimeout(measure, 2000);

    window.addEventListener('resize', measure);
    
    const ro = new ResizeObserver(measure);
    if (contentRef.current) {
      ro.observe(contentRef.current);
    }
    
    return () => {
      window.removeEventListener('resize', measure);
      ro.disconnect();
    };
  }, []);

  // Initialize scroll position to the middle clone
  useEffect(() => {
    if (contentHeight > 0) {
      if (window.scrollY < 10) {
        window.scrollTo(0, contentHeight);
      }
    }
  }, [contentHeight]);

  useLenis((lenis) => {
    if (contentHeight === 0) return;

    const scroll = lenis.scroll;
    
    // If user scrolls down past the middle clone into the bottom clone
    if (scroll >= contentHeight * 2) {
      lenis.scrollTo(scroll - contentHeight, { immediate: true });
    } 
    // If user scrolls up past the middle clone into the top clone
    else if (scroll <= 0 && lenis.velocity < 0) {
      lenis.scrollTo(scroll + contentHeight, { immediate: true });
    }
  });

  return (
    <div className="w-full relative">
      <div ref={contentRef} className="w-full relative" aria-hidden="true">
        {children}
      </div>
      <div className="w-full relative">
        {children}
      </div>
      <div className="w-full relative" aria-hidden="true">
        {children}
      </div>
    </div>
  );
}
