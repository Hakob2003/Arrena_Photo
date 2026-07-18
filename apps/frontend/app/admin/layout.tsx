"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore, useUIStore } from "../../store";
import { AdminSidebar } from "../../components/admin/AdminSidebar";
import { parseJwtPayload } from "@/lib/utils/jwt";
import { AdminTopbar } from "../../components/admin/AdminTopbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { isSidebarOpen, setSidebarOpen } = useUIStore();
  const [touchStart, setTouchStart] = useState<number | null>(null);

  useEffect(() => {
    // Check role from user state directly since user is persisted.
    // AuthInitializer handles token refreshing and global unauthenticated redirects.
    if (!user) {
      router.push("/login");
      return;
    }

    if (user.role !== "ADMIN") {
      router.push("/");
    }
  }, [router, user]);

  useEffect(() => {
    // Close sidebar on navigation on mobile
    setSidebarOpen(false);
  }, [pathname, setSidebarOpen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const distance = touchEnd - touchStart;

    if (distance > 50 && touchStart < 50 && !isSidebarOpen) {
      setSidebarOpen(true);
    } else if (distance < -50 && isSidebarOpen) {
      setSidebarOpen(false);
    }
    setTouchStart(null);
  };

  return (
    <div
      className="flex h-[100dvh] w-screen max-w-full bg-[#050505] text-gray-200 overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 max-w-full overflow-hidden">
        <div className="flex items-center w-full z-20 bg-[#0a0a0a] border-b border-black/5 dark:border-white/5 md:border-none shrink-0">
          <button
            className="md:hidden p-4 text-slate-900 dark:text-slate-900 dark:text-white hover:text-slate-900 dark:hover:text-gray-300"
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>
          <div className="flex-1 min-w-0">
            <AdminTopbar />
          </div>
        </div>

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:p-8 pb-20 custom-scrollbar relative z-10">
          <div className="w-full max-w-full pb-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
