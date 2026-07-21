"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "../../store";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (user.role !== "ADMIN") {
      router.push("/");
    }
  }, [router, user]);

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="w-full h-full flex-1 p-3 sm:p-4 md:p-8 max-w-[100vw] overflow-x-hidden">
      {children}
    </div>
  );
}
