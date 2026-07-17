"use client";

import React from "react";
import Link from "next/link";
import { useTranslation } from "../../lib/i18n";
import { useUIStore } from "../../store";

export function Footer() {
  const { t } = useTranslation();
  const preferences = useUIStore((state) => state.preferences);
  const isPremium = preferences?.skin === "PREMIUM";

  return (
    <footer
      className={`w-full py-6 mt-auto ${
        isPremium
          ? "border-t border-white/5 bg-black/20 backdrop-blur-md"
          : "border-t border-slate-200 dark:border-slate-800 bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-sm text-slate-500 dark:text-slate-400">
          © {new Date().getFullYear()} HSHA Sandbox. All rights reserved.
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-medium text-slate-600 dark:text-slate-300">
          <Link
            href="/terms"
            className="hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            {t("checkout.legal.terms")}
          </Link>
          <Link
            href="/privacy"
            className="hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            {t("checkout.legal.privacy")}
          </Link>
          <Link
            href="/billing-policy"
            className="hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            {t("checkout.legal.billing")}
          </Link>
          <Link
            href="/refund-policy"
            className="hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            {t("checkout.legal.refund")}
          </Link>
          <a
            href="mailto:support@hshasandbox.com"
            className="hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
