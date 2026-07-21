import { api } from "./api";

export const adminApi = {
  // Users
  getUsers: async (page = 1, limit = 20, search?: string, role?: string) => {
    let url = `/admin/users?page=${page}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (role) url += `&role=${role}`;
    const res = await api.get(url);
    return res.data;
  },
  updateUserCredits: async (id: string, amount: number, reason: string) => {
    const res = await api.post(`/admin/users/${id}/credits`, {
      amount,
      reason,
    });
    return res.data;
  },
  updateUserPlan: async (id: string, plan: string) => {
    const res = await api.post(`/admin/users/${id}/plan`, { plan });
    return res.data;
  },
  importUsers: async (emails: string[]) => {
    const res = await api.post(`/admin/users/import`, { emails });
    return res.data;
  },
  updateUserLimits: async (
    id: string,
    limits: Record<string, number | null>,
  ) => {
    const res = await api.put(`/users/${id}/limits`, limits);
    return res.data;
  },
  banUser: async (id: string) => {
    const res = await api.post(`/admin/users/${id}/ban`);
    return res.data;
  },
  unbanUser: async (id: string) => {
    const res = await api.post(`/admin/users/${id}/unban`);
    return res.data;
  },
  deleteUser: async (id: string) => {
    const res = await api.delete(`/admin/users/${id}`);
    return res.data;
  },

  // Templates
  getTemplates: async (page = 1, limit = 20) => {
    const res = await api.get(`/admin/templates?page=${page}&limit=${limit}`);
    return res.data;
  },
  approveTemplate: async (id: string) => {
    const res = await api.post(`/admin/templates/${id}/approve`);
    return res.data;
  },
  rejectTemplate: async (id: string) => {
    const res = await api.post(`/admin/templates/${id}/reject`);
    return res.data;
  },

  // Generations
  getGenerations: async (page = 1, limit = 20) => {
    const res = await api.get(`/admin/generations?page=${page}&limit=${limit}`);
    return res.data;
  },

  // Audit Logs
  getAuditLogs: async (page = 1, limit = 20) => {
    const res = await api.get(`/admin/audit-logs?page=${page}&limit=${limit}`);
    return res.data;
  },
  runSystemAudit: async () => {
    const res = await api.get("/admin/system-audit");
    return res.data;
  },
  getSystemAuditGarbage: async () => {
    const res = await api.get("/admin/system-audit/garbage");
    return res.data;
  },
  cleanSystemAuditGarbage: async () => {
    const res = await api.delete("/admin/system-audit/garbage");
    return res.data;
  },

  // Dashboard Stats
  getDashboardStats: async () => {
    const res = await api.get("/admin/dashboard");
    return res.data;
  },
  getAnalytics: async () => {
    const res = await api.get("/admin/analytics");
    return res.data;
  },

  // Payouts
  getPayouts: async (page = 1, limit = 20) => {
    const res = await api.get(`/admin/payouts?page=${page}&limit=${limit}`);
    return res.data;
  },
  processPayout: async (id: string) => {
    const res = await api.post(`/admin/payouts/${id}/process`);
    return res.data;
  },
};
