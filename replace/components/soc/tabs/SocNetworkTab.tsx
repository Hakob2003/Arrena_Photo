import { BentoCard } from "@/components/admin/BentoCard";
import WafAnalytics from "../WafAnalytics";
import SecurityHeaders from "../SecurityHeaders";
import TlsSsl from "../TlsSsl";
import Reputation from "../Reputation";
import Alerts from "../Alerts";

interface SocNetworkTabProps {
  data: any;
}

export default function SocNetworkTab({ data }: SocNetworkTabProps) {
  return (
    <div className="flex flex-col gap-4 lg:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Top Row: WAF & Reputation */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        <div className="w-full lg:w-2/3">
          <WafAnalytics data={data.wafAnalytics} />
        </div>
        <div className="w-full lg:w-1/3">
          <Reputation data={data.reputation} />
        </div>
      </div>

      {/* Middle Row: Security Headers & TLS */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        <div className="w-full lg:w-1/2">
          <SecurityHeaders data={data.securityHeaders} />
        </div>
        <div className="w-full lg:w-1/2">
          <TlsSsl data={data.tlsSsl} />
        </div>
      </div>

      {/* Bottom Row: Alerts List */}
      <div className="w-full">
        <Alerts />
      </div>
    </div>
  );
}
