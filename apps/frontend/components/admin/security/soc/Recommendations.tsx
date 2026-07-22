import { BentoCard } from "../../BentoCard";
import { Lightbulb, AlertTriangle, ShieldCheck } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export default function Recommendations({
  recommendations,
}: {
  recommendations: string[];
}) {
  const { t } = useTranslation();
  return (
    <BentoCard className="h-full" delay={0.3}>
      <div className="flex items-center gap-2 mb-6">
        <Lightbulb className="w-5 h-5 text-amber-400" />
        <h3 className="text-sm font-semibold tracking-wide text-white uppercase">
          {t("soc.recommendations.title") || "AI Recommendations"}
        </h3>
      </div>

      <div className="space-y-4">
        {recommendations.length === 0 ? (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-sm font-medium">
              {t("soc.recommendations.optimal") || "All systems optimal. No actions required."}
            </span>
          </div>
        ) : (
          recommendations.map((rec, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200"
            >
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p className="text-sm font-medium leading-relaxed">{rec}</p>
            </div>
          ))
        )}
      </div>
    </BentoCard>
  );
}
