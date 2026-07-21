import { BentoCard } from "../../BentoCard";
import { PackageOpen } from "lucide-react";

export default function DependencySecurity({ data }: { data: any }) {
  return (
    <BentoCard className="h-full flex flex-col" delay={0.2}>
      <div className="flex items-center gap-2 mb-6">
        <PackageOpen className="w-5 h-5 text-orange-400" />
        <h3 className="text-sm font-semibold tracking-wide text-white uppercase">
          Dependency Security
        </h3>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
        {data.status === "No Data" ? (
          <>
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center mb-4">
              <PackageOpen className="w-5 h-5 text-white/40" />
            </div>
            <h4 className="text-sm font-bold text-white mb-1">
              Audit Not Configured
            </h4>
            <p className="text-xs text-white/40 max-w-[250px]">
              npm audit integration is prepared but currently returning "No
              Data". Run an audit pipeline to populate this section.
            </p>
          </>
        ) : (
          <div className="w-full grid grid-cols-2 gap-4">
            <div className="bg-white/5 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-rose-500">
                {data.vulnerabilities.critical}
              </div>
              <div className="text-[10px] text-white/40 uppercase font-bold mt-1">
                Critical
              </div>
            </div>
            <div className="bg-white/5 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-orange-500">
                {data.vulnerabilities.high}
              </div>
              <div className="text-[10px] text-white/40 uppercase font-bold mt-1">
                High
              </div>
            </div>
          </div>
        )}
      </div>
    </BentoCard>
  );
}
