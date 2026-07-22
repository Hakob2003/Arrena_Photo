import { BentoCard } from "../../BentoCard";
import { ShieldCheck, ShieldAlert } from "lucide-react";

export default function SecurityHeaders({ data }: { data: any }) {
  const headers = [
    { name: "CSP", ...data.csp },
    { name: "HSTS", ...data.hsts },
    { name: "X-Frame-Options", ...data.xfo },
    { name: "Permissions Policy", ...data.permissionsPolicy },
    { name: "Referrer Policy", ...data.referrerPolicy },
    { name: "COOP", ...data.coop },
    { name: "CORP", ...data.corp },
    { name: "CORS", ...data.cors },
  ];

  return (
    <BentoCard className="h-full" delay={0.2}>
      <h3 className="text-sm font-semibold tracking-wide text-white uppercase mb-6">
        Security Headers
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {headers.map((h, i) => (
          <div
            key={i}
            className="flex flex-col p-3 rounded-xl bg-white/5 border border-white/5 relative overflow-hidden"
          >
            <span
              className="text-[10px] text-white/40 uppercase font-bold truncate pr-6"
              title={h.name}
            >
              {h.name}
            </span>
            <div className="text-sm font-bold text-white mt-1">{h.status}</div>

            <div
              className={`absolute top-2 right-2 flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${
                h.grade === "A"
                  ? "bg-emerald-500/20 text-emerald-400"
                  : h.grade === "B"
                    ? "bg-blue-500/20 text-blue-400"
                    : h.grade === "C"
                      ? "bg-amber-500/20 text-amber-400"
                      : "bg-rose-500/20 text-rose-400"
              }`}
            >
              {h.grade}
            </div>
          </div>
        ))}
      </div>
    </BentoCard>
  );
}
