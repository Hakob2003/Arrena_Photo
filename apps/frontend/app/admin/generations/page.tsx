"use client";
import React, { useEffect, useState } from "react";
import { useTranslation } from "../../../lib/i18n";
import { PageHeader } from "../../../components/admin/PageHeader";
import { DataTable } from "../../../components/admin/DataTable";
import { Badge } from "../../../components/admin/Badge";
import { adminApi } from "../../../lib/admin.api";
import { BentoCard } from "../../../components/admin/BentoCard";

export default function AdminGenerations() {
  const { t } = useTranslation();
  const [generations, setGenerations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .getGenerations(1, 50)
      .then((data) => {
        const formatted = data.generations.map((g: any) => ({
          id: g.id.substring(0, 8) + "...",
          user: g.user?.email || t("admin.generations.unknown"),
          model: g.aiModel?.name || t("admin.generations.unknown"),
          duration: g.durationMs ? `${(g.durationMs / 1000).toFixed(1)}s` : "-",
          status: g.status,
        }));
        setGenerations(formatted);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  return (
    <>
      <PageHeader
        title={t("admin.generations.title")}
        description={t("admin.generations.subtitle")}
      />

      {loading ? (
        <div className="text-slate-500 dark:text-gray-400 p-8 text-center">
          {t("admin.generations.loadingLogs")}
        </div>
      ) : (
        <BentoCard
          colSpan={0}
          rowSpan={0}
          delay={0.1}
          noPadding
          className="w-full overflow-hidden min-h-[400px]"
        >
          <div className="w-full max-w-full overflow-x-auto">
            <DataTable
              data={generations}
              columns={[
                {
                  key: "id",
                  header: t("admin.generations.jobId"),
                  render: (r: any) => (
                    <span className="font-mono text-slate-400 dark:text-gray-500 text-xs">
                      {r.id}
                    </span>
                  ),
                },
                { key: "user", header: t("admin.generations.user") },
                {
                  key: "model",
                  header: t("admin.generations.model"),
                  render: (r: any) => <Badge variant="info">{r.model}</Badge>,
                },
                { key: "duration", header: t("admin.generations.duration") },
                {
                  key: "status",
                  header: t("admin.generations.status"),
                  render: (r: any) => {
                    const v =
                      r.status === "DONE"
                        ? "success"
                        : r.status === "FAILED"
                          ? "error"
                          : "warning";
                    return <Badge variant={v}>{r.status}</Badge>;
                  },
                },
              ]}
            />
          </div>
        </BentoCard>
      )}
    </>
  );
}

