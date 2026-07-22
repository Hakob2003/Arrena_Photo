"use client";

import React, { useState } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface SetupCardFormProps {
  onSuccess: (setupIntentId: string, limit: number) => void;
  onCancel: () => void;
  isLuxury?: boolean;
}

export function SetupCardForm({ onSuccess, onCancel, isLuxury }: SetupCardFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [limit, setLimit] = useState<number>(100);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error, setupIntent } = await stripe.confirmSetup({
      elements,
      redirect: 'if_required',
      confirmParams: {
        return_url: window.location.href,
      },
    });

    if (error) {
      toast.error(error.message || "Failed to set up card");
      setIsProcessing(false);
    } else if (setupIntent && setupIntent.status === 'succeeded') {
      onSuccess(setupIntent.id, limit);
    } else {
      toast.error("Unexpected status: " + setupIntent?.status);
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">
          Max Limit (USD)
        </label>
        <input
          required
          type="number"
          min="0"
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
          placeholder="100"
          className={`w-full bg-slate-50 dark:bg-black/5 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none ${isLuxury ? "focus:border-[#D4AF37]" : "focus:border-indigo-500"}`}
        />
        <p className="text-xs text-slate-500 mt-1">Set a maximum spend limit for this card.</p>
      </div>

      <PaymentElement />
      
      <div className="flex gap-3 mt-6">
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 ${
            isLuxury
              ? "bg-[#D4AF37] hover:bg-[#C5A028] text-black"
              : "bg-indigo-600 hover:bg-indigo-700 text-white"
          }`}
        >
          {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Card"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isProcessing}
          className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/5 text-slate-900 dark:text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
