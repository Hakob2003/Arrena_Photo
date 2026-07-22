import { BentoCard } from "../../BentoCard";
import { Lock } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export default function TlsSsl({ data }: { data: any }) {
  const { t } = useTranslation();
  return (
    <BentoCard className="h-full" delay={0.3}>
      <div className="flex items-center gap-2 mb-6">
        <Lock className="w-5 h-5 text-blue-400" />
        <h3 className="text-sm font-semibold tracking-wide text-white uppercase">
          {t("soc.tls.title") || "TLS / SSL Configuration"}
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-y-4 gap-x-2">
        <div>
          <div className="text-[10px] text-white/40 uppercase font-bold">
            {t("soc.tls.version") || "Version"}
          </div>
          <div className="text-sm font-medium text-emerald-400">
            {data.version}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-white/40 uppercase font-bold">
            {t("soc.tls.certificate") || "Certificate"}
          </div>
          <div className="text-sm font-medium text-white">
            {data.certificate}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-white/40 uppercase font-bold">
            {t("soc.tls.issuer") || "Issuer"}
          </div>
          <div
            className="text-sm font-medium text-white/80 truncate"
            title={data.issuer}
          >
            {data.issuer}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-white/40 uppercase font-bold">
            {t("soc.tls.expiration") || "Expiration"}
          </div>
          <div className="text-sm font-medium text-white">
            {new Date(data.expiration).toLocaleDateString()}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-white/40 uppercase font-bold">
            OCSP
          </div>
          <div className="text-sm font-medium text-white">{data.ocsp}</div>
        </div>
        <div>
          <div className="text-[10px] text-white/40 uppercase font-bold">
            PFS
          </div>
          <div className="text-sm font-medium text-emerald-400">{data.pfs}</div>
        </div>
        <div className="col-span-2">
          <div className="text-[10px] text-white/40 uppercase font-bold">
            {t("soc.tls.cipher") || "Cipher"}
          </div>
          <div className="text-sm font-medium text-white font-mono text-xs">
            {data.cipher}
          </div>
        </div>
      </div>
    </BentoCard>
  );
}
