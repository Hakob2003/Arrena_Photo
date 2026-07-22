import { BentoCard } from "@/components/admin/BentoCard";
import ServerSecurity from "../ServerSecurity";
import DependencySecurity from "../DependencySecurity";
import BackupSecurity from "../BackupSecurity";

interface SocInfraTabProps {
  data: any;
}

export default function SocInfraTab({ data }: SocInfraTabProps) {
  return (
    <div className="flex flex-col gap-4 lg:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Server Security spans full width or large part */}
      <div className="w-full">
        <ServerSecurity data={data.serverSecurity} />
      </div>

      {/* Bottom Row: Dependencies & Backups */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        <div className="w-full lg:w-1/2">
          <DependencySecurity data={data.dependencySecurity} />
        </div>
        <div className="w-full lg:w-1/2">
          <BackupSecurity data={data.backupSecurity} />
        </div>
      </div>
    </div>
  );
}
