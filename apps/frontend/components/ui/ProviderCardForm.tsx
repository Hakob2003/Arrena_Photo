"use client";

import React, { useState, useCallback } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Loader2 } from "lucide-react";
import { useTranslation } from "../../lib/i18n";
import { useUIStore } from "../../store";

interface ProviderCardFormProps {
  clientSecret: string;
  onSuccess: () => void;
}

export function ProviderCardForm({ clientSecret, onSuccess }: ProviderCardFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { t } = useTranslation();
  const preferences = useUIStore((state) => state.preferences);
  const isLuxury = preferences?.skin === "PREMIUM";

  const handleFormSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsLoading(true);
    setError(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message ?? t("payment.modal.genericError"));
      setIsLoading(false);
      return;
    }

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: window.location.href,
      },
      redirect: "if_required",
    });

    if (confirmError) {
      setError(confirmError.message ?? t("payment.modal.genericError"));
      setIsLoading(false);
    } else {
      onSuccess();
    }
  }, [stripe, elements, clientSecret, onSuccess, t]);

  return (
    <form onSubmit={handleFormSubmit} className="w-full flex flex-col gap-4">
      <PaymentElement
        options={{
          layout: 'tabs',
          wallets: {
            applePay: 'never',
            googlePay: 'never',
            link: 'never',
          },
        }}
      />

      {error && (
        <div className="text-red-600 dark:text-red-400 text-sm p-3 bg-red-100 dark:bg-red-400/10 border border-red-200 dark:border-red-400/20 rounded-lg">
          {error}
        </div>
      )}

      <button
        disabled={isLoading || !stripe || !elements}
        type="submit"
        className={`w-full py-3 px-4 font-semibold rounded-xl mt-4 disabled:opacity-50 flex items-center justify-center transition-all ${
          isLuxury
            ? 'bg-[#D4AF37] hover:bg-[#C5A028] text-black shadow-[0_4px_14px_rgba(212,175,55,0.4)]'
            : 'bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-gray-100'
        }`}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          t("payment.modal.payNow")
        )}
      </button>
    </form>
  );
}
