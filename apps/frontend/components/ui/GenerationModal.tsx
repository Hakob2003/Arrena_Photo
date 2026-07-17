"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AuthImage } from "@/components/ui/AuthImage";
import { Download, Share2, X } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "@/lib/i18n";
import { useUIStore } from "@/store";
import { downloadImage } from "@/lib/download";

interface GenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  generation: any;
}

export function GenerationModal({
  isOpen,
  onClose,
  generation,
}: GenerationModalProps) {
  const { t } = useTranslation();
  const [downloading, setDownloading] = useState(false);
  const preferences = useUIStore((state) => state.preferences);
  const isLuxury = preferences?.skin === "LUXURY";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !generation) return null;

  const getValidUrl = (url: string) => {
    if (!url) return "";
    if (
      url.startsWith("http") ||
      url.startsWith("data:") ||
      (url.startsWith("/") && url.length < 500)
    ) {
      return url;
    }
    return `data:image/png;base64,${url}`;
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setDownloading(true);
      await downloadImage(
        generation.imageUrl,
        `arrena-generation-${generation.id}.png`,
        generation.driveFileId,
      );
    } catch (err) {
      toast.error(t("myGen.downloadError") || "Failed to download image");
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = getValidUrl(generation.imageUrl);
    const shareText = t("myGen.shareText") || "Check out this generation from Arrena Photo!";

    if (navigator.share && navigator.canShare) {
      try {
        let filesArray: File[] = [];
        if (url.startsWith("data:")) {
          const response = await fetch(url);
          const blob = await response.blob();
          filesArray = [
            new File([blob], `generation-${generation.id}.png`, {
              type: "image/png",
            }),
          ];
        }

        if (
          filesArray.length > 0 &&
          navigator.canShare({ files: filesArray })
        ) {
          await navigator.share({
            title: t("myGen.shareTitle") || "Arrena Generation",
            text: shareText,
            files: filesArray,
          });
          return;
        } else {
          if (url.startsWith("http") && !url.includes("localhost")) {
            await navigator.share({
              title: t("myGen.shareTitle") || "Arrena Generation",
              text: shareText,
              url: url,
            });
            return;
          }
        }
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Error sharing:", err);
        }
        return;
      }
    }

    try {
      await navigator.clipboard.writeText(
        url.startsWith("http") ? url : window.location.href,
      );
      toast.success(t("myGen.linkCopied") || "Link copied to clipboard!");
    } catch (err) {
      toast.error(t("myGen.shareFailed") || "Failed to share");
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 p-4 sm:p-8 backdrop-blur-sm"
          onClick={onClose}
        >
          {/* Top Actions */}
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-3 z-[99999]">
            <button
              className="w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-md"
              onClick={handleDownload}
              disabled={downloading}
              title={t("myGen.downloadTooltip") || "Download"}
            >
              {downloading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Download size={22} />
              )}
            </button>

            <button
              className="w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-md"
              onClick={handleShare}
              title={t("myGen.shareTooltip") || "Share"}
            >
              <Share2 size={22} />
            </button>

            <button
              className="w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-md ml-2"
              onClick={onClose}
              title={t("myGen.closeTooltip") || "Close"}
            >
              <X size={24} />
            </button>
          </div>

          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="relative flex items-center justify-center w-full h-full max-w-[100vw] max-h-[100vh] pointer-events-none"
          >
            <div
              className="relative max-w-full max-h-full pointer-events-auto flex flex-col items-center justify-center gap-4"
              onClick={(e) => e.stopPropagation()}
            >
              <AuthImage
                driveFileId={
                  generation.driveFileId !== "saved"
                    ? generation.driveFileId
                    : undefined
                }
                fallbackUrl={generation.imageUrl}
                alt="Generated Fullscreen"
                className="max-w-[90vw] max-h-[85vh] object-contain rounded-xl shadow-2xl border border-white/10"
              />

              {/* Optional generation info at bottom */}
              <div className="flex flex-col items-center justify-center text-center">
                <p
                  className={`text-lg font-bold shadow-black drop-shadow-md ${isLuxury ? "text-[#D4AF37]" : "text-white"}`}
                >
                  {generation.model || (t("myGen.aiModel") || "AI Model")}
                </p>
                {generation.template && (
                  <p className="text-sm text-white/70 drop-shadow-md">
                    {t("myGen.template") || "Template"}: {generation.template}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
