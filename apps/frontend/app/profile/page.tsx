"use client";

import { useEffect, useRef } from "react";
import PersonalTab from "@/components/profile/PersonalTab";
import SecurityTab from "@/components/profile/SecurityTab";
import AppearanceTab from "@/components/profile/AppearanceTab";
import NotificationsTab from "@/components/profile/NotificationsTab";
import StatisticsTab from "@/components/profile/StatisticsTab";
import ActivityTab from "@/components/profile/ActivityTab";

export default function ProfilePage() {
  const containerRef = useRef<HTMLDivElement>(null);

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
      {/* 
        We use an id on each section wrapper for anchor links. 
        scroll-m-24 helps to offset the sticky header if there is one.
      */}
      <section
        id="personal"
        className="scroll-m-24 scroll-mt-32 bg-transparent/[0.03] dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl p-6 md:p-8"
      >
        <PersonalTab />
      </section>

      <section
        id="security"
        className="scroll-m-24 scroll-mt-32 bg-transparent/[0.03] dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl p-6 md:p-8"
      >
        <SecurityTab />
      </section>

      <section
        id="appearance"
        className="scroll-m-24 scroll-mt-32 bg-transparent/[0.03] dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl p-6 md:p-8"
      >
        <AppearanceTab />
      </section>

      <section
        id="notifications"
        className="scroll-m-24 scroll-mt-32 bg-transparent/[0.03] dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl p-6 md:p-8"
      >
        <NotificationsTab />
      </section>

      <section
        id="statistics"
        className="scroll-m-24 scroll-mt-32 bg-transparent/[0.03] dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl p-6 md:p-8"
      >
        <StatisticsTab />
      </section>

      <section
        id="activity"
        className="scroll-m-24 scroll-mt-32 bg-transparent/[0.03] dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl p-6 md:p-8"
      >
        <ActivityTab />
      </section>
    </div>
  );
}
