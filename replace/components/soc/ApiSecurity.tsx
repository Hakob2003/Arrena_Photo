import { BentoCard } from "../../BentoCard";
import { Webhook } from "lucide-react";

export default function ApiSecurity({ data }: { data: any }) {
  const items = [
    { label: "Total API Requests", value: data.totalRequests, alert: false },
    {
      label: "Invalid JWT",
      value: data.invalidJwt,
      alert: data.invalidJwt > 50,
    },
    { label: "Expired JWT", value: data.expiredJwt, alert: false },
    {
      label: "Missing Auth",
      value: data.missingAuth,
      alert: data.missingAuth > 20,
    },
    {
      label: "Invalid API Keys",
      value: data.invalidKeys,
      alert: data.invalidKeys > 10,
    },
    {
      label: "Unauthorized Access",
      value: data.unauthorized,
      alert: data.unauthorized > 5,
    },
    {
      label: "Replay Attempts",
      value: data.replayAttempts,
      alert: data.replayAttempts > 0,
    },
    {
      label: "Large Payload Attacks",
      value: data.largePayload,
      alert: data.largePayload > 0,
    },
    {
      label: "Rate Limited Requests",
      value: data.rateLimited,
      alert: data.rateLimited > 100,
    },
  ];

  return (
    <BentoCard className="h-full flex flex-col" delay={0.2}>
      <div className="flex items-center gap-2 mb-6">
        <Webhook className="w-5 h-5 text-indigo-400" />
        <h3 className="text-sm font-semibold tracking-wide text-white uppercase">
          API Security
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
