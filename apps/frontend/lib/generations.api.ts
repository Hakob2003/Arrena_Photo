import { api } from './api';

export const generationsApi = {
  getFeed: async () => {
    const response = await api.get('/generations/feed/public');
    return response.data.data || response.data;
  },
  publish: async (id: string, isPublic: boolean) => {
    const response = await api.post(`/generations/${id}/publish`, { isPublic });
    return response.data;
  },
  toggleLike: async (id: string) => {
    const response = await api.post(`/generations/${id}/like`);
    return response.data;
  },
  getHistory: async () => {
    const response = await api.get('/generations/history');
    return response.data.data || response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/generations', data);
    return response.data;
  },
  getStatus: async (id: string) => {
    const response = await api.get(`/generations/${id}`);
    return response.data;
  }
};
