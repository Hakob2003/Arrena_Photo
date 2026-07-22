import { BentoCard } from "@/components/admin/BentoCard";
import GeoAnalytics from "../GeoAnalytics";
import Compliance from "../Compliance";
import AuditLogViewer from "../AuditLogViewer";

interface SocAuditTabProps {
  data: any;
}

export default function SocAuditTab({ data }: SocAuditTabProps) {
  return (
    <div className="flex flex-col gap-4 lg:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Top Row: Geo & Compliance */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        <div className="w-full lg:w-2/3">
          <GeoAnalytics data={data.geoAnalytics} />
        </div>
        <div className="w-full lg:w-1/3">
          <Compliance data={data.compliance} />
        </div>
      </div>

      {/* Bottom Row: Audit Log */}
      <div className="w-full">
        <AuditLogViewer />
      </div>
    </div>
  );
}
