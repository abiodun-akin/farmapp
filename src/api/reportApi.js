import api from "../config/api";

// Report API endpoints
export const reportAPI = {
  getAll: () => api.get("/api"),

  getById: (id) => api.get(`/api/report/${id}`),

  create: (data) => api.post("/api/report", data),

  update: (id, data) => api.put(`/api/report/${id}`, data),

  delete: (id) => api.delete(`/api/report/${id}`),
};
