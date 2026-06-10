import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { ClientLayout } from './ClientLayout';

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
    <html lang="en" suppressHydrationWarning className="dark">
      <body className="flex h-screen overflow-hidden bg-black text-gray-100 antialiased">
        <Providers>
          <ClientLayout>
            {children}
          </ClientLayout>
        </Providers>
      </body>
    </html>
  );
}
