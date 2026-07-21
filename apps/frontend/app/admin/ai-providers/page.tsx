"use client";
import React, { useState } from "react";
import { PageHeader } from "../../../components/admin/PageHeader";
import { Badge } from "../../../components/admin/Badge";
import { ChatTest } from "../../../components/ai/ChatTest";
import { BentoCard } from "../../../components/admin/BentoCard";

export default function AdminAiProviders() {
  const [activeTab, setActiveTab] = useState<"settings" | "test">("settings");

  return (
    <>
      <PageHeader
        title="AI Providers"
        description="Unified OpenRouter integration settings and tests."
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
            Settings
          </button>
          <button
            onClick={() => setActiveTab("test")}
            className={`px-4 py-2 font-medium transition-colors ${activeTab === "test" ? "text-slate-900 dark:text-white border-b-2 border-indigo-500" : "text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:text-white"}`}
          >
            Test Connection
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
              OpenRouter Configuration
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-black/10 dark:border-white/10">
                <span className="text-slate-500 dark:text-gray-400">
                  Status
                </span>
                <Badge variant="success">ACTIVE</Badge>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-black/10 dark:border-white/10">
                <span className="text-slate-500 dark:text-gray-400">
                  Default Model
                </span>
                <span className="font-mono text-slate-900 dark:text-slate-900 dark:text-white bg-black/5 dark:bg-white/5 px-2 py-1 rounded text-sm border border-black/10 dark:border-white/10">
                  openrouter/free
                </span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-slate-500 dark:text-gray-400">
                  Fallback Logic
                </span>
                <span className="text-slate-900 dark:text-gray-300 text-sm">
                  Active (returns to openrouter/free on fail)
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
              Usage Statistics
            </h3>
            <div className="flex flex-col gap-4">
              <div className="bg-transparent border border-black/10 dark:border-white/10 p-4 rounded-lg">
                <p className="text-sm text-slate-500 dark:text-gray-400 mb-1">
                  Total Tokens Used
                </p>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-900 dark:text-white">
                  1,492,050
                </p>
              </div>
              <div className="flex gap-4">
                <div className="flex-1 bg-transparent border border-black/10 dark:border-white/10 p-4 rounded-lg">
                  <p className="text-sm text-slate-500 dark:text-gray-400 mb-1">
                    Input Tokens
                  </p>
                  <p className="text-xl font-semibold text-slate-900 dark:text-gray-300">
                    840,100
                  </p>
                </div>
                <div className="flex-1 bg-transparent border border-black/10 dark:border-white/10 p-4 rounded-lg">
                  <p className="text-sm text-slate-500 dark:text-gray-400 mb-1">
                    Output Tokens
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
            Live Test
          </h3>
          <p className="text-slate-500 dark:text-gray-400 text-sm mb-6">
            Test your OpenRouter connection. Tokens are streamed directly from
            the backend via Server-Sent Events (SSE).
          </p>
          <ChatTest />
        </BentoCard>
      )}
    </>
  );
}
