"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { loadStripe } from "@stripe/stripe-js";
import type { StripeElementLocale } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
  ExpressCheckoutElement,
} from "@stripe/react-stripe-js";
import type { StripeExpressCheckoutElementReadyEvent } from "@stripe/stripe-js";
import { X, CheckCircle, Loader2 } from "lucide-react";
import { api } from "../../lib/api";
import { useAuthStore, useUIStore } from "../../store";
import { useTranslation } from "../../lib/i18n";
import type { Locale } from "../../lib/i18n";

// --- Constants ---
const STRIPE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";

const stripePromise = STRIPE_PUBLISHABLE_KEY
  ? loadStripe(STRIPE_PUBLISHABLE_KEY)
  : null;

/** Map app locale to Stripe-supported locale. Stripe does not support 'hy'. */
const STRIPE_LOCALE_MAP: Record<Locale, StripeElementLocale> = {
  en: "en",
  ru: "ru",
  hy: "en", // Armenian is not supported by Stripe, fallback to English
};

const CREDIT_PACKAGES = [
  { id: "pack_100", label: "100", amountUsd: 4.99, credits: 100 },
  {
    id: "pack_500",
    label: "500",
    amountUsd: 19.99,
    credits: 500,
    popular: true,
  },
  { id: "pack_1000", label: "1000", amountUsd: 34.99, credits: 1000 },
] as const;

type CreditPackage = (typeof CREDIT_PACKAGES)[number];

// --- Interfaces ---
interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "CREDITS" | "SUBSCRIPTION";
  planName?: string;
}

interface CheckoutFormProps {
  clientSecret: string;
  onSuccess: () => void;
}

