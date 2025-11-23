import api from "../config/api";

// User API endpoints
export const userAPI = {
  signup: (name, email, password) =>
    api.post("/api/auth/signup", { name, email, password }),

  login: (email, password) => api.post("/api/auth/login", { email, password }),

  logout: () => api.post("/api/auth/logout"),
};
