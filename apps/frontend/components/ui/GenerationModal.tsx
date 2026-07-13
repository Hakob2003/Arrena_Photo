"use client";

import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AuthImage } from "@/components/ui/AuthImage";
import { Download, Share2 } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "@/lib/i18n";
import { useUIStore } from "@/store";

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

  if (!generation) return null;

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

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const url = getValidUrl(generation.imageUrl);

      let blob;
      if (url.startsWith("http")) {
        const response = await fetch(url);
        blob = await response.blob();
      } else {
        // Fallback for data URI or local path
        const response = await fetch(url);
        blob = await response.blob();
      }

      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `arrena-generation-${generation.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
    } catch (e) {
      toast.error(t("myGen.downloadError") || "Failed to download image");
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    const url = getValidUrl(generation.imageUrl);
    const shareText = "Check out this generation from Arrena Photo!";

    // Some browsers support sharing images using files
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
            title: "Arrena Generation",
            text: shareText,
            files: filesArray,
          });
          return;
        } else {
          // Just share the URL if it's public
          if (url.startsWith("http") && !url.includes("localhost")) {
            await navigator.share({
              title: "Arrena Generation",
              text: shareText,
              url: url,
            });
            return;
          }
        }
      } catch (e: any) {
        if (e.name !== "AbortError") {
          console.error("Error sharing:", e);
        }
        return; // User cancelled or handled error
      }
    }

    // Fallback
    try {
      await navigator.clipboard.writeText(
        url.startsWith("http") ? url : window.location.href,
      );
      toast.success(t("myGen.linkCopied") || "Link copied to clipboard!");
    } catch (err) {
      toast.error("Failed to share");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="!max-w-none w-screen h-[100dvh] m-0 p-4 sm:p-6 bg-black/20 dark:bg-black/60 backdrop-blur-xl border-none flex flex-col items-center justify-center rounded-none shadow-none"
        showCloseButton={false}
        onClick={() => onClose()}
      >
        <div
          className="flex flex-col gap-4 sm:gap-6 flex-1 min-h-0 w-full items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative w-full max-w-[95vw] sm:max-w-[90vw] flex-1 flex items-center justify-center min-h-0">
            <AuthImage
              driveFileId={
                generation.driveFileId !== "saved"
                  ? generation.driveFileId
                  : undefined
              }
              fallbackUrl={generation.imageUrl}
              alt="Generated"
              className="max-w-full max-h-full object-contain rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.5)]"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0 w-full max-w-[95vw] sm:max-w-4xl bg-white/80 dark:bg-black/50 backdrop-blur-md p-4 rounded-2xl border border-white/20 dark:border-white/10 shadow-xl">
            <div className="flex flex-col w-full sm:w-auto text-center sm:text-left">
              <p
                className={`text-xl font-bold ${isLuxury ? "text-[#D4AF37]" : "text-indigo-600 dark:text-indigo-400"}`}
              >
                {generation.model || "AI Model"}
              </p>
              {generation.template && (
                <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">
                  {t("myGen.template") || "Template"}: {generation.template}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 w-full sm:w-auto">
              <button
                onClick={handleDownload}
                disabled={downloading}
                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-md ${
                  isLuxury
                    ? "bg-[#D4AF37] hover:bg-[#C5A028] text-black shadow-none"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-[0_4px_12px_rgba(99,102,241,0.25)] dark:shadow-none"
                }`}
                title="Download"
              >
                {downloading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    <span>Скачать</span>
                  </>
                )}
              </button>

              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all bg-gray-200 hover:bg-gray-300 dark:bg-white/10 dark:hover:bg-white/20 text-gray-900 dark:text-white"
                title="Share"
              >
                <Share2 className="w-5 h-5" />
                <span>Поделиться</span>
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
