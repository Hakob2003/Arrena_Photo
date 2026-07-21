import { BentoCard } from "../../BentoCard";
import { Users } from "lucide-react";

export default function SessionSecurity({ data }: { data: any }) {
  const items = [
    { label: "Active Sessions", value: data.active, alert: false },
    { label: "Admin Sessions", value: data.admin, alert: false },
    { label: "Remember Me", value: data.rememberMe, alert: false },
    { label: "Expired Sessions", value: data.expired, alert: false },
    { label: "Revoked Sessions", value: data.revoked, alert: false },
    {
      label: "Concurrent Logins",
      value: data.concurrent,
      alert: data.concurrent > 0,
    },
    { label: "Idle Sessions", value: data.idle, alert: false },
  ];

  return (
    <BentoCard className="h-full flex flex-col" delay={0.3}>
      <div className="flex items-center gap-2 mb-6">
        <Users className="w-5 h-5 text-emerald-400" />
        <h3 className="text-sm font-semibold tracking-wide text-white uppercase">
          Session Security
        </h3>
      </div>

      <div className="flex-1 flex flex-col gap-3">
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
