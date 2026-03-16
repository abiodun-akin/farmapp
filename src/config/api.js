import axios from "axios";

const configuredApiUrl =
  import.meta.env.VITE_API_URL || "https://connectapi-joq3.onrender.com";

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

// Request interceptor - Add JWT token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("farmconnect:auth-expired", {
          detail: {
            status: error.response?.status,
            code: error.response?.data?.code || null,
            message: error.response?.data?.error || "Session expired",
          },
        })
      );
    }
    return Promise.reject(error);
  }
);

export default api;
