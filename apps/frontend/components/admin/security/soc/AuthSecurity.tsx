import { BentoCard } from "../../BentoCard";
import { UserCheck } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export default function AuthSecurity({ data }: { data: any }) {
  const { t } = useTranslation();
  const items = [
    { label: t("soc.auth.success") || "Successful Logins", value: data.successfulLogins, alert: false },
    {
      label: t("soc.auth.failed") || "Failed Logins",
      value: data.failedLogins,
      alert: data.failedLogins > 10,
    },
    { label: t("soc.auth.mfaSuccess") || "MFA Success", value: data.mfaSuccess, alert: false },
    {
      label: t("soc.auth.mfaFailed") || "MFA Failures",
      value: data.mfaFailures,
      alert: data.mfaFailures > 5,
    },
    { label: t("soc.auth.pwResets") || "Password Resets", value: data.passwordResets, alert: false },
    {
      label: t("soc.auth.locked") || "Locked Accounts",
      value: data.lockedAccounts,
      alert: data.lockedAccounts > 0,
    },
    { label: t("soc.auth.newDevices") || "New Devices", value: data.newDevices, alert: false },
    {
      label: t("soc.auth.impossibleTravel") || "Impossible Travel",
      value: data.impossibleTravel,
      alert: data.impossibleTravel > 0,
    },
    {
      label: t("soc.auth.anon") || "Anonymous Attempts",
      value: data.anonymousAttempts,
      alert: data.anonymousAttempts > 0,
    },
    {
      label: t("soc.auth.concurrent") || "Concurrent Sessions",
      value: data.concurrentSessions,
      alert: data.concurrentSessions > 0,
    },
  ];

  return (
    <BentoCard className="h-full flex flex-col" delay={0.1}>
      <div className="flex items-center gap-2 mb-6">
        <UserCheck className="w-5 h-5 text-sky-400" />
        <h3 className="text-sm font-semibold tracking-wide text-white uppercase">
          {t("soc.auth.title") || "Authentication Security"}
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
