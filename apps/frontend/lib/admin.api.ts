import { api } from './api';

export const adminApi = {
  // Users
  getUsers: async (page = 1, limit = 20) => {
    const res = await api.get(`/admin/users?page=${page}&limit=${limit}`);
    return res.data;
  },
  banUser: async (id: string) => {
    const res = await api.post(`/admin/users/${id}/ban`);
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

  // Dashboard Stats
  getDashboardStats: async () => {
    const res = await api.get('/admin/dashboard');
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
  }
};

