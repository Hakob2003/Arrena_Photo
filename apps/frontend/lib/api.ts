import axios from "axios";
import { useAuthStore } from "../store";

// Fallback to production backend if we are running in a browser on the render.com domain and no env var is set
const isRenderProd =
  typeof window !== "undefined" &&
  window.location.hostname.includes("render.com");
const API_URL =
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

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
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
      originalRequest.url !== "/auth/login"
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
          if (typeof window !== "undefined") {
            localStorage.setItem("token", res.data.access_token);
          }
          api.defaults.headers.common["Authorization"] =
            "Bearer " + res.data.access_token;
          originalRequest.headers.Authorization =
            "Bearer " + res.data.access_token;
          processQueue(null, res.data.access_token);

          return api(originalRequest);
        }
      } catch (err) {
        processQueue(err, null);
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          useAuthStore.getState().logout();
          if (window.location.pathname !== "/login") {
            window.location.href = "/login";
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
