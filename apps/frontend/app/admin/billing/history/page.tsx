"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "../../../../components/admin/PageHeader";
import { DataTable } from "../../../../components/admin/DataTable";
import { Badge } from "../../../../components/admin/Badge";
import { AnimatePresence } from "framer-motion";
import { BillingModal } from "../../../../components/admin/BillingModal";

function HistoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageParam = searchParams?.get("page");

  const [isRefundOpen, setRefundOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<any>(null);

  const [currentPage, setCurrentPage] = useState(
    pageParam ? parseInt(pageParam, 10) : 1,
  );
  const [pageSize, setPageSize] = useState(5);

  const baseTransactions = [
    {
      id: "pi_3Pqz",
      user: "alex@example.com",
      amount: "$29.00",
      date: "21 Jun 2026 14:22",
      plan: "Pro",
      status: "PAID",
    },
    {
      id: "pi_3Pqy",
      user: "maria@studio.io",
      amount: "$99.00",
      date: "21 Jun 2026 10:05",
      plan: "Business",
      status: "PAID",
    },
    {
      id: "pi_3Pqx",
      user: "john.doe@gmail.com",
      amount: "$9.00",
      date: "20 Jun 2026 18:45",
      plan: "Starter",
      status: "REFUNDED",
    },
    {
      id: "pi_3Pqw",
      user: "sam@creator.net",
      amount: "$29.00",
      date: "20 Jun 2026 09:12",
      plan: "Pro",
      status: "FAILED",
    },
    {
      id: "pi_3Pqv",
      user: "emma@design.co",
      amount: "$99.00",
      date: "19 Jun 2026 11:30",
      plan: "Business",
      status: "PAID",
    },
  ];

  const transactions = [
    ...baseTransactions,
    ...Array.from({ length: 20 }).map((_, i) => ({
      id: `pi_mock_${i}`,
      user: `user${i}@example.com`,
      amount: "$19.00",
      date: `${(i % 30) + 1} Jun 2026 12:00`,
      plan: "Starter",
      status: "PAID",
    })),
  ];

  useEffect(() => {
    if (!searchParams) return;
    const params = new URLSearchParams(searchParams.toString());
    if (currentPage > 1) {
      params.set("page", currentPage.toString());
    } else {
      params.delete("page");
    }
    const hash = window.location.hash;
    const newUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}${hash}`
      : `${window.location.pathname}${hash}`;
    router.replace(newUrl, { scroll: false });
  }, [currentPage, searchParams, router]);

  const handleRefund = (tx: any) => {
    setSelectedTx(tx);
    setRefundOpen(true);
  };

  const totalPages = Math.ceil(transactions.length / pageSize);
  const currentData = transactions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const getVisiblePages = () => {
    const delta = 1;
    const pages: number[] = [];
    const left = Math.max(1, currentPage - delta);
    const right = Math.min(totalPages, currentPage + delta);

    if (left > 1) pages.push(1);
    if (left > 2) pages.push(-1); // ellipsis

    for (let i = left; i <= right; i++) pages.push(i);

    if (right < totalPages - 1) pages.push(-2); // ellipsis
    if (right < totalPages) pages.push(totalPages);

    return pages;
  };
  const visiblePages = getVisiblePages();

  return (
    <>
      <PageHeader
        title="История платежей"
        description="Просмотр транзакций и управление возвратами средств."
      />

      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Поиск по email или ID..."
            className="bg-transparent border border-black/20 dark:border-white/20 rounded-lg pl-8 pr-4 py-2 text-sm w-full md:w-96 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
          />
          <span className="absolute left-2.5 top-2 text-slate-400">🔍</span>
        </div>
      </div>

      <div className="animate-in fade-in">
        <DataTable
          data={currentData}
          columns={[
            {
              key: "user",
              header: "Пользователь",
              render: (r) => (
                <span className="font-medium text-slate-900 dark:text-white">
                  {r.user}
                </span>
              ),
            },
            { key: "plan", header: "Тариф" },
            { key: "amount", header: "Сумма" },
            { key: "date", header: "Дата" },
            {
              key: "status",
              header: "Статус",
              render: (r) => {
                let v: "success" | "warning" | "error" | "default" = "default";
                if (r.status === "PAID") v = "success";
                if (r.status === "REFUNDED") v = "warning";
                if (r.status === "FAILED") v = "error";
                return <Badge variant={v}>{r.status}</Badge>;
              },
            },
            {
              key: "actions",
              header: "",
              render: (r) =>
                r.status === "PAID" ? (
                  <button
                    onClick={() => handleRefund(r)}
                    className="text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    Возврат
                  </button>
                ) : null,
            },
          ]}
        />
        {transactions.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between mt-4 px-6 gap-4 pb-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Строк на странице:
              </span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white dark:bg-[#0a0a0a] border border-black/10 dark:border-white/10 rounded-md text-sm px-2 py-1 outline-none focus:border-indigo-500 dark:text-white"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
              </select>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {`Страница ${currentPage} из ${totalPages || 1}`}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black/[0.03] dark:hover:bg-white/5 transition-colors text-sm dark:text-white"
                >
                  Назад
                </button>

                <div className="flex gap-1 flex-wrap justify-center">
                  {visiblePages.map((pageNum) => (
                    <button
                      key={pageNum < 0 ? `ellipsis-${pageNum}` : pageNum}
                      onClick={() => pageNum > 0 && setCurrentPage(pageNum)}
                      disabled={pageNum < 0}
                      className={`w-8 h-8 rounded-lg transition-colors flex items-center justify-center text-sm ${
                        currentPage === pageNum
                          ? "bg-indigo-600 text-white font-medium"
                          : pageNum < 0
                            ? "text-slate-400 cursor-default"
                            : "text-slate-600 dark:text-gray-300 hover:bg-black/[0.05] dark:hover:bg-white/10"
                      }`}
                    >
                      {pageNum < 0 ? "..." : pageNum}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black/[0.03] dark:hover:bg-white/5 transition-colors text-sm dark:text-white"
                >
                  Вперед
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isRefundOpen && selectedTx && (
          <BillingModal
            title="Подтверждение возврата"
            onClose={() => setRefundOpen(false)}
          >
            <div className="space-y-4 mt-4 text-left">
              <p className="text-sm text-slate-600 dark:text-gray-300">
                Вы уверены, что хотите оформить полный возврат средств для
                пользователя{" "}
                <span className="font-semibold">{selectedTx.user}</span> на
                сумму <span className="font-semibold">{selectedTx.amount}</span>
                ?
              </p>
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
                Внимание: Это действие необратимо и автоматически отменит
                подписку пользователя через Stripe.
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-black/10 dark:border-white/10 mt-6">
                <button
                  onClick={() => setRefundOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white"
                >
                  Отмена
                </button>
                <button
                  onClick={() => setRefundOpen(false)}
                  className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700"
                >
                  Оформить возврат
                </button>
              </div>
            </div>
          </BillingModal>
        )}
      </AnimatePresence>
    </>
  );
}

export default function HistoryPage() {
  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <HistoryContent />
    </Suspense>
  );
}
