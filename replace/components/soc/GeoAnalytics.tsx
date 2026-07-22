import { BentoCard } from "../../BentoCard";
import { Globe2 } from "lucide-react";

export default function GeoAnalytics({ data }: { data: any[] }) {
  const maxAttacks =
    data.length > 0 ? Math.max(...data.map((d: any) => d.attacks)) : 1;

  return (
    <BentoCard className="h-full flex flex-col" delay={0.1}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Globe2 className="w-5 h-5 text-blue-400" />
          <h3 className="text-sm font-semibold tracking-wide text-white uppercase">
            Geo Analytics
          </h3>
        </div>
        <span className="text-xs font-medium text-white/40">
          Top Attack Origins
        </span>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
        {data.length === 0 ? (
          <div className="text-center py-8 text-white/40 text-sm">
            No geo data available.
          </div>
        ) : (
          data.map((item, i) => (
            <div key={i} className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white uppercase">
                    {item.country}
                  </span>
                  {item.blocked && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400">
                      BLOCKED
                    </span>
                  )}
                </div>
                <span className="text-xs font-mono text-white/60">
                  {item.attacks} attacks
                </span>
              </div>
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full ${item.blocked ? "bg-rose-500" : "bg-blue-500"}`}
                  style={{ width: `${(item.attacks / maxAttacks) * 100}%` }}
                ></div>
              </div>
            </div>
          ))
        )}
      </div>
    </BentoCard>
  );
}
