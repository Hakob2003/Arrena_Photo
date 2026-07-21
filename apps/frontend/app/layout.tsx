import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { ClientLayout } from "./ClientLayout";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "AI Template Studio | Premium SaaS",
  description: "AI generation and templates marketplace.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("dark", "font-sans", inter.variable)}
    >
      <body className="min-h-screen bg-transparent text-gray-100 antialiased flex flex-col">
        <Providers>
          <ClientLayout>{children}</ClientLayout>
        </Providers>
        <Toaster position="top-center" containerStyle={{ zIndex: 9999 }} />
        <script
          src="https://telegram.org/js/telegram-web-app.js"
          async
        ></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('load', function() {
                if (window.Telegram && window.Telegram.WebApp) {
                  window.Telegram.WebApp.expand();
                }
              });
            `,
          }}
        />
      </body>
    </html>
  );
}
