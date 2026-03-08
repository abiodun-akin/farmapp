import api from "../config/api";

// Report API endpoints
export const reportAPI = {
  getAll: () => api.get("/report"),

  getById: (id) => api.get(`/report/${id}`),

  create: (data) => api.post("/report", data),

  update: (id, data) => api.put(`/report/${id}`, data),

  delete: (id) => api.delete(`/report/${id}`),
};
