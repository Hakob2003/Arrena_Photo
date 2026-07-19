"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

import { useAuthStore } from "../../../store";
import { api } from "../../../lib/api";
import { useTranslation } from "../../../lib/i18n";
import { useUIStore } from "../../../store";

export function PaymentTab() {
  const {
    paymentMethods,
    setPaymentMethods,
    setDefaultPaymentMethod,
    fetchPaymentMethods,
  } = useAuthStore();
  const { t } = useTranslation();
  const isLuxury = useUIStore((state) => state.preferences?.skin === "LUXURY");

  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);

  const [newCard, setNewCard] = useState({
    number: "",
    expiry: "",
    cvv: "",
    limit: 100,
    balance: 250,
  });
  const [editingCard, setEditingCard] = useState<any>(null);

  useEffect(() => {
    fetchPaymentMethods().then(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear() % 100;

    paymentMethods.forEach((pm) => {
      if (!pm.expiry) return;
      const [mStr, yStr] = pm.expiry.split("/");
      if (!mStr || !yStr) return;
      const m = parseInt(mStr, 10);
      const y = parseInt(yStr, 10);

      if (y < currentYear || (y === currentYear && m < currentMonth)) {
        toast.error(
          `Warning: Card (**** ${pm.cardNumber?.slice(-4) || pm.last4}) expired!`,
          {
            duration: 5000,
            id: `expired-${pm.id}`,
            icon: "!",
          },
        );
      }
    });
  }, [paymentMethods]);

  const isCardExpired = (expiry: string) => {
    const [m, y] = expiry.split("/").map(Number);
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear() % 100;
    return y < currentYear || (y === currentYear && m < currentMonth);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    val = val.substring(0, 16);
    const formatted = val.match(/.{1,4}/g)?.join(" ") || val;
    setNewCard({ ...newCard, number: formatted });
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 4) val = val.substring(0, 4);
    if (val.length >= 3) {
      val = val.substring(0, 2) + "/" + val.substring(2);
    }
    setNewCard({ ...newCard, expiry: val });
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    val = val.substring(0, 4);
    setNewCard({ ...newCard, cvv: val });
  };

  const handleAddCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const numClean = newCard.number.replace(/\s/g, "");
    if (numClean.length !== 16) {
      toast.error("Card number must be 16 digits.");
      return;
    }

    if (newCard.cvv.length < 3) {
      toast.error("CVV must be 3 or 4 digits.");
      return;
    }

    if (newCard.expiry.length !== 5) {
      toast.error("Enter expiry in MM/YY format.");
      return;
    }

    const [month, year] = newCard.expiry.split("/");
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear() % 100;

    if (monthNum < 1 || monthNum > 12) {
      toast.error("Invalid month.");
      return;
    }

    if (
      yearNum < currentYear ||
      (yearNum === currentYear && monthNum < currentMonth)
    ) {
      toast.error("Card is expired.");
      return;
    }

    try {
      await api.post("/billing/payment-methods", {
        cardNumber: newCard.number,
        expiry: newCard.expiry,
        cvv: newCard.cvv,
        cardholderName: "User",
        limit: Number(newCard.limit),
        balance: Number(newCard.balance),
      });
      await fetchPaymentMethods();
      setAddModalOpen(false);
      setNewCard({ number: "", expiry: "", cvv: "", limit: 100, balance: 250 });
      toast.success("Card added successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error adding card");
    }
  };

  const handleEditLimitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCard) return;
    try {
      await api.put(`/billing/payment-methods/${editingCard.id}/limit`, {
        limit: Number(editingCard.limit),
      });
      setPaymentMethods(
        paymentMethods.map((pm) =>
          pm.id === editingCard.id
            ? { ...pm, limit: Number(editingCard.limit) }
            : pm,
        ),
      );
      toast.success("Limit updated successfully");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error updating limit");
    } finally {
      setEditModalOpen(false);
      setEditingCard(null);
    }
  };

  const handleRemoveCard = async (id: string) => {
    try {
      await api.delete(`/billing/payment-methods/${id}`);
      await fetchPaymentMethods();
      toast.success("Card removed");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error removing card");
    }
  };

  const transactions = [
    {
      id: "#INV-001",
      date: "21 Jun 2026",
      amount: "$29.00",
      method: "Visa вЂўвЂўвЂўвЂў 4242",
      status: "Success",
      plan: "Pro Creator",
    },
    {
      id: "#INV-002",
      date: "21 May 2026",
      amount: "$29.00",
      method: "Visa вЂўвЂўвЂўвЂў 4242",
      status: "Success",
      plan: "Pro Creator",
    },
    {
      id: "#INV-003",
      date: "15 May 2026",
      amount: "$15.00",
      method: "Mastercard вЂўвЂўвЂўвЂў 5555",
      status: "Success",
      plan: "Credits (1000)",
    },
    {
      id: "#INV-004",
      date: "21 Apr 2026",
      amount: "$29.00",
      method: "Visa вЂўвЂўвЂўвЂў 4242",
      status: "Failed",
      plan: "Pro Creator",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Block 7: РЎРїРѕСЃРѕР±С‹ РѕРїР»Р°С‚С‹ */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {t("billing.payment.title")}
          </h2>
          <button
            onClick={() => setAddModalOpen(true)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              isLuxury
                ? "bg-[#D4AF37] hover:bg-[#C5A028] text-black"
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
            }`}
          >
            {t("billing.payment.addCard")}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {paymentMethods.map((pm) => (
            <div
              key={pm.id}
              className="p-4 sm:p-5 border border-black/10 dark:border-white/10 bg-slate-50 dark:bg-white/5 rounded-2xl flex flex-col justify-between min-h-[140px] relative"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-2 items-center flex-wrap pr-2">
                  <div className="w-10 h-6 bg-slate-200 dark:bg-white/10 rounded-md flex items-center justify-center text-xs font-bold text-slate-700 dark:text-white shrink-0">
                    {pm.type ||
                      (pm.cardNumber?.startsWith("4") ? "Visa" : "Mastercard")}
                  </div>
                  {pm.isDefault ? (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${isLuxury ? "bg-[#D4AF37]/10 text-[#D4AF37]" : "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400"}`}
                    >
                      {t("billing.payment.defaultCard")}
                    </span>
                  ) : (
                    <button
                      onClick={async () => {
                        const res = await setDefaultPaymentMethod(pm.id);
                        if (res.success) toast.success("Default card changed!");
                        else toast.error(res.error || "Error");
                      }}
                      className="text-[10px] bg-slate-200 text-slate-700 dark:bg-white/10 dark:text-white px-2 py-0.5 rounded-full font-medium hover:bg-slate-300 dark:hover:bg-white/5 transition-colors shrink-0"
                    >
                      {t("billing.payment.makeDefault")}
                    </button>
                  )}
                  {isCardExpired(pm.expiry) && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${isLuxury ? "bg-[#D4AF37]/10 text-[#D4AF37]" : "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"}`}
                    >
                      {t("billing.payment.expired")}
                    </span>
                  )}
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${isLuxury ? "bg-[#D4AF37]/10 text-[#D4AF37]" : "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400"}`}
                  >
                    {t("billing.payment.limit")}: ${pm.limit}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${isLuxury ? "bg-[#D4AF37]/10 text-[#D4AF37]" : "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400"}`}
                  >
                    {t("billing.payment.balance")}: ${pm.balance}
                  </span>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setEditingCard(pm);
                      setEditModalOpen(true);
                    }}
                    className={`text-slate-400 transition-colors ${isLuxury ? "hover:text-[#D4AF37]" : "hover:text-indigo-500"}`}
                    title="Change limit"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                  </button>
                  {!pm.isDefault && (
                    <button
                      onClick={() => handleRemoveCard(pm.id)}
                      className="text-slate-400 hover:text-red-500 transition-colors"
                      title="Delete card"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-end mt-auto">
                <div>
                  <p className="text-xl font-mono text-slate-900 dark:text-white tracking-widest mt-1">
                    **** **** ****{" "}
                    {pm.last4 || pm.cardNumber?.slice(-4) || "0000"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 dark:text-gray-400 mb-0.5">
                    Expires
                  </p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {pm.expiry}
                  </p>
                </div>
              </div>
            </div>
          ))}

          <div
            onClick={() => setAddModalOpen(true)}
            className={`p-5 border-2 border-dashed border-black/10 dark:border-white/10 bg-transparent rounded-2xl flex items-center justify-center min-h-[140px] cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-all group ${
              isLuxury
                ? "hover:border-[#D4AF37]/50"
                : "hover:border-indigo-500/50"
            }`}
          >
            <div className="text-center">
              <p
                className={`text-sm font-medium text-slate-500 dark:text-gray-400 ${isLuxury ? "group-hover:text-[#D4AF37]" : "group-hover:text-indigo-500"}`}
              >
                {t("billing.payment.addCard")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Block 4: РСЃС‚РѕСЂРёСЏ РїР»Р°С‚РµР¶РµР№ */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
          {t("billing.payment.billingHistory")}
        </h2>

        <div className="overflow-x-auto rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a]">
          <table className="w-full text-sm text-left text-slate-600 dark:text-gray-300">
            <thead className="text-xs uppercase bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-gray-400 border-b border-black/10 dark:border-white/10">
              <tr>
                <th className="px-6 py-4 font-semibold">ID</th>
                <th className="px-6 py-4 font-semibold">
                  {t("billing.payment.date")}
                </th>
                <th className="px-6 py-4 font-semibold">Plan / Product</th>
                <th className="px-6 py-4 font-semibold">
                  {t("billing.payment.amount")}
                </th>
                <th className="px-6 py-4 font-semibold">Method</th>
                <th className="px-6 py-4 font-semibold">
                  {t("billing.payment.status")}
                </th>
                <th className="px-6 py-4 font-semibold text-right">
                  {t("billing.payment.invoice")}
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx, idx) => (
                <tr
                  key={idx}
                  className="border-b border-black/5 dark:border-white/5 last:border-0 hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                    {tx.id}
                  </td>
                  <td className="px-6 py-4">{tx.date}</td>
                  <td className="px-6 py-4">{tx.plan}</td>
                  <td className="px-6 py-4 font-medium">{tx.amount}</td>
                  <td className="px-6 py-4">{tx.method}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        tx.status === "Success"
                          ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400"
                          : "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"
                      }`}
                    >
                      {tx.status === "Success"
                        ? t("billing.payment.statusSuccess")
                        : t("billing.payment.statusFailed")}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      className={`flex items-center justify-end gap-1 ml-auto ${
                        isLuxury
                          ? "text-[#D4AF37] hover:text-[#C5A028]"
                          : "text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                      }`}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Card Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/5 backdrop-blur-none"
              onClick={() => setAddModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-6 w-full max-w-md relative z-10 border border-black/10 dark:border-white/10"
            >
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                {t("billing.payment.addCardTitle")}
              </h2>
              <form
                onSubmit={handleAddCardSubmit}
                className="flex flex-col gap-4"
              >
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">
                    {t("billing.payment.cardNumber")}
                  </label>
                  <input
                    required
                    type="text"
                    value={newCard.number}
                    onChange={handleNumberChange}
                    placeholder="0000 0000 0000 0000"
                    className={`w-full bg-slate-50 dark:bg-black/5 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none ${isLuxury ? "focus:border-[#D4AF37]" : "focus:border-indigo-500"}`}
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">
                      {t("billing.payment.expiryDate")}
                    </label>
                    <input
                      required
                      type="text"
                      value={newCard.expiry}
                      onChange={handleExpiryChange}
                      placeholder="MM/YY"
                      className={`w-full bg-slate-50 dark:bg-black/5 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none ${isLuxury ? "focus:border-[#D4AF37]" : "focus:border-indigo-500"}`}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">
                      {t("billing.payment.cvv")}
                    </label>
                    <input
                      required
                      type="text"
                      value={newCard.cvv}
                      onChange={handleCvvChange}
                      placeholder="123"
                      className={`w-full bg-slate-50 dark:bg-black/5 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none ${isLuxury ? "focus:border-[#D4AF37]" : "focus:border-indigo-500"}`}
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">
                      {t("billing.payment.maxLimit")}
                    </label>
                    <input
                      required
                      type="number"
                      min="0"
                      value={newCard.limit}
                      onChange={(e) =>
                        setNewCard({
                          ...newCard,
                          limit: Number(e.target.value),
                        })
                      }
                      placeholder="100"
                      className={`w-full bg-slate-50 dark:bg-black/5 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none ${isLuxury ? "focus:border-[#D4AF37]" : "focus:border-indigo-500"}`}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">
                      {t("billing.payment.cardBalance")}
                    </label>
                    <input
                      required
                      type="number"
                      min="0"
                      value={newCard.balance}
                      onChange={(e) =>
                        setNewCard({
                          ...newCard,
                          balance: Number(e.target.value),
                        })
                      }
                      placeholder="250"
                      className={`w-full bg-slate-50 dark:bg-black/5 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none ${isLuxury ? "focus:border-[#D4AF37]" : "focus:border-indigo-500"}`}
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    type="submit"
                    className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isLuxury
                        ? "bg-[#D4AF37] hover:bg-[#C5A028] text-black"
                        : "bg-indigo-600 hover:bg-indigo-700 text-white"
                    }`}
                  >
                    {t("billing.payment.save")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddModalOpen(false)}
                    className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/5 text-slate-900 dark:text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    {t("ui.confirmDelete.cancel")}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Limit Modal */}
      <AnimatePresence>
        {isEditModalOpen && editingCard && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/5 backdrop-blur-none"
              onClick={() => setEditModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-6 w-full max-w-md relative z-10 border border-black/10 dark:border-white/10"
            >
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                {t("billing.payment.editMaxLimit")}
              </h2>
              <form
                onSubmit={handleEditLimitSubmit}
                className="flex flex-col gap-4"
              >
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">
                    {t("billing.payment.maxLimit")}
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={editingCard.limit}
                    onChange={(e) =>
                      setEditingCard({
                        ...editingCard,
                        limit: Number(e.target.value),
                      })
                    }
                    placeholder="100"
                    className={`w-full bg-slate-50 dark:bg-black/5 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none ${isLuxury ? "focus:border-[#D4AF37]" : "focus:border-indigo-500"}`}
                  />
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    type="submit"
                    className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isLuxury
                        ? "bg-[#D4AF37] hover:bg-[#C5A028] text-black"
                        : "bg-indigo-600 hover:bg-indigo-700 text-white"
                    }`}
                  >
                    {t("billing.payment.saveLimit")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditModalOpen(false)}
                    className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/5 text-slate-900 dark:text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    {t("ui.confirmDelete.cancel")}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
