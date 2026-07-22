"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { useSocStore } from "@/store/soc.store";
import {
  Clock,
  ShieldCheck,
  Activity,
  Search,
  ShieldAlert,
  Shield,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Tab Components
import SocOverviewTab from "@/components/admin/security/soc/tabs/SocOverviewTab";
import SocNetworkTab from "@/components/admin/security/soc/tabs/SocNetworkTab";
import SocIdentityTab from "@/components/admin/security/soc/tabs/SocIdentityTab";
import SocInfraTab from "@/components/admin/security/soc/tabs/SocInfraTab";
import SocAuditTab from "@/components/admin/security/soc/tabs/SocAuditTab";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "network", label: "Network & Web" },
  { id: "identity", label: "Identity & API" },
  { id: "infra", label: "Infrastructure" },
  { id: "audit", label: "Audits & Geo" },
];

export default function SecurityCenterPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("overview");
  const [autoRefresh, setAutoRefresh] = useState(30);

  const { dashboardData, isLoading, timeframe, setTimeframe, fetchDashboard } =
    useSocStore();

  useEffect(() => {
    fetchDashboard();

    let interval: any;
    if (autoRefresh > 0) {
      interval = setInterval(() => {
        fetchDashboard(true);
      }, autoRefresh * 1000);
    }

    return () => clearInterval(interval);
  }, [autoRefresh, fetchDashboard]);

  if (isLoading && !dashboardData) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500/50 border-t-emerald-400" />
          <p className="text-sm font-medium text-emerald-400/50 tracking-widest uppercase">
            Initializing Enterprise SOC...
          </p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center p-8 text-white">
        Error loading SOC Data. Please ensure the backend is running.
      </div>
    );
  }

  const score = dashboardData.score.overall;
  const getStatusColor = () => {
    if (score >= 90) return "text-emerald-400";
    if (score >= 70) return "text-amber-400";
    return "text-rose-400";
  };

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 min-h-screen max-w-[1800px] mx-auto text-slate-200">
      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end justify-between bg-[#0f0f0f]/80 p-6 rounded-2xl border border-white/5 backdrop-blur-xl">
        <div className="flex items-center gap-6">
          <div
            className={`p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center ${getStatusColor()}`}
          >
            {score >= 90 ? (
              <ShieldCheck className="w-10 h-10" />
            ) : score >= 70 ? (
              <Shield className="w-10 h-10" />
            ) : (
              <ShieldAlert className="w-10 h-10" />
            )}
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tighter text-white mb-1">
              Security Operations Center
            </h1>
            <p className="text-sm font-medium text-white/40 uppercase tracking-widest flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" /> Live Threat
              Monitoring Active
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
            <Clock className="w-4 h-4 text-white/40" />
            <Select
              value={timeframe}
              onValueChange={(v) => {
                if (v) {
                  setTimeframe(v);
                }
              }}
            >
              <SelectTrigger className="w-[100px] bg-transparent border-0 text-xs font-medium focus:ring-0">
                <SelectValue placeholder="Timeframe" />
              </SelectTrigger>
              <SelectContent className="bg-[#0f0f0f] border-white/10 text-white">
                <SelectItem value="1h">Last 1 Hour</SelectItem>
                <SelectItem value="24h">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
            <span className="text-xs font-medium text-white/40 uppercase">
              Auto-Refresh:
            </span>
            <Select
              value={autoRefresh.toString()}
              onValueChange={(v) => setAutoRefresh(Number(v))}
            >
              <SelectTrigger className="w-[80px] bg-transparent border-0 text-xs font-medium focus:ring-0">
                <SelectValue placeholder="Refresh" />
              </SelectTrigger>
              <SelectContent className="bg-[#0f0f0f] border-white/10 text-white">
                <SelectItem value="0">Off</SelectItem>
                <SelectItem value="5">5s</SelectItem>
                <SelectItem value="10">10s</SelectItem>
                <SelectItem value="30">30s</SelectItem>
                <SelectItem value="60">60s</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2 border-b border-white/10">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 text-sm font-semibold rounded-t-lg transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-white/10 text-white border-b-2 border-emerald-400"
                : "text-white/40 hover:text-white/80 hover:bg-white/5"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content Area */}
      <div className="mt-2 min-h-[60vh]">
        {activeTab === "overview" && <SocOverviewTab data={dashboardData} />}
        {activeTab === "network" && <SocNetworkTab data={dashboardData} />}
        {activeTab === "identity" && <SocIdentityTab data={dashboardData} />}
        {activeTab === "infra" && <SocInfraTab data={dashboardData} />}
        {activeTab === "audit" && <SocAuditTab data={dashboardData} />}
      </div>
    </div>
  );
}
