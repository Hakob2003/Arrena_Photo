import React, { useState } from "react";
import { useTranslation } from "../../lib/i18n";
import { adminApi } from "../../lib/admin.api";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

interface AuditCheck {
  name: string;
  status: "SUCCESS" | "WARNING" | "ERROR";
  description: string;
  details?: Record<string, unknown> | null;
  durationMs: number;
  errorMessage?: string;
  timestamp: string;
}

interface AuditCategory {
  category: string;
  checks: AuditCheck[];
  total: number;
  passed: number;
  warnings: number;
  failed: number;
  durationMs: number;
}

interface AuditReport {
  timestamp: string;
  totalChecks: number;
  passed: number;
  warnings: number;
  failed: number;
  overallHealth: number;
  durationMs: number;
  categories: AuditCategory[];
}

interface SystemAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  loading: boolean;
  results: AuditReport | null;
  onRunAudit: () => void;
}

const CategoryAccordion = ({ category }: { category: AuditCategory }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-black/10 dark:border-white/10 rounded-lg bg-white dark:bg-slate-900 overflow-hidden mb-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-slate-900 dark:text-white">
            {category.category}
          </h3>
          <div className="flex gap-2 text-xs">
            {category.passed > 0 && (
              <span className="text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">
                {category.passed} OK
              </span>
            )}
            {category.warnings > 0 && (
              <span className="text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-full">
                {category.warnings} Warn
              </span>
            )}
            {category.failed > 0 && (
              <span className="text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full">
                {category.failed} Fail
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-slate-500">
          <span>{category.durationMs} ms</span>
          <span
            className={`transform transition-transform ${isOpen ? "rotate-180" : ""}`}
          >
            ▼
          </span>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-black/10 dark:border-white/10 bg-slate-50 dark:bg-slate-800/50"
          >
            <div className="p-4 space-y-3">
              {category.checks.map((check, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-md bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3">
                      <div className="mt-0.5">
                        {check.status === "SUCCESS" && (
                          <span className="text-green-500">✅</span>
                        )}
                        {check.status === "WARNING" && (
                          <span className="text-yellow-500">⚠️</span>
                        )}
                        {check.status === "ERROR" && (
                          <span className="text-red-500">❌</span>
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900 dark:text-white text-sm">
                          {check.name}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
                          {check.description}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">
                      {check.durationMs}ms
                    </span>
                  </div>

                  {(check.details || check.errorMessage) && (
                    <div className="ml-8 mt-2 p-2 bg-black/5 dark:bg-white/5 rounded text-xs font-mono overflow-x-auto text-slate-600 dark:text-gray-300">
                      {check.errorMessage && (
                        <div className="text-red-500 mb-1">
                          Error: {check.errorMessage}
                        </div>
                      )}
                      {check.details && (
                        <pre>{JSON.stringify(check.details, null, 2)}</pre>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export function SystemAuditModal({
  isOpen,
  onClose,
  loading,
  results,
  onRunAudit,
}: SystemAuditModalProps) {
  const { t } = useTranslation();
  const [downloading, setDownloading] = useState(false);
  const [cleanStatus, setCleanStatus] = useState<"idle" | "cleaning" | "done">(
    "idle",
  );

  if (!isOpen) return null;

  const handleDownloadJSON = () => {
    if (!results) return;
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(results, null, 2));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute(
      "download",
      `system-audit-${new Date().toISOString()}.json`,
    );
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleDownloadMarkdown = () => {
    if (!results) return;
    let md = `# System Audit Report\n\n`;
    md += `Date: ${new Date(results.timestamp).toLocaleString()}\n`;
    md += `Overall Health: ${results.overallHealth}%\n`;
    md += `Total Checks: ${results.totalChecks} (Passed: ${results.passed}, Warnings: ${results.warnings}, Failed: ${results.failed})\n`;
    md += `Total Duration: ${results.durationMs}ms\n\n`;

    results.categories.forEach((cat) => {
      md += `## ${cat.category}\n`;
      cat.checks.forEach((check) => {
        md += `### ${check.status === "SUCCESS" ? "✅" : check.status === "WARNING" ? "⚠️" : "❌"} ${check.name}\n`;
        md += `- **Status**: ${check.status}\n`;
        md += `- **Duration**: ${check.durationMs}ms\n`;
        md += `- **Description**: ${check.description}\n`;
        if (check.errorMessage) md += `- **Error**: ${check.errorMessage}\n`;
        if (check.details)
          md += `- **Details**: \n\`\`\`json\n${JSON.stringify(check.details, null, 2)}\n\`\`\`\n`;
        md += "\n";
      });
    });

    const dataStr =
      "data:text/markdown;charset=utf-8," + encodeURIComponent(md);
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute(
      "download",
      `system-audit-${new Date().toISOString()}.md`,
    );
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleCleanGarbage = async () => {
    try {
      setCleanStatus("cleaning");
      const res = await adminApi.cleanSystemAuditGarbage();
      setCleanStatus("done");
      toast.success(`Успешно! Удалено ${res.deletedCount} тестовых записей.`);
    } catch (error) {
      toast.error("Ошибка при удалении тестовых записей");
      setCleanStatus("idle");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl border border-black/10 dark:border-white/10">
        {/* Header */}
        <div className="p-6 border-b border-black/5 dark:border-white/5 flex items-center justify-between shrink-0 bg-slate-50 dark:bg-slate-800 rounded-t-xl">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Diagnostic System Audit
            </h2>
            <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">
              Production-grade diagnostics across all system layers.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {results && !loading && (
              <>
                <button
                  onClick={handleDownloadJSON}
                  className="text-xs px-3 py-1.5 border border-black/10 dark:border-white/10 rounded hover:bg-black/5 dark:hover:bg-white/5"
                >
                  ↓ JSON
                </button>
                <button
                  onClick={handleDownloadMarkdown}
                  className="text-xs px-3 py-1.5 border border-black/10 dark:border-white/10 rounded hover:bg-black/5 dark:hover:bg-white/5"
                >
                  ↓ Markdown
                </button>
                <button
                  onClick={handleCleanGarbage}
                  disabled={cleanStatus !== "idle"}
                  className={`text-xs px-3 py-1.5 border rounded transition-colors ${
                    cleanStatus === "done"
                      ? "border-green-500/50 text-green-600 bg-green-50"
                      : "border-red-500/20 text-red-500 hover:bg-red-500/10"
                  }`}
                >
                  {cleanStatus === "cleaning"
                    ? "Cleaning..."
                    : cleanStatus === "done"
                      ? "Cleaned!"
                      : "Clean Test Data"}
                </button>
                <button
                  onClick={onRunAudit}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm ml-2"
                >
                  Rerun Audit
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50 dark:bg-slate-900/50">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-slate-900 dark:text-white font-medium">
                Running Diagnostics...
              </p>
              <p className="mt-2 text-sm text-slate-500 dark:text-gray-400">
                Testing DB, Redis, AI Providers, and Features. This may take up
                to 20 seconds.
              </p>
            </div>
          ) : results ? (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Stats Panel */}
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div className="col-span-2 md:col-span-2 bg-white dark:bg-slate-800 p-4 rounded-xl border border-black/10 dark:border-white/10 flex flex-col justify-center items-center">
                  <div className="text-sm text-slate-500 dark:text-gray-400 mb-1">
                    Health Score
                  </div>
                  <div
                    className={`text-4xl font-bold ${results.overallHealth === 100 ? "text-green-500" : results.overallHealth > 70 ? "text-yellow-500" : "text-red-500"}`}
                  >
                    {results.overallHealth}%
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-black/10 dark:border-white/10 text-center">
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    {results.totalChecks}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Checks</div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-black/10 dark:border-white/10 text-center">
                  <div className="text-2xl font-bold text-green-500">
                    {results.passed}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Passed</div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-black/10 dark:border-white/10 text-center">
                  <div className="text-2xl font-bold text-yellow-500">
                    {results.warnings}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Warnings</div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-black/10 dark:border-white/10 text-center">
                  <div className="text-2xl font-bold text-red-500">
                    {results.failed}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Failed</div>
                </div>
              </div>

              <div className="text-xs text-slate-400 text-center mb-8">
                Audit completed in {results.durationMs}ms at{" "}
                {new Date(results.timestamp).toLocaleTimeString()}
              </div>

              <div className="space-y-4">
                {results.categories.map((cat, idx) => (
                  <CategoryAccordion key={idx} category={cat} />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-slate-500 dark:text-gray-400 mb-6 text-center max-w-md">
                Production-grade diagnostics checking Database, Environment, AI
                APIs, Payments, and E2E feature paths.
              </p>
              <button
                onClick={onRunAudit}
                className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-lg shadow-indigo-500/20 text-lg"
              >
                Start System Audit
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
