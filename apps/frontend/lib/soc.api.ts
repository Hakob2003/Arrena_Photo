import { api } from "./api";

export const socApi = {
  getDashboard: async (timeframe: string = "24h") => {
    const res = await api.get(`/admin/soc/dashboard?timeframe=${timeframe}`);
    return res.data;
  },

  getThreatFeed: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
  }) => {
    const res = await api.get("/admin/soc/threat-feed", { params });
    return res.data;
  },

  getAuditLog: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    action?: string;
  }) => {
    const res = await api.get("/admin/soc/audit-log", { params });
    return res.data;
  },

  getAlerts: async (params: {
    page?: number;
    limit?: number;
    severity?: string;
  }) => {
    const res = await api.get("/admin/soc/alerts", { params });
    return res.data;
  },

  getTimeline: async (limit: number = 50) => {
    const res = await api.get(`/admin/soc/timeline?limit=${limit}`);
    return res.data;
  },
};
