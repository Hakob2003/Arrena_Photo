"use client";

import React from "react";
import Link from "next/link";
import { useTranslation } from "../../lib/i18n";

interface LegalCheckboxesProps {
  termsAccepted: boolean;
  setTermsAccepted: (val: boolean) => void;
  isSubscription: boolean;
}

export function LegalCheckboxes({
  termsAccepted,
  setTermsAccepted,
  isSubscription,
}: LegalCheckboxesProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-3 my-4">
      <label className="flex items-start gap-2 cursor-pointer group">
        <div className="relative flex items-center justify-center mt-0.5">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="peer appearance-none w-4 h-4 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-black checked:bg-blue-500 checked:border-blue-500 transition-colors"
          />
          <svg
            className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <span className="text-xs text-slate-600 dark:text-slate-400 leading-snug">
          {t("checkout.termsAgree")}
        </span>
      </label>

      {isSubscription && (
        <div className="flex items-start gap-2 opacity-80">
          <div className="relative flex items-center justify-center mt-0.5">
            <input
              type="checkbox"
              checked
              readOnly
              className="appearance-none w-4 h-4 border border-slate-300 dark:border-slate-600 rounded bg-blue-500/50 dark:bg-blue-500/20 border-blue-500/50"
            />
            <svg
              className="absolute w-3 h-3 text-white/70 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-xs text-slate-600 dark:text-slate-400 leading-snug">
            {t("checkout.subAgree")}
          </span>
        </div>
      )}
    </div>
  );
}

export function LegalDisclaimer({ isSubscription }: { isSubscription: boolean }) {
  const { t } = useTranslation();

  return (
    <div className="mt-4 text-[10px] text-slate-500 dark:text-slate-500 leading-tight space-y-1">
      <p className="font-semibold">{t("checkout.disclaimerTitle")}</p>
      <ul className="list-disc pl-4 space-y-0.5">
        <li>{t("checkout.disclaimer1")}</li>
        <li>{t("checkout.disclaimer2")}</li>
        {isSubscription && <li>{t("checkout.disclaimer3")}</li>}
        <li>{t("checkout.disclaimer4")}</li>
      </ul>
    </div>
  );
}
