import axios from "axios";
import { useAuthStore } from "../store";

// Fallback to production backend if we are running in a browser on the render.com domain and no env var is set
const isRenderProd =
  typeof window !== "undefined" &&
  window.location.hostname.includes("render.com");
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (isRenderProd
    ? "https://arrena-photo-backend.onrender.com/v1"
    : "http://localhost:4000/v1");

export const getMediaUrl = (path: string | null | undefined) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const cleanPath = path.startsWith("/api") ? path.replace("/api", "") : path;
  return `${API_URL}${cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`}`;
};

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let inMemoryToken: string | null = null;

if (typeof window !== "undefined") {
  inMemoryToken = localStorage.getItem("token") || null;
}

export const setToken = (token: string | null) => {
  inMemoryToken = token;
  if (typeof window !== "undefined") {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }
};

export const getToken = () => inMemoryToken;

api.interceptors.request.use((config) => {
  if (inMemoryToken) {
    config.headers.Authorization = `Bearer ${inMemoryToken}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== "/auth/refresh" &&
      originalRequest.url !== "/auth/login" &&
      originalRequest.url !== "/auth/logout"
    ) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = "Bearer " + token;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Backend relies on refresh_token cookie
        const res = await api.post(
          "/auth/refresh",
          {},
          { withCredentials: true },
        );

        if (res.data?.access_token) {
          setToken(res.data.access_token);
          api.defaults.headers.common["Authorization"] =
            "Bearer " + res.data.access_token;
          originalRequest.headers.Authorization =
            "Bearer " + res.data.access_token;
          processQueue(null, res.data.access_token);

          return api(originalRequest);
        }
      } catch (err) {
        processQueue(err as Error, null);
        setToken(null);
        if (typeof window !== "undefined") {
          useAuthStore.getState().logout();
          if (window.location.pathname !== "/login") {
            window.dispatchEvent(new Event("auth-logout"));
          }
        }
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    // Pass other errors unchanged
    return Promise.reject(error);
  },
);
