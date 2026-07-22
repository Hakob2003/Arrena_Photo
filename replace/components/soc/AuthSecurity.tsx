import { BentoCard } from "../../BentoCard";
import { UserCheck } from "lucide-react";

export default function AuthSecurity({ data }: { data: any }) {
  const items = [
    { label: "Successful Logins", value: data.successfulLogins, alert: false },
    {
      label: "Failed Logins",
      value: data.failedLogins,
      alert: data.failedLogins > 10,
    },
    { label: "MFA Success", value: data.mfaSuccess, alert: false },
    {
      label: "MFA Failures",
      value: data.mfaFailures,
      alert: data.mfaFailures > 5,
    },
    { label: "Password Resets", value: data.passwordResets, alert: false },
    {
      label: "Locked Accounts",
      value: data.lockedAccounts,
      alert: data.lockedAccounts > 0,
    },
    { label: "New Devices", value: data.newDevices, alert: false },
    {
      label: "Impossible Travel",
      value: data.impossibleTravel,
      alert: data.impossibleTravel > 0,
    },
    {
      label: "Anonymous Attempts",
      value: data.anonymousAttempts,
      alert: data.anonymousAttempts > 0,
    },
    {
      label: "Concurrent Sessions",
      value: data.concurrentSessions,
      alert: data.concurrentSessions > 0,
    },
  ];

  return (
    <BentoCard className="h-full flex flex-col" delay={0.1}>
      <div className="flex items-center gap-2 mb-6">
        <UserCheck className="w-5 h-5 text-sky-400" />
        <h3 className="text-sm font-semibold tracking-wide text-white uppercase">
          Authentication Security
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
