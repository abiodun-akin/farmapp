import axios from "axios";
import { getToken, removeToken, setToken } from "../utils/tokenUtils";

const configuredApiUrl = import.meta.env.VITE_API_URL;

if (!configuredApiUrl) {
  throw new Error("VITE_API_URL is not set. Check your .env file.");
}

const normalizedApiUrl = configuredApiUrl.replace(/\/+$/, "");

// Socket.IO should connect to the API origin (without /api suffix).
export const API_BASE_URL = normalizedApiUrl.endsWith("/api")
  ? normalizedApiUrl.slice(0, -4)
  : normalizedApiUrl;

// REST endpoints are mounted under /api on the backend.
export const API_REST_BASE_URL = normalizedApiUrl.endsWith("/api")
  ? normalizedApiUrl
  : `${normalizedApiUrl}/api`;

// Create axios instance
const api = axios.create({
  baseURL: API_REST_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Send cookies/credentials with requests (needed when server sets cookies)
api.defaults.withCredentials = true;

let refreshPromise = null;

const isAuthRoute = (url = "") => {
  return String(url).includes("/auth/");
};

const refreshSession = async () => {
  if (!refreshPromise) {
    refreshPromise = api
      .post("/auth/refresh", {}, { _skipAuthRefresh: true })
      .then((response) => {
        const refreshedToken = response?.data?.token;
        if (refreshedToken) {
          setToken(refreshedToken); // Uses sessionStorage
        }
        return refreshedToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

// Request interceptor - Add JWT token to headers
api.interceptors.request.use(
  (config) => {
    if (config._skipAuthRefresh) {
      return config;
    }

    const token = getToken(); // Prefers sessionStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor - Handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};
    const isUnauthorized = error.response?.status === 401;

    if (!isUnauthorized) {
      return Promise.reject(error);
    }

    if (
      originalRequest._skipAuthRefresh ||
      originalRequest._retry ||
      isAuthRoute(originalRequest.url)
    ) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("farmconnect:auth-expired", {
            detail: {
              status: error.response?.status,
              code: error.response?.data?.code || null,
              message: error.response?.data?.error || "Session expired",
            },
          }),
        );
      }
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const refreshedToken = await refreshSession();
      if (refreshedToken) {
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${refreshedToken}`;
      }
      return api(originalRequest);
    } catch (refreshError) {
      removeToken(); // Clears both sessionStorage and localStorage

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("farmconnect:auth-expired", {
            detail: {
              status: refreshError.response?.status || 401,
              code: refreshError.response?.data?.code || null,
              message: refreshError.response?.data?.error || "Session expired",
            },
          }),
        );
      }

      return Promise.reject(refreshError);
    }
  },
);

export default api;
