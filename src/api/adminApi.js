import api from "../config/api";

export const adminApi = {
  getDashboard: () => api.get("/admin/dashboard"),

  getUsers: (params = {}) => api.get("/admin/users", { params }),

  getUser: (userId) => api.get(`/admin/users/${userId}`),

  getUserActivityReport: (userId) =>
    api.get(`/admin/users/${userId}/activity-report`),

  suspendUser: (userId, reason) =>
    api.post(`/admin/users/${userId}/suspend`, { reason }),

  unsuspendUser: (userId) =>
    api.post(`/admin/users/${userId}/unsuspend`),

  recordViolation: (userId, type = "default") =>
    api.post(`/admin/users/${userId}/record-violation`, { type }),

  getViolations: (params = {}) =>
    api.get("/admin/violations", { params }),

  getFlaggedMessages: (params = {}) =>
    api.get("/admin/messages/flagged", { params }),

  approveMessage: (messageId, action) =>
    api.put(`/messages/${messageId}/admin/approve`, { action }),

  getSubscriptionsCancelled: (params = {}) =>
    api.get("/admin/subscriptions/cancelled", { params }),

  // Payment Management APIs
  getPayments: (params = {}) =>
    api.get("/admin/payments", { params }),

  getPayment: (paymentId) =>
    api.get(`/admin/payments/${paymentId}`),

  verifyPayment: (paymentId) =>
    api.post(`/admin/payments/${paymentId}/verify`),

  refundPayment: (paymentId, reason) =>
    api.post(`/admin/payments/${paymentId}/refund`, { reason }),

  disputePayment: (paymentId, reason, evidence) =>
    api.post(`/admin/payments/${paymentId}/dispute`, { reason, evidence }),

  getPaymentStats: () =>
    api.get("/admin/stats/overview"),

  getPaymentDailyStats: (days = 30) =>
    api.get("/admin/stats/daily", { params: { days } }),

  getPendingPayments: (params = {}) =>
    api.get("/admin/payments/pending", { params }),
};

