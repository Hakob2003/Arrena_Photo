"use client";

import React from "react";
import { useTranslation } from "../../lib/i18n";
import { Topbar } from "../../components/layout/Topbar";
import { motion } from "framer-motion";

export default function TermsPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-black/40 text-slate-900 dark:text-white pt-24 pb-20 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-slate-900/50 rounded-2xl shadow-xl dark:shadow-2xl border border-slate-200 dark:border-white/5 overflow-hidden"
        >
          <div className="p-8 md:p-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
              {t("legal.terms.title")}
            </h1>
            <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
              {t("legal.terms.content")}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
