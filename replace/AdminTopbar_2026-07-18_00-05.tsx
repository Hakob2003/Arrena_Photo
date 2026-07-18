"use client";
import React from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "../../store";
import { useTranslation } from "../../lib/i18n";

export function AdminTopbar() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  // Create simple breadcrumbs from pathname
  const paths = pathname?.split("/").filter(Boolean) || [];

  return (
    <header className="h-14 border-b border-black/5 dark:border-white/5 bg-[#0a0a0a] flex items-center justify-between px-3 sm:px-6 sticky top-0 z-20 min-w-0 max-w-full overflow-hidden">
      <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-slate-500 dark:text-gray-400 min-w-0 truncate">
        <span className="text-slate-400 dark:text-gray-500 shrink-0">
          Admin
        </span>
        {paths.map((p, i) => (
          <React.Fragment key={i}>
            <span className="text-gray-600 shrink-0">/</span>
            <span
              className={`truncate ${i === paths.length - 1 ? "text-slate-900 dark:text-white font-medium capitalize" : "capitalize"}`}
            >
              {p.replace("-", " ")}
            </span>
          </React.Fragment>
        ))}
      </div>

      <div className="flex items-center gap-2 sm:gap-4 shrink-0 ml-2">
        <button className="hidden sm:block text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:text-slate-900 dark:text-white text-sm">
          {t("admin.topbar.feedback") || "Feedback"}
        </button>
        <button className="hidden sm:block text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:text-slate-900 dark:text-white text-sm">
          {t("admin.topbar.docs") || "Docs"}
        </button>
        <button
          onClick={async (e) => {
            e.preventDefault();
            localStorage.removeItem("auth-storage");
            localStorage.removeItem("token");
            try {
              await logout();
            } catch (err) {}
            window.location.href = "/login";
          }}
          className="text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:text-slate-900 dark:text-white text-xs sm:text-sm transition-colors"
        >
          {t("admin.topbar.logout")}
        </button>
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-gray-700 to-gray-500 flex items-center justify-center text-xs font-bold text-slate-900 dark:text-slate-900 dark:text-white border border-black/10 dark:border-white/10 cursor-pointer shrink-0">
          {user?.name?.charAt(0)?.toUpperCase() || "A"}
        </div>
      </div>
    </header>
  );
}
