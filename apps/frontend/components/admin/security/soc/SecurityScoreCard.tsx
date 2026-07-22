import { BentoCard } from "../../BentoCard";
import { ShieldCheck, ShieldAlert, Shield } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export default function SecurityScoreCard({ score }: { score: any }) {
  const { t } = useTranslation();
  const overall = score.overall;

  const getStatusColor = (val: number) => {
    if (val >= 90) return "text-emerald-400";
    if (val >= 70) return "text-amber-400";
    return "text-rose-400";
  };

  const getStatusIcon = (val: number) => {
    if (val >= 90)
      return <ShieldCheck className="w-12 h-12 text-emerald-400 opacity-80" />;
    if (val >= 70)
      return <Shield className="w-12 h-12 text-amber-400 opacity-80" />;
    return (
      <ShieldAlert className="w-12 h-12 text-rose-400 animate-pulse opacity-80" />
    );
  };

  const categories = [
    { label: t("soc.score.network") || "Network", val: score.categories.network },
    { label: t("soc.score.auth") || "Auth", val: score.categories.auth },
    { label: t("soc.score.api") || "API", val: score.categories.api },
    { label: t("soc.score.server") || "Server", val: score.categories.server },
    { label: t("soc.score.headers") || "Headers", val: score.categories.headers },
    { label: t("soc.score.tls") || "TLS", val: score.categories.tls },
    { label: t("soc.score.deps") || "Deps", val: score.categories.dependencies },
    { label: t("soc.score.db") || "DB", val: score.categories.database },
  ];

  return (
    <BentoCard className="h-full flex flex-col justify-between" delay={0.1}>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-sm font-semibold tracking-wide text-white/50 uppercase">
            {t("soc.score.title") || "Overall Security Score"}
          </h3>
          <div
            className={`text-6xl font-black mt-2 tracking-tighter ${getStatusColor(overall)} drop-shadow-lg`}
          >
            {overall}
          </div>
        </div>
        {getStatusIcon(overall)}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3 mt-4">
        {categories.map((cat, i) => (
          <div
            key={i}
            className="flex flex-col gap-1 p-2 rounded-lg bg-white/5 border border-white/5"
          >
            <span className="text-[10px] text-white/40 uppercase font-bold">
              {cat.label}
            </span>
            <div className={`text-sm font-bold ${getStatusColor(cat.val)}`}>
              {cat.val}%
            </div>
          </div>
        ))}
      </div>
    </BentoCard>
  );
}
