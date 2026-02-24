import api from "../config/api";

export const adminApi = {
  getDashboard: () => api.get("/api/admin/dashboard"),

  getUsers: (params = {}) => api.get("/api/admin/users", { params }),

  getUser: (userId) => api.get(`/api/admin/users/${userId}`),

  getUserActivityReport: (userId) =>
    api.get(`/api/admin/users/${userId}/activity-report`),

  suspendUser: (userId, reason) =>
    api.post(`/api/admin/users/${userId}/suspend`, { reason }),

  unsuspendUser: (userId) =>
    api.post(`/api/admin/users/${userId}/unsuspend`),

  recordViolation: (userId, type = "default") =>
    api.post(`/api/admin/users/${userId}/record-violation`, { type }),

  getViolations: (params = {}) =>
    api.get("/api/admin/violations", { params }),

  getFlaggedMessages: (params = {}) =>
    api.get("/api/admin/messages/flagged", { params }),

  approveMessage: (messageId, action) =>
    api.put(`/api/messages/${messageId}/admin/approve`, { action }),

  getSubscriptionsCancelled: (params = {}) =>
    api.get("/api/admin/subscriptions/cancelled", { params }),

  // Payment Management APIs
  getPayments: (params = {}) =>
    api.get("/api/admin/payments", { params }),

  getPayment: (paymentId) =>
    api.get(`/api/admin/payments/${paymentId}`),

  verifyPayment: (paymentId) =>
    api.post(`/api/admin/payments/${paymentId}/verify`),

  refundPayment: (paymentId, reason) =>
    api.post(`/api/admin/payments/${paymentId}/refund`, { reason }),

  disputePayment: (paymentId, reason, evidence) =>
    api.post(`/api/admin/payments/${paymentId}/dispute`, { reason, evidence }),

  getPaymentStats: () =>
    api.get("/api/admin/stats/overview"),

  getPaymentDailyStats: (days = 30) =>
    api.get("/api/admin/stats/daily", { params: { days } }),

  getPendingPayments: (params = {}) =>
    api.get("/api/admin/payments/pending", { params }),
};

