import { api } from "./api";

export interface SecurityEvent {
  id: string;
  ip: string;
  macAddress?: string;
  country?: string;
  city?: string;
  endpoint: string;
  method: string;
  attackType: string;
  riskScore: number;
  isBlocked: boolean;
  reason?: string;
  payloadHash?: string;
  createdAt: string;
}

export interface BlockedIp {
  id: string;
  ip: string;
  reason?: string;
  country?: string;
  isPermanent: boolean;
  expiresAt?: string;
  blockedAt: string;
}

export interface SecurityDashboardStats {
  healthScore: number;
  metrics: {
    attacksToday: number;
    totalBlockedIps: number;
    activeSessions: number;
  };
  charts: {
    topAttacks: { name: string; count: number }[];
    topCountries: { name: string; count: number }[];
  };
  recentEvents: SecurityEvent[];
}

export const adminSecurityApi = {
  getDashboard: async (): Promise<SecurityDashboardStats> => {
    const res = await api.get("/admin/security/dashboard");
    return res.data;
  },

  getEvents: async (limit = 50): Promise<SecurityEvent[]> => {
    const res = await api.get("/admin/security/events", { params: { limit } });
    return res.data;
  },

  getBlockedIps: async (): Promise<BlockedIp[]> => {
    const res = await api.get("/admin/security/blocked-ips");
    return res.data;
  },

  blockIp: async (
    ip: string,
    reason: string,
    isPermanent = false,
    hours = 24,
  ) => {
    const res = await api.post("/admin/security/block-ip", {
      ip,
      reason,
      isPermanent,
      hours,
    });
    return res.data;
  },

  unblockIp: async (ip: string) => {
    const res = await api.post("/admin/security/unblock-ip", { ip });
    return res.data;
  },
};
