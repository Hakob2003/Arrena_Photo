import { BentoCard } from "../../BentoCard";
import { BrainCircuit } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export default function AiSecurity({ data }: { data: any }) {
  const { t } = useTranslation();
  const items = [
    {
      label: t("soc.ai.promptInjections") || "Prompt Injections",
      value: data.promptInjection,
      alert: data.promptInjection > 0,
    },
    {
      label: t("soc.ai.unsafePrompts") || "Unsafe Prompts",
      value: data.unsafePrompt,
      alert: data.unsafePrompt > 10,
    },
    {
      label: t("soc.ai.nsfwAttempts") || "NSFW Attempts",
      value: data.nsfwAttempts,
      alert: data.nsfwAttempts > 5,
    },
    {
      label: t("soc.ai.jailbreakAttempts") || "Jailbreak Attempts",
      value: data.jailbreakAttempts,
      alert: data.jailbreakAttempts > 0,
    },
    {
      label: t("soc.ai.modelAbuse") || "Model Abuse",
      value: data.modelAbuse,
      alert: data.modelAbuse > 0,
    },
    {
      label: t("soc.ai.rateLimited") || "Rate Limited AI Requests",
      value: data.rateLimited,
      alert: false,
    },
    {
      label: t("soc.ai.imageSafetyBlocks") || "Image Safety Blocks",
      value: data.imageSafetyBlocks,
      alert: data.imageSafetyBlocks > 0,
    },
    {
      label: t("soc.ai.totalTokens") || "Total Tokens Processed",
      value: data.totalTokens.toLocaleString(),
      alert: false,
    },
  ];

  return (
    <BentoCard className="h-full flex flex-col" delay={0.4}>
      <div className="flex items-center gap-2 mb-6">
        <BrainCircuit className="w-5 h-5 text-purple-400" />
        <h3 className="text-sm font-semibold tracking-wide text-white uppercase">
          {t("soc.ai.title") || "AI Engine Security"}
        </h3>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-4">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex justify-between items-center py-2 border-b border-white/5 last:border-0"
          >
            <span className="text-[10px] sm:text-xs font-medium text-white/60 uppercase">
              {item.label}
            </span>
            <span
              className={`text-sm font-bold ${item.alert ? "text-amber-400" : "text-white"}`}
            >
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </BentoCard>
  );
}
