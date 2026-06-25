import axios from 'axios';
import { useAuthStore } from '../store';

// Fallback to production backend if we are running in a browser on the render.com domain and no env var is set
const isRenderProd = typeof window !== 'undefined' && window.location.hostname.includes('render.com');
const API_URL = process.env.NEXT_PUBLIC_API_URL || (isRenderProd ? 'https://arrena-photo-backend.onrender.com/v1' : 'http://localhost:4000/v1');

export const getMediaUrl = (path: string | null | undefined) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const cleanPath = path.startsWith('/api') ? path.replace('/api', '') : path;
  return `${API_URL}${cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`}`;
};

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
