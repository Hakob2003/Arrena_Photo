"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { X, CheckCircle, Loader2 } from "lucide-react";
import { api } from "../../lib/api";
import { useAuthStore, useUIStore } from "../../store";

// Use test publishable key if env is missing (for local dev without keys)
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_mock"
);

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "CREDITS" | "SUBSCRIPTION";
  planName?: string; // e.g. "PRO"
}

const CREDIT_PACKAGES = [
  { id: "pack_100", label: "100 Credits", amountUsd: 4.99, credits: 100 },
  { id: "pack_500", label: "500 Credits", amountUsd: 19.99, credits: 500, popular: true },
  { id: "pack_1000", label: "1000 Credits", amountUsd: 34.99, credits: 1000 },
];

function CheckoutForm({ clientSecret, onSuccess }: { clientSecret: string; onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsLoading(true);
    setError(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message || "An error occurred.");
      setIsLoading(false);
      return;
    }

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: window.location.href, // If redirect is forced by payment method
      },
      redirect: "if_required", // Prefer staying on the same page for modal experience!
    });

    if (confirmError) {
      setError(confirmError.message || "Payment failed.");
      setIsLoading(false);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
      <PaymentElement />
      {error && <div className="text-red-400 text-sm p-2 bg-red-400/10 rounded-lg">{error}</div>}
      <button
        disabled={isLoading || !stripe || !elements}
        type="submit"
        className="w-full py-3 px-4 bg-white text-black font-semibold rounded-xl mt-4 hover:bg-gray-100 disabled:opacity-50 flex items-center justify-center transition-all"
      >
        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Pay Now"}
      </button>
      <div className="text-center text-xs text-gray-500 mt-2 flex items-center justify-center gap-1">
        Secure payment powered by <b>Stripe</b>
      </div>
    </form>
  );
}

export function PaymentModal({ isOpen, onClose, type, planName }: PaymentModalProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [selectedPack, setSelectedPack] = useState(CREDIT_PACKAGES[1]);
  const [isInitializing, setIsInitializing] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Initialize Payment Intent
  useEffect(() => {
    if (!isOpen) {
      setClientSecret(null);
      setIsSuccess(false);
      return;
    }

    const initPayment = async () => {
      setIsInitializing(true);
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
        console.error("Failed to initialize payment", err);
        setInitError(err.response?.data?.message || err.message || "Failed to initialize payment");
      } finally {
        setIsInitializing(false);
      }
    };

    initPayment();
  }, [isOpen, type, planName, selectedPack]);

  const handleSuccess = () => {
    setIsSuccess(true);
    // Reload page to refresh credits/plan from server
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xl p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl bg-zinc-900/90 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-2xl"
          >
            {/* Left Side: Summary / Package Selection */}
            <div className="w-full md:w-1/3 bg-zinc-950/50 p-8 flex flex-col border-r border-white/5">
              <h2 className="text-2xl font-bold text-white mb-2">
                {type === "CREDITS" ? "Buy Credits" : "Upgrade Plan"}
              </h2>
              <p className="text-zinc-400 text-sm mb-6">
                {type === "CREDITS"
                  ? "Select a credit package to continue your generations."
                  : `You are upgrading to the ${planName} plan.`}
              </p>

              {type === "CREDITS" && (
                <div className="flex flex-col gap-3">
                  {CREDIT_PACKAGES.map((pack) => (
                    <button
                      key={pack.id}
                      onClick={() => setSelectedPack(pack)}
                      className={`relative p-4 rounded-2xl border text-left transition-all ${
                        selectedPack.id === pack.id
                          ? "border-blue-500 bg-blue-500/10"
                          : "border-white/10 hover:border-white/20 bg-white/5"
                      }`}
                    >
                      {pack.popular && (
                        <div className="absolute -top-3 right-4 bg-blue-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                          Popular
                        </div>
                      )}
                      <div className="font-semibold text-white">{pack.label}</div>
                      <div className="text-sm text-zinc-400">${pack.amountUsd}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Side: Payment Elements */}
            <div className="w-full md:w-2/3 p-8 relative flex flex-col justify-center min-h-[400px]">
              <button
                onClick={onClose}
                className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              {isSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center text-center text-white"
                >
                  <CheckCircle className="w-20 h-20 text-green-500 mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Payment Successful!</h3>
                  <p className="text-zinc-400">
                    Your {type === "CREDITS" ? "credits have been added" : "subscription is active"}.
                  </p>
                </motion.div>
              ) : initError ? (
                <div className="flex flex-col items-center justify-center text-red-400 h-full text-center px-4">
                  <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
                    <X className="w-6 h-6" />
                  </div>
                  <p className="font-bold mb-2">Initialization Failed</p>
                  <p className="text-sm text-red-400/80">{initError}</p>
                  <p className="text-xs text-white/40 mt-6">Please ensure STRIPE_SECRET_KEY and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY are configured in your .env files.</p>
                </div>
              ) : isInitializing || !clientSecret ? (
                <div className="flex flex-col items-center justify-center text-white/50 h-full">
                  <Loader2 className="w-8 h-8 animate-spin mb-4" />
                  <p>Initializing secure checkout...</p>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-full max-w-md mx-auto"
                >
                  {/* Stripe Payment Element supports Card, Apple Pay, Google Pay automatically */}
                  <Elements
                    stripe={stripePromise}
                    options={{
                      clientSecret,
                      appearance: {
                        theme: "night",
                        variables: {
                          colorPrimary: "#3b82f6",
                          colorBackground: "#18181b", // zinc-900
                          colorText: "#ffffff",
                          colorDanger: "#ef4444",
                          fontFamily: "Inter, system-ui, sans-serif",
                          borderRadius: "12px",
                        },
                      },
                    }}
                  >
                    <CheckoutForm clientSecret={clientSecret} onSuccess={handleSuccess} />
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

