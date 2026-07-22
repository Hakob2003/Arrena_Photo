import { BentoCard } from "../../BentoCard";
import { DatabaseBackup, CheckCircle2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function BackupSecurity({ data }: { data: any }) {
  return (
    <BentoCard className="h-full flex flex-col" delay={0.3}>
      <div className="flex items-center gap-2 mb-6">
        <DatabaseBackup className="w-5 h-5 text-sky-400" />
        <h3 className="text-sm font-semibold tracking-wide text-white uppercase">
          Backup Security
        </h3>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-y-4 gap-x-2">
        <div>
          <div className="text-[10px] text-white/40 uppercase font-bold">
            Last Backup
          </div>
          <div className="text-sm font-medium text-white">
            {formatDistanceToNow(new Date(data.lastBackup), {
              addSuffix: true,
            })}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-white/40 uppercase font-bold">
            Size
          </div>
          <div className="text-sm font-medium text-white">
            {data.backupSize}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-white/40 uppercase font-bold">
            Encrypted
          </div>
          <div className="text-sm font-medium flex items-center gap-1 text-emerald-400">
            {data.encrypted ? <CheckCircle2 className="w-4 h-4" /> : "No"}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-white/40 uppercase font-bold">
            Verified
          </div>
          <div className="text-sm font-medium flex items-center gap-1 text-emerald-400">
            {data.verified ? <CheckCircle2 className="w-4 h-4" /> : "No"}
          </div>
        </div>
        <div className="col-span-2">
          <div className="text-[10px] text-white/40 uppercase font-bold">
            Last Restore Test
          </div>
          <div className="text-sm font-medium text-white/80">
            {new Date(data.restoreTested).toLocaleDateString()}
          </div>
        </div>
      </div>
    </BentoCard>
  );
}
