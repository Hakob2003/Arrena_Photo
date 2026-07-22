import { useEffect, useState } from "react";
import { BentoCard } from "../../BentoCard";
import { socApi } from "@/lib/soc.api";
import { formatDistanceToNow } from "date-fns";
import { ShieldAlert, Fingerprint, Globe, Activity } from "lucide-react";

export default function AttackTimeline() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    socApi.getTimeline(10).then((data) => {
      setEvents(data);
      setLoading(false);
    });
  }, []);

  const getSeverityColor = (score: number) => {
    if (score >= 90) return "border-rose-500 text-rose-500 bg-rose-500/10";
    if (score >= 60) return "border-amber-500 text-amber-500 bg-amber-500/10";
    return "border-emerald-500 text-emerald-500 bg-emerald-500/10";
  };

  return (
    <BentoCard className="h-full flex flex-col" delay={0.4}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-semibold tracking-wide text-white uppercase">
            Attack Timeline
          </h3>
          <p className="text-xs text-white/40 mt-1">Live chronological view</p>
        </div>
        <div className="flex gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
        {loading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-white/5 rounded-xl"></div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-10 text-white/40 text-sm">
            No recent attacks recorded.
          </div>
        ) : (
          <div className="relative pl-4 space-y-6 before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
            {events.map((e, i) => (
              <div
                key={e.id}
                className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
              >
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${getSeverityColor(e.riskScore)} bg-[#0f0f0f] shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10`}
                >
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm shadow">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white text-sm">
                      {e.attackType}
                    </span>
                    <time className="text-[10px] font-medium text-white/40">
                      {formatDistanceToNow(new Date(e.createdAt), {
                        addSuffix: true,
                      })}
                    </time>
                  </div>
                  <p className="text-xs text-white/60 mb-3">{e.reason}</p>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-[10px] font-medium text-white/40 bg-black/20 px-2 py-1 rounded">
                      <Globe className="w-3 h-3" /> {e.country || "Unknown"}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-medium text-white/40 bg-black/20 px-2 py-1 rounded">
                      <Fingerprint className="w-3 h-3" /> {e.ip}
                    </div>
                    {e.isBlocked && (
                      <div className="text-[10px] font-bold text-rose-400 border border-rose-500/30 px-2 py-1 rounded">
                        BLOCKED
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </BentoCard>
  );
}
