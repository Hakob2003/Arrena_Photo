import { BentoCard } from "@/components/admin/BentoCard";
import SecurityScoreCard from "../SecurityScoreCard";
import ThreatAnalytics from "../ThreatAnalytics";
import Recommendations from "../Recommendations";
import AttackTimeline from "../AttackTimeline";

interface SocOverviewTabProps {
  data: any;
}

export default function SocOverviewTab({ data }: SocOverviewTabProps) {
  return (
    <div className="flex flex-col gap-4 lg:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Top Row: Score & Threat Analytics */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        <div className="w-full lg:w-1/3">
          <SecurityScoreCard score={data.score} />
        </div>
        <div className="flex-1">
          <ThreatAnalytics data={data.threatAnalytics} />
        </div>
      </div>

      {/* Bottom Row: Timeline & Recommendations */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        <div className="w-full lg:w-2/3">
          <AttackTimeline />
        </div>
        <div className="w-full lg:w-1/3">
          <Recommendations recommendations={data.recommendations} />
        </div>
      </div>
    </div>
  );
}