// --- CheckoutForm (inner component inside <Elements>) ---
function CheckoutForm({ clientSecret, onSuccess }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [method, setMethod] = useState<'card' | 'apple' | 'google'>('card');
  
  const { t } = useTranslation();
  const preferences = useUIStore((state) => state.preferences);
  const isLuxury = preferences?.skin === "PREMIUM";

  const confirmPayment = useCallback(async () => {
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

  const handleFormSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      await confirmPayment();
    },
    [confirmPayment]
  );



  const handleExpressConfirm = useCallback(async () => {
    await confirmPayment();
  }, [confirmPayment]);

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Custom Payment Method Tabs */}
      <div className="flex bg-slate-100 dark:bg-[#1a1a1a] p-1 rounded-xl">
        <button
          type="button"
          onClick={() => setMethod('card')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
            method === 'card'
              ? 'bg-white dark:bg-black shadow-sm text-slate-900 dark:text-white'
              : 'text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200'
          }`}
        >
          Card
        </button>
        <button
          type="button"
          onClick={() => setMethod('apple')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
            method === 'apple'
              ? 'bg-white dark:bg-black shadow-sm text-slate-900 dark:text-white'
              : 'text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200'
          }`}
        >
          Apple Pay
        </button>
        <button
          type="button"
          onClick={() => setMethod('google')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
            method === 'google'
              ? 'bg-white dark:bg-black shadow-sm text-slate-900 dark:text-white'
              : 'text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200'
          }`}
        >
          Google Pay
        </button>
      </div>

      <form onSubmit={handleFormSubmit} className="w-full flex flex-col gap-4">
        {/* Card */}
        <div className={method === 'card' ? 'block' : 'hidden'}>
          <PaymentElement
            options={{
              wallets: {
                applePay: 'never',
                googlePay: 'never',
                link: 'never',
              },
            }}
          />
        </div>

        {/* Apple Pay */}
        {method === 'apple' && (
          <div className="mt-2 min-h-[44px]">
            <ExpressCheckoutElement
              options={{
                paymentMethods: {
                  applePay: 'always',
                  googlePay: 'never',
                  link: 'never',
                  amazonPay: 'never',
                  paypal: 'never',
                  klarna: 'never',
                },
              }}
              onConfirm={handleExpressConfirm}
            />
          </div>
        )}

        {/* Google Pay */}
        {method === 'google' && (
          <div className="mt-2 min-h-[44px]">
            <ExpressCheckoutElement
              options={{
                paymentMethods: {
                  googlePay: 'always',
                  applePay: 'never',
                  link: 'never',
                  amazonPay: 'never',
                  paypal: 'never',
                  klarna: 'never',
                },
              }}
              onConfirm={handleExpressConfirm}
            />
          </div>
        )}

        {error && (
          <div className="text-red-600 dark:text-red-400 text-sm p-3 bg-red-100 dark:bg-red-400/10 border border-red-200 dark:border-red-400/20 rounded-lg">
            {error}
          </div>
        )}

        {method === 'card' && (
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
        )}

        <div className="text-center text-xs text-slate-500 dark:text-gray-500 mt-2 flex items-center justify-center gap-1">
          {t("payment.modal.securePayment")} <b>Stripe</b>
        </div>
      </form>
    </div>
  );
}

// --- Main Modal ---
export function PaymentModal({
  isOpen,
  onClose,
  type,
  planName,
}: PaymentModalProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [selectedPack, setSelectedPack] = useState<CreditPackage>(
    CREDIT_PACKAGES[1]
  );
  const [isInitializing, setIsInitializing] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const { t, locale } = useTranslation();
  const addCredits = useAuthStore((state) => state.addCredits);
  const setCredits = useAuthStore((state) => state.setCredits);
  const setPlanId = useAuthStore((state) => state.setPlanId);

  const stripeLocale = STRIPE_LOCALE_MAP[locale] ?? "en";

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setClientSecret(null);
      setIsSuccess(false);
      setInitError(null);
    }
  }, [isOpen]);

  // Initialize Payment Intent
  useEffect(() => {
    if (!isOpen) return;

    const initPayment = async () => {
      setIsInitializing(true);
      setInitError(null);
      try {
        if (type === "CREDITS") {
          const res = await api.post("/payment/create-intent", {
            amount: selectedPack.amountUsd,
            credits: selectedPack.credits,
          });
          setClientSecret(res.data.clientSecret);
        } else if (type === "SUBSCRIPTION" && planName) {
          const res = await api.post("/payment/create-subscription", {
            planName,
          });
          setClientSecret(res.data.clientSecret);
        }
      } catch (err: unknown) {
        const axiosErr = err as { response?: { data?: { message?: string } }; message?: string };
        console.error("Failed to initialize payment", err);
        setInitError(
          axiosErr.response?.data?.message ??
            axiosErr.message ??
            t("payment.modal.initFailed")
        );
      } finally {
        setIsInitializing(false);
      }
    };

    initPayment();
  }, [isOpen, type, planName, selectedPack, t]);

  /** Soft-refresh user data from server after successful payment */
  const handleSuccess = useCallback(async () => {
    setIsSuccess(true);

    try {
      const { data } = await api.get("/auth/me");
      if (data.credits !== undefined) {
        setCredits(data.credits);
      }
      if (data.planId) {
        setPlanId(data.planId);
      }
    } catch {
      // If refresh fails, at least optimistically update credits
      if (type === "CREDITS") {
        addCredits(selectedPack.credits);
      }
      if (type === "SUBSCRIPTION" && planName) {
        setPlanId(planName.toLowerCase());
      }
    }

    // Auto-close after short delay
    setTimeout(() => {
      onClose();
    }, 2500);
  }, [type, selectedPack, planName, addCredits, setCredits, setPlanId, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 md:p-8"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar bg-white dark:bg-[#0a0a0a] glass-card rounded-2xl shadow-2xl border border-black/10 dark:border-white/10 flex flex-col md:flex-row"
          >
            {/* Left Side: Summary / Package Selection */}
            <div className="w-full md:w-1/3 bg-slate-50 dark:bg-[#111] p-6 md:p-8 flex flex-col border-b md:border-b-0 md:border-r border-black/10 dark:border-white/10 shrink-0">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                {type === "CREDITS"
                  ? t("payment.modal.buyCredits")
                  : t("payment.modal.upgradePlan")}
              </h2>
              <p className="text-slate-500 dark:text-zinc-400 text-sm mb-6">
                {type === "CREDITS"
                  ? t("payment.modal.creditsDesc")
                  : t("payment.modal.upgradeDesc").replace(
                      "{plan}",
                      planName ?? ""
                    )}
              </p>

              {type === "CREDITS" && (
                <div className="flex flex-col gap-3">
                  {CREDIT_PACKAGES.map((pack) => (
                    <button
                      key={pack.id}
                      onClick={() => setSelectedPack(pack)}
                      className={`relative p-4 rounded-xl border text-left transition-all ${
                        selectedPack.id === pack.id
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10 shadow-sm"
                          : "border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 bg-white dark:bg-white/5"
                      }`}
                    >
                      {"popular" in pack && pack.popular && (
                        <div className="absolute -top-3 right-4 bg-blue-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                          {t("payment.modal.popular")}
                        </div>
                      )}
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {pack.label} {t("payment.modal.credits")}
                      </div>
                      <div className="text-sm text-slate-500 dark:text-zinc-400">
                        ${pack.amountUsd}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Side: Payment Elements */}
            <div className="w-full md:w-2/3 p-6 md:p-8 relative flex flex-col justify-center min-h-[400px]">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 md:top-6 md:right-6 text-slate-400 hover:text-slate-600 dark:text-white/50 dark:hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              {isSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center text-center text-slate-900 dark:text-white"
                >
                  <CheckCircle className="w-20 h-20 text-green-500 mb-4" />
                  <h3 className="text-2xl font-bold mb-2">
                    {t("payment.modal.success")}
                  </h3>
                  <p className="text-slate-500 dark:text-zinc-400">
                    {type === "CREDITS"
                      ? t("payment.modal.creditsAdded")
                      : t("payment.modal.subActive")}
                  </p>
                </motion.div>
              ) : initError ? (
                <div className="flex flex-col items-center justify-center text-red-600 dark:text-red-400 h-full text-center px-4">
                  <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center mb-4">
                    <X className="w-6 h-6" />
                  </div>
                  <p className="font-bold mb-2">{t("payment.modal.initFailed")}</p>
                  <p className="text-sm text-red-500/80">{initError}</p>
                </div>
              ) : isInitializing || !clientSecret ? (
                <div className="flex flex-col items-center justify-center text-slate-400 dark:text-white/50 h-full">
                  <Loader2 className="w-8 h-8 animate-spin mb-4" />
                  <p>{t("payment.modal.initLoading")}</p>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-full max-w-md mx-auto"
                >
                  <Elements
                    stripe={stripePromise}
                    options={{
                      clientSecret,
                      locale: stripeLocale,
                      appearance: {
                        theme: "stripe",
                        variables: {
                          colorPrimary: "#3b82f6",
                          colorBackground: "transparent",
                          colorText: "inherit",
                          colorDanger: "#ef4444",
                          fontFamily: "Inter, system-ui, sans-serif",
                          borderRadius: "8px",
                          spacingUnit: "4px",
                        },
                        rules: {
                          ".Input": {
                            backgroundColor: "transparent",
                            color: "inherit",
                          },
                        },
                      },
                    }}
                  >
                    <CheckoutForm
                      clientSecret={clientSecret}
                      onSuccess={handleSuccess}
                    />
                  </Elements>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
