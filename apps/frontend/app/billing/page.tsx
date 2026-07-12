"use client";

import React, { useEffect, useRef } from "react";
import { OverviewTab } from "./tabs/OverviewTab";
import { PlansTab } from "./tabs/PlansTab";
import { UsageTab } from "./tabs/UsageTab";
import { PaymentTab } from "./tabs/PaymentTab";
import { useTranslation } from "../../lib/i18n";
import { useAuthStore } from "../../store";
import { api } from "../../lib/api";

export default function UserBillingPage() {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync planId and credits from server on page load
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/auth/me");
        if (data.planId) useAuthStore.getState().setPlanId(data.planId);
        if (data.credits != null)
          useAuthStore.getState().setCredits(data.credits);
      } catch (e) {
        // Ignore — user may not be authenticated
      }
    })();
  }, []);

  // Focus on the hash if present on initial load
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      if (hash) {
        const element = document.querySelector(hash);
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ behavior: "smooth" });
          }, 100);
        }
      }
    }
  }, []);

  return (
    <div ref={containerRef} className="flex flex-col gap-12 pb-32">
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          {t("billing.title")}
        </h1>
        <p className="text-slate-500 dark:text-gray-400 mt-2">
          {t("billing.description")}
        </p>
      </div>

      {/* Warning Alert (Mock: if credits < 20%) */}
      <div className="mb-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-xl p-4 flex items-start gap-3">
        <span className="text-amber-500">⚠️</span>
        <div>
          <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-300">
            {t("billing.lowCreditsTitle")}
          </h4>
          <p className="text-sm text-amber-700 dark:text-amber-400/80 mt-1">
            {t("billing.lowCreditsDescription")}
          </p>
        </div>
        <button
          onClick={() => {
            const el = document.querySelector("#plans");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }}
          className="ml-auto text-sm bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg transition-colors font-medium"
        >
          {t("billing.topUp")}
        </button>
      </div>

      <section
        id="overview"
        className="scroll-m-24 scroll-mt-32 bg-transparent/[0.03] dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl p-6 md:p-8"
      >
        <OverviewTab
          onNavigateToPlans={() => {
            const el = document.querySelector("#plans");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }}
        />
      </section>

      <section
        id="plans"
        className="scroll-m-24 scroll-mt-32 bg-transparent/[0.03] dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl p-6 md:p-8"
      >
        <PlansTab />
      </section>

      <section
        id="usage"
        className="scroll-m-24 scroll-mt-32 bg-transparent/[0.03] dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl p-6 md:p-8"
      >
        <UsageTab />
      </section>

      <section
        id="payment"
        className="scroll-m-24 scroll-mt-32 bg-transparent/[0.03] dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl p-6 md:p-8"
      >
        <PaymentTab />
      </section>
    </div>
  );
}
