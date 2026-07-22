"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { loadStripe } from "@stripe/stripe-js";
import type { StripeElementLocale } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { X, CheckCircle, Loader2, Apple } from "lucide-react";

const GoogleGIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" width="20" height="20" className={className}>
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);
import { api } from "../../lib/api";
import { useAuthStore, useUIStore } from "../../store";
import { useTranslation } from "../../lib/i18n";
import type { Locale } from "../../lib/i18n";
import { ProviderCardForm } from "./ProviderCardForm";
import { LegalCheckboxes, LegalDisclaimer } from "./LegalCompliance";
import { CREDIT_PACKAGES } from "../../config/pricing";
import type { CreditPackage } from "../../config/pricing";

const STRIPE_LOCALE_MAP: Record<Locale, StripeElementLocale> = {
  en: "en",
  ru: "ru",
  hy: "en",
};

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "CREDITS" | "SUBSCRIPTION";
  planName?: string;
  initialCreditAmount?: number;
}

export function PaymentModal({
  isOpen,
  onClose,
  type,
  planName,
  initialCreditAmount,
}: PaymentModalProps) {
  const [method, setMethod] = useState<"card" | "apple" | "google" | "saved">("card");
  const [selectedSavedCardId, setSelectedSavedCardId] = useState<string>("");
  const [config, setConfig] = useState<any>(null);
  const [stripePromise, setStripePromise] = useState<any>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [selectedPack, setSelectedPack] = useState<CreditPackage>(
    CREDIT_PACKAGES[0],
  );
  const [isInitializing, setIsInitializing] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isProcessingWallet, setIsProcessingWallet] = useState(false);

  const { t, locale } = useTranslation();
  const addCredits = useAuthStore((state) => state.addCredits);
  const setCredits = useAuthStore((state) => state.setCredits);
  const setPlanId = useAuthStore((state) => state.setPlanId);
  const paymentMethods = useAuthStore((state) => state.paymentMethods);
  const fetchPaymentMethods = useAuthStore((state) => state.fetchPaymentMethods);
  const isLuxury = useUIStore((state) => state.preferences?.skin) === "PREMIUM";

  const stripeLocale = STRIPE_LOCALE_MAP[locale] ?? "en";

  const theme = useUIStore((state) => state.preferences?.theme);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (typeof document !== "undefined") {
      setIsDark(document.documentElement.classList.contains("dark"));
      const observer = new MutationObserver(() => {
        setIsDark(document.documentElement.classList.contains("dark"));
      });
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
      });
      return () => observer.disconnect();
    }
  }, [theme]);

  useEffect(() => {
    if (isOpen && type === "CREDITS" && initialCreditAmount) {
      const pack = CREDIT_PACKAGES.find(
        (p) => p.credits === initialCreditAmount,
      );
      if (pack) {
        setSelectedPack(pack);
      }
    }
  }, [isOpen, type, initialCreditAmount]);

  useEffect(() => {
    if (isOpen) {
      fetchPaymentMethods().then(() => {});
    }
  }, [isOpen, fetchPaymentMethods]);

  useEffect(() => {
    if (paymentMethods && paymentMethods.length > 0 && !selectedSavedCardId) {
      const defaultCard = paymentMethods.find((pm) => pm.isDefault) || paymentMethods[0];
      setSelectedSavedCardId(defaultCard.id);
      setMethod("saved");
    }
  }, [paymentMethods, selectedSavedCardId]);

  // 1. Fetch Config
  useEffect(() => {
    if (!isOpen) return;
    const fetchConfig = async () => {
      try {
        const { data } = await api.get("/payment/config");
        setConfig(data);
        if (data.provider === "stripe" && data.publicKey) {
          setStripePromise(loadStripe(data.publicKey));
        }
      } catch (err) {
        console.error("Failed to load payment config", err);
        setInitError("Failed to load payment configuration.");
      }
    };
    if (!config) fetchConfig();
  }, [isOpen, config]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setClientSecret(null);
      setIsSuccess(false);
      setInitError(null);
      setIsProcessingWallet(false);
      setTermsAccepted(false);
    }
  }, [isOpen]);

  // Initialize Payment Intent for Card
  useEffect(() => {
    if (!isOpen || !config || method !== "card") return;

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
      } catch (err: any) {
        setInitError(
          err.response?.data?.message ??
            err.message ??
            t("payment.modal.initFailed"),
        );
      } finally {
        setIsInitializing(false);
      }
    };

    initPayment();
  }, [isOpen, type, planName, selectedPack, config, method, t]);

  const handleSuccess = useCallback(
    async (paymentIntentId?: string) => {
      setIsSuccess(true);
      try {
        if (paymentIntentId) {
          // Synchronously update the backend state if webhook hasn't fired yet
          await api.post("/payment/sync-status", { paymentIntentId });
        }
        
        // Auto-save the card if it was newly created
        if (paymentIntentId && method === "card") {
          try {
            await api.post("/billing/sync-card", { setupIntentId: paymentIntentId, limit: 0 });
            await fetchPaymentMethods();
          } catch (syncErr) {
            console.warn("Failed to auto-save card:", syncErr);
          }
        }

        const { data } = await api.get("/auth/me");
        if (data.credits !== undefined) setCredits(data.credits);
        if (data.planId) setPlanId(data.planId);
      } catch (e) {
        console.warn(
          "Failed to sync latest state from backend, falling back to optimistic UI update.",
          e,
        );
        if (type === "CREDITS") addCredits(selectedPack.credits);
        if (type === "SUBSCRIPTION" && planName)
          setPlanId(planName.toLowerCase());
      }
      setTimeout(onClose, 2500);
    },
    [type, selectedPack, planName, addCredits, setCredits, setPlanId, onClose],
  );

  const getFinalAmount = useCallback(() => {
    if (type === "CREDITS") return selectedPack.amountUsd;
    if (type === "SUBSCRIPTION" && planName) {
      const lower = planName.toLowerCase();
      if (lower === "starter") return 9;
      if (lower === "pro") return 29;
      if (lower === "business") return 99;
    }
    return 0;
  }, [type, planName, selectedPack]);

  // --- Wallet Processing (Google/Apple) ---
  const processWallet = async (token: any) => {
    setIsProcessingWallet(true);
    setInitError(null);
    try {
      const finalAmount = getFinalAmount();

      // Send token to backend
      const res = await api.post("/payment/process-wallet", {
        token,
        amount: finalAmount,
        type,
        planName,
        credits: type === "CREDITS" ? selectedPack.credits : undefined,
      });
      await handleSuccess(res.data.providerPaymentId);
    } catch (err: any) {
      setInitError(err.response?.data?.message ?? "Wallet payment failed");
      setIsProcessingWallet(false);
    }
  };

  const handleChargeSavedCard = async () => {
    setIsProcessingWallet(true);
    setInitError(null);
    try {
      const finalAmount = getFinalAmount();
      await api.post("/payment/charge-saved-card", {
        paymentMethodId: selectedSavedCardId,
        amount: finalAmount,
        type,
        credits: type === "CREDITS" ? selectedPack.credits : undefined,
        planName: type === "SUBSCRIPTION" ? planName : undefined,
      });
      await handleSuccess();
    } catch (err: any) {
      setInitError(err.response?.data?.message ?? "Saved card payment failed");
      setIsProcessingWallet(false);
    }
  };

  const handleGooglePay = (paymentData: any) => {
    // The paymentData contains the tokenized payload
    const token = JSON.parse(
      paymentData.paymentMethodData.tokenizationData.token,
    );
    processWallet(token);
  };

  const handleCustomGooglePay = async () => {
    if (!config) return;
    setIsProcessingWallet(true);
    setInitError(null);

    try {
      if (!(window as any).google?.payments?.api?.PaymentsClient) {
        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://pay.google.com/gp/p/js/pay.js";
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      const paymentsClient = new (
        window as any
      ).google.payments.api.PaymentsClient({ environment: "TEST" });
      const paymentDataRequest = {
        apiVersion: 2,
        apiVersionMinor: 0,
        allowedPaymentMethods: [
          {
            type: "CARD",
            parameters: {
              allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
              allowedCardNetworks: ["MASTERCARD", "VISA"],
            },
            tokenizationSpecification: {
              type: "PAYMENT_GATEWAY",
              parameters:
                config.googlePayGateway === "stripe"
                  ? {
                      gateway: "stripe",
                      "stripe:version": "2023-10-16",
                      "stripe:publishableKey": config.googlePayMerchantId,
                    }
                  : {
                      gateway: config.googlePayGateway,
                      gatewayMerchantId: config.googlePayMerchantId,
                    },
            },
          },
        ],
        merchantInfo: { merchantName: "Arrena Photo" },
        transactionInfo: {
          totalPriceStatus: "FINAL",
          totalPriceLabel: "Total",
          totalPrice: getFinalAmount().toString(),
          currencyCode: "USD",
          countryCode: "US",
        },
      };

      const paymentData =
        await paymentsClient.loadPaymentData(paymentDataRequest);
      handleGooglePay(paymentData);
    } catch (err: any) {
      if (err.statusCode !== "CANCELED") {
        console.error("Custom Google Pay Error", err);
        setInitError("Google Pay encountered an error.");
      }
      setIsProcessingWallet(false);
    }
  };

  const handleApplePay = () => {
    let ApplePaySessionClass = (window as any).ApplePaySession;

    // Provide a mock session if not supported, so the user doesn't see an error during testing
    if (!ApplePaySessionClass) {
      ApplePaySessionClass = class MockApplePaySession {
        static STATUS_SUCCESS = 1;
        static STATUS_FAILURE = 2;
        onvalidatemerchant: any;
        onpaymentauthorized: any;

        constructor(version: number, paymentRequest: any) {}

        begin() {
          console.log("Mock Apple Pay Session started.");
          // Simulate merchant validation
          setTimeout(() => {
            if (this.onvalidatemerchant) {
              this.onvalidatemerchant({
                validationURL: "https://mock.apple.com/validate",
              });
            }
          }, 500);
        }

        completeMerchantValidation(merchantSession: any) {
          console.log("Mock Merchant Validated:", merchantSession);
          // Simulate payment authorization
          setTimeout(() => {
            if (this.onpaymentauthorized) {
              this.onpaymentauthorized({
                payment: { token: { id: "tok_visa" } }, // Use valid Stripe test token
              });
            }
          }, 1000);
        }

        completePayment(status: any) {
          console.log("Mock Payment Completed with status:", status);
        }

        abort() {
          console.log("Mock Apple Pay aborted");
        }
      };
    }

    const session = new ApplePaySessionClass(3, {
      countryCode: "US",
      currencyCode: "USD",
      supportedNetworks: ["visa", "masterCard", "amex", "discover"],
      merchantCapabilities: ["supports3DS"],
      total: { label: "Arrena Photo", amount: getFinalAmount().toString() },
    });

    session.onvalidatemerchant = async (event: any) => {
      try {
        const { data } = await api.post(
          "/payment/apple-pay/validate-merchant",
          {
            validationURL: event.validationURL,
          },
        );
        session.completeMerchantValidation(data);
      } catch (err) {
        session.abort();
        setInitError("Merchant validation failed");
      }
    };

    session.onpaymentauthorized = async (event: any) => {
      try {
        // Send token to our backend
        await processWallet(event.payment.token);
        session.completePayment(ApplePaySessionClass.STATUS_SUCCESS);
      } catch (err) {
        session.completePayment(ApplePaySessionClass.STATUS_FAILURE);
      }
    };

    session.begin();
  };

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
                      planName ?? "",
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
              ) : (
                <div className="w-full max-w-md mx-auto flex flex-col gap-4">
                  {/* Payment Method Selector */}
                  <div className="flex bg-slate-100 dark:bg-[#1a1a1a] p-1 rounded-xl mb-4 overflow-x-auto custom-scrollbar">
                    {paymentMethods.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setMethod("saved")}
                        className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                          method === "saved"
                            ? "bg-white dark:bg-black shadow-sm text-slate-900 dark:text-white"
                            : "text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                        }`}
                      >
                        Saved Card
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setMethod("card")}
                      className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                        method === "card"
                          ? "bg-white dark:bg-black shadow-sm text-slate-900 dark:text-white"
                          : "text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                      }`}
                    >
                      New Card
                    </button>
                    <button
                      type="button"
                      onClick={() => setMethod("apple")}
                      className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-1 ${
                        method === "apple"
                          ? "bg-white dark:bg-black shadow-sm text-slate-900 dark:text-white"
                          : "text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                      }`}
                    >
                      <Apple className="w-4 h-4" /> Pay
                    </button>
                    <button
                      type="button"
                      onClick={() => setMethod("google")}
                      className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                        method === "google"
                          ? "bg-white dark:bg-black shadow-sm text-slate-900 dark:text-white"
                          : "text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                      }`}
                    >
                      G Pay
                    </button>
                  </div>

                  {initError && (
                    <div className="text-red-600 dark:text-red-400 text-sm p-3 bg-red-100 dark:bg-red-400/10 border border-red-200 dark:border-red-400/20 rounded-lg">
                      {initError}
                    </div>
                  )}

                  {/* Saved Card View */}
                  {method === "saved" && paymentMethods.length > 0 && (
                    <div className="flex flex-col gap-4 py-4 w-full px-4">
                      <div className="space-y-3">
                        {paymentMethods.map((pm) => (
                          <div
                            key={pm.id}
                            onClick={() => setSelectedSavedCardId(pm.id)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all ${
                              selectedSavedCardId === pm.id
                                ? isLuxury
                                  ? "border-[#D4AF37] bg-[#D4AF37]/10"
                                  : "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10"
                                : "border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20"
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-6 bg-slate-200 dark:bg-white/10 rounded flex items-center justify-center text-xs font-bold">
                                  {pm.type || "Card"}
                                </div>
                                <span className="font-mono">**** {pm.last4 || pm.cardNumber?.slice(-4)}</span>
                              </div>
                              <span className="text-sm text-slate-500">{pm.expiry}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="w-full text-left mt-2">
                        <LegalCheckboxes
                          termsAccepted={termsAccepted}
                          setTermsAccepted={setTermsAccepted}
                          isSubscription={type === "SUBSCRIPTION"}
                        />
                      </div>

                      <button
                        disabled={!termsAccepted || isProcessingWallet}
                        onClick={handleChargeSavedCard}
                        className={`w-full py-3 px-4 font-semibold rounded-xl mt-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all ${
                          isLuxury
                            ? "bg-[#D4AF37] hover:bg-[#C5A028] text-black shadow-[0_4px_14px_rgba(212,175,55,0.4)]"
                            : "bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-gray-100"
                        }`}
                      >
                        {isProcessingWallet ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          t("payment.modal.payNow")
                        )}
                      </button>
                      <LegalDisclaimer isSubscription={type === "SUBSCRIPTION"} />
                    </div>
                  )}

                  {/* Card View */}
                  {method === "card" &&
                    (isInitializing || !clientSecret || !stripePromise ? (
                      <div className="flex flex-col items-center justify-center text-slate-400 py-10">
                        <Loader2 className="w-8 h-8 animate-spin mb-4" />
                      </div>
                    ) : (
                      <Elements
                        stripe={stripePromise}
                        options={{
                          clientSecret,
                          locale: stripeLocale,
                          appearance: { theme: isDark ? "night" : "stripe" },
                        }}
                      >
                        <ProviderCardForm
                          clientSecret={clientSecret}
                          onSuccess={handleSuccess}
                          termsAccepted={termsAccepted}
                          setTermsAccepted={setTermsAccepted}
                          isSubscription={type === "SUBSCRIPTION"}
                        />
                      </Elements>
                    ))}

                  {/* Google Pay View */}
                  {method === "google" && config && (
                    <div className="flex flex-col items-center justify-center py-6 w-full px-4">
                      <div className="w-full text-left mb-4">
                        <LegalCheckboxes
                          termsAccepted={termsAccepted}
                          setTermsAccepted={setTermsAccepted}
                          isSubscription={type === "SUBSCRIPTION"}
                        />
                      </div>
                      {isProcessingWallet ? (
                        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                      ) : (
                        <button
                          disabled={!termsAccepted}
                          onClick={handleCustomGooglePay}
                          className="bg-black text-white w-full h-[40px] rounded-md font-semibold flex items-center justify-center gap-2 hover:bg-black/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <GoogleGIcon className="w-5 h-5" /> Pay
                        </button>
                      )}
                      <div className="w-full text-left mt-2">
                        <LegalDisclaimer
                          isSubscription={type === "SUBSCRIPTION"}
                        />
                      </div>
                    </div>
                  )}

                  {/* Apple Pay View */}
                  {method === "apple" && (
                    <div className="flex flex-col items-center justify-center py-6 w-full px-4">
                      <div className="w-full text-left mb-4">
                        <LegalCheckboxes
                          termsAccepted={termsAccepted}
                          setTermsAccepted={setTermsAccepted}
                          isSubscription={type === "SUBSCRIPTION"}
                        />
                      </div>
                      {isProcessingWallet ? (
                        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                      ) : (
                        <button
                          disabled={!termsAccepted}
                          onClick={handleApplePay}
                          className="bg-black text-white w-full h-[40px] rounded-md font-semibold flex items-center justify-center gap-1 hover:bg-black/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Apple className="w-5 h-5 fill-white" /> Pay
                        </button>
                      )}
                      <div className="w-full text-left mt-2">
                        <LegalDisclaimer
                          isSubscription={type === "SUBSCRIPTION"}
                        />
                      </div>
                    </div>
                  )}

                  <div className="text-center text-xs text-slate-500 dark:text-gray-500 mt-2 flex items-center justify-center gap-1">
                    {t("payment.modal.securePayment")}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
