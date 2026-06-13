import axios from 'axios';
import { useAuthStore } from '../store';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor to automatically inject Auth token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
