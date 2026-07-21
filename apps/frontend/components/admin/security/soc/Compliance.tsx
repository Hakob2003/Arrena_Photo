import { BentoCard } from "../../BentoCard";
import { ClipboardCheck } from "lucide-react";

export default function Compliance({ data }: { data: any }) {
  const items = [
    {
      label: "OWASP Top 10",
      value: data.owaspTop10,
      status: data.owaspTop10 === "Compliant",
    },
    {
      label: "CIS Benchmark",
      value: data.cisBenchmark,
      status: data.cisBenchmark === "Compliant",
    },
    { label: "GDPR", value: data.gdpr, status: data.gdpr === "Compliant" },
    { label: "SOC2", value: data.soc2, status: data.soc2 === "Compliant" },
    {
      label: "PCI DSS",
      value: data.pciDss,
      status: data.pciDss === "Compliant",
    },
  ];

  return (
    <BentoCard className="h-full flex flex-col" delay={0.2}>
      <div className="flex items-center gap-2 mb-6">
        <ClipboardCheck className="w-5 h-5 text-emerald-400" />
        <h3 className="text-sm font-semibold tracking-wide text-white uppercase">
          Compliance
        </h3>
      </div>

      <div className="flex-1 flex flex-col justify-between gap-2">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex justify-between items-center py-2.5 border-b border-white/5 last:border-0"
          >
            <span className="text-xs font-medium text-white/60 uppercase">
              {item.label}
            </span>
            <span
              className={`text-xs font-bold px-2 py-1 rounded-md border ${
                item.status
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : item.value.includes("In Progress") ||
                      item.value.includes("Pending")
                    ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                    : "bg-white/5 border-white/10 text-white/40"
              }`}
            >
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </BentoCard>
  );
}
