"use client";

import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ThemeProvider } from 'next-themes';
import { LayoutGroup } from 'framer-motion';

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark">
        <LayoutGroup>
          {children}
        </LayoutGroup>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
