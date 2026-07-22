"use client";
import React, { useState } from "react";
import { useTranslation } from "../../../lib/i18n";
import { PageHeader } from "../../../components/admin/PageHeader";
import { Badge } from "../../../components/admin/Badge";
import { ChatTest } from "../../../components/ai/ChatTest";
import { BentoCard } from "../../../components/admin/BentoCard";

export default function AdminAiProviders() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"settings" | "test">("settings");

  return (
    <>
      <PageHeader
        title={t("admin.aiProviders.title")}
        description={t("admin.aiProviders.subtitle")}
      />

      <BentoCard
        colSpan={0}
        rowSpan={0}
        delay={0.1}
        className="w-full relative z-10 overflow-visible mb-6"
      >
        <div className="flex space-x-4 border-b border-black/10 dark:border-white/10 pb-2">
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-4 py-2 font-medium transition-colors ${activeTab === "settings" ? "text-slate-900 dark:text-white border-b-2 border-indigo-500" : "text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:text-white"}`}
          >
            {t("admin.aiProviders.settings")}
          </button>
          <button
            onClick={() => setActiveTab("test")}
            className={`px-4 py-2 font-medium transition-colors ${activeTab === "test" ? "text-slate-900 dark:text-white border-b-2 border-indigo-500" : "text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:text-white"}`}
          >
            {t("admin.aiProviders.testConnection")}
          </button>
        </div>
      </BentoCard>

      {activeTab === "settings" ? (
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          <BentoCard
            colSpan={0}
            rowSpan={0}
            delay={0.2}
            className="flex-1 min-w-[300px]"
          >
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-900 dark:text-white mb-4">
              {t("admin.aiProviders.config")}
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-black/10 dark:border-white/10">
                <span className="text-slate-500 dark:text-gray-400">
                  {t("admin.aiProviders.status")}
                </span>
                <Badge variant="success">ACTIVE</Badge>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-black/10 dark:border-white/10">
                <span className="text-slate-500 dark:text-gray-400">
                  {t("admin.aiProviders.defaultModel")}
                </span>
                <span className="font-mono text-slate-900 dark:text-slate-900 dark:text-white bg-black/5 dark:bg-white/5 px-2 py-1 rounded text-sm border border-black/10 dark:border-white/10">
                  openrouter/free
                </span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-slate-500 dark:text-gray-400">
                  {t("admin.aiProviders.fallbackLogic")}
                </span>
                <span className="text-slate-900 dark:text-gray-300 text-sm">
                  {t("admin.aiProviders.fallbackDesc")}
                </span>
              </div>
            </div>
          </BentoCard>

          <BentoCard
            colSpan={0}
            rowSpan={0}
            delay={0.3}
            className="flex-1 min-w-[300px]"
          >
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-900 dark:text-white mb-4">
              {t("admin.aiProviders.usage")}
            </h3>
            <div className="flex flex-col gap-4">
              <div className="bg-transparent border border-black/10 dark:border-white/10 p-4 rounded-lg">
                <p className="text-sm text-slate-500 dark:text-gray-400 mb-1">
                  {t("admin.aiProviders.totalTokens")}
                </p>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-900 dark:text-white">
                  1,492,050
                </p>
              </div>
              <div className="flex gap-4">
                <div className="flex-1 bg-transparent border border-black/10 dark:border-white/10 p-4 rounded-lg">
                  <p className="text-sm text-slate-500 dark:text-gray-400 mb-1">
                    {t("admin.aiProviders.inputTokens")}
                  </p>
                  <p className="text-xl font-semibold text-slate-900 dark:text-gray-300">
                    840,100
                  </p>
                </div>
                <div className="flex-1 bg-transparent border border-black/10 dark:border-white/10 p-4 rounded-lg">
                  <p className="text-sm text-slate-500 dark:text-gray-400 mb-1">
                    {t("admin.aiProviders.outputTokens")}
                  </p>
                  <p className="text-xl font-semibold text-slate-900 dark:text-gray-300">
                    651,950
                  </p>
                </div>
              </div>
            </div>
          </BentoCard>
        </div>
      ) : (
        <BentoCard colSpan={0} rowSpan={0} delay={0.2} className="w-full">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-900 dark:text-white mb-4">
            {t("admin.aiProviders.liveTest")}
          </h3>
          <p className="text-slate-500 dark:text-gray-400 text-sm mb-6">
            {t("admin.aiProviders.testDesc")}
          </p>
          <ChatTest />
        </BentoCard>
      )}
    </>
  );
}

