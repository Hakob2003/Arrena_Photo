import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { ClientLayout } from './ClientLayout';
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: 'AI Template Studio | Premium SaaS',
  description: 'AI generation and templates marketplace.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("dark", "font-sans", inter.variable)}>
      <body className="flex h-screen overflow-hidden bg-[#fafafa] dark:bg-black text-gray-100 antialiased">
        <Providers>
          <ClientLayout>
            {children}
          </ClientLayout>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
