import { BentoCard } from "../../BentoCard";
import { GlobeLock } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export default function Reputation({ data }: { data: any }) {
  const { t } = useTranslation();
  const items = [
    {
      label: t("soc.reputation.maliciousIp") || "Known Malicious IP",
      value: data.knownMaliciousIp,
      alert: data.knownMaliciousIp > 0,
    },
    {
      label: t("soc.reputation.torNodes") || "TOR Exit Nodes",
      value: data.torExitNodes,
      alert: data.torExitNodes > 0,
    },
    { label: t("soc.reputation.vpn") || "VPN / Proxies", value: data.vpn, alert: false },
    { label: t("soc.reputation.datacenterIp") || "Datacenter IPs", value: data.datacenterIp, alert: false },
    { label: t("soc.reputation.residentialIp") || "Residential IPs", value: data.residentialIp, alert: false },
    { label: t("soc.reputation.asnBlocks") || "ASN Blocks", value: data.asnBlocks, alert: data.asnBlocks > 0 },
  ];

  return (
    <BentoCard className="h-full flex flex-col" delay={0.4}>
      <div className="flex items-center gap-2 mb-6">
        <GlobeLock className="w-5 h-5 text-indigo-400" />
        <h3 className="text-sm font-semibold tracking-wide text-white uppercase">
          {t("soc.reputation.title") || "IP Reputation"}
        </h3>
      </div>

      <div className="flex-1 flex flex-col gap-3">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex justify-between items-center py-2 border-b border-white/5 last:border-0"
          >
            <span className="text-xs font-medium text-white/60 uppercase">
              {item.label}
            </span>
            <span
              className={`text-sm font-bold ${item.alert ? "text-rose-400" : "text-white"}`}
            >
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </BentoCard>
  );
}
