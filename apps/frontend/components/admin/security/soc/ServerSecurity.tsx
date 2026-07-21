import { BentoCard } from "../../BentoCard";
import { Server, Cpu, HardDrive, Network } from "lucide-react";

export default function ServerSecurity({ data }: { data: any }) {
  return (
    <BentoCard delay={0.1}>
      <div className="flex items-center gap-2 mb-6">
        <Server className="w-5 h-5 text-zinc-400" />
        <h3 className="text-sm font-semibold tracking-wide text-white uppercase">
          Server & Infrastructure Security
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* CPU */}
        <div className="flex flex-col gap-2 p-4 rounded-xl bg-white/5 border border-white/5">
          <div className="flex items-center justify-between text-white/40">
            <span className="text-[10px] font-bold uppercase">CPU Usage</span>
            <Cpu className="w-4 h-4" />
          </div>
          <div className="text-3xl font-bold text-white">{data.cpu.usage}%</div>
          <div className="w-full bg-white/10 h-1 mt-2 rounded-full overflow-hidden">
            <div
              className={`h-full ${data.cpu.usage > 80 ? "bg-rose-500" : "bg-emerald-500"}`}
              style={{ width: `${data.cpu.usage}%` }}
            ></div>
          </div>
          <div className="text-[10px] text-white/40 text-right mt-1">
            {data.cpu.cores} Cores
          </div>
        </div>

        {/* RAM */}
        <div className="flex flex-col gap-2 p-4 rounded-xl bg-white/5 border border-white/5">
          <div className="flex items-center justify-between text-white/40">
            <span className="text-[10px] font-bold uppercase">
              Memory Usage
            </span>
            <HardDrive className="w-4 h-4" />
          </div>
          <div className="text-3xl font-bold text-white">
            {data.ram.percent}%
          </div>
          <div className="w-full bg-white/10 h-1 mt-2 rounded-full overflow-hidden">
            <div
              className={`h-full ${data.ram.percent > 85 ? "bg-rose-500" : "bg-blue-500"}`}
              style={{ width: `${data.ram.percent}%` }}
            ></div>
          </div>
          <div className="text-[10px] text-white/40 text-right mt-1">
            {data.ram.used}GB / {data.ram.total}GB
          </div>
        </div>

        {/* Network */}
        <div className="flex flex-col gap-2 p-4 rounded-xl bg-white/5 border border-white/5">
          <div className="flex items-center justify-between text-white/40">
            <span className="text-[10px] font-bold uppercase">
              Network Latency
            </span>
            <Network className="w-4 h-4" />
          </div>
          <div className="flex justify-between items-end mt-1">
            <div className="text-sm font-medium text-white/60">API Latency</div>
            <div className="text-lg font-bold text-emerald-400">
              {data.network.apiLatency}
            </div>
          </div>
          <div className="flex justify-between items-end">
            <div className="text-sm font-medium text-white/60">DB Latency</div>
            <div className="text-lg font-bold text-emerald-400">
              {data.network.dbLatency}
            </div>
          </div>
          <div className="flex justify-between items-end mt-1 pt-1 border-t border-white/5">
            <div className="text-[10px] font-bold text-white/40 uppercase">
              Open Connections
            </div>
            <div className="text-sm font-bold text-white">
              {data.network.openConnections}
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="flex flex-col gap-2 p-4 rounded-xl bg-white/5 border border-white/5">
          <div className="text-[10px] font-bold uppercase text-white/40 mb-2">
            Service Status
          </div>
          <div className="flex-1 flex flex-col justify-between">
            {Object.entries(data.services).map(([key, val]: any) => (
              <div
                key={key}
                className="flex justify-between items-center text-xs"
              >
                <span className="text-white/60 capitalize">{key}</span>
                <span
                  className={`font-bold ${val === "Active" ? "text-emerald-400" : "text-white/40"}`}
                >
                  {val}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BentoCard>
  );
}
