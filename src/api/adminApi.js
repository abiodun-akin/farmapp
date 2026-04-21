import api from "../config/api";

export const adminApi = {
  getDashboard: () => api.get("/admin/dashboard"),

  getUsers: (params = {}) => api.get("/admin/users", { params }),

  getUser: (userId) => api.get(`/admin/users/${userId}`),

  getUserActivityReport: (userId) =>
    api.get(`/admin/users/${userId}/activity-report`),

  suspendUser: (userId, reason) =>
    api.post(`/admin/users/${userId}/suspend`, { reason }),

  unsuspendUser: (userId) => api.post(`/admin/users/${userId}/unsuspend`),

  recordViolation: (userId, type = "default") =>
    api.post(`/admin/users/${userId}/record-violation`, { type }),

  getViolations: (params = {}) => api.get("/admin/violations", { params }),

  getFlaggedMessages: (params = {}) =>
    api.get("/admin/messages/flagged", { params }),

  getListings: (params = {}) => api.get("/admin/listings", { params }),

  moderateListing: (listingId, data = {}) =>
    api.patch(`/admin/listings/${listingId}/moderation`, data),

  moderateProduct: (listingId, productIndex, data = {}) =>
    api.patch(
      `/admin/listings/${listingId}/products/${productIndex}/moderation`,
      data,
    ),

  approveMessage: (messageId, data = {}) =>
    api.put(`/admin/messages/${messageId}/approve`, data),

  deleteMessage: (messageId, data = {}) =>
    api.delete(`/admin/messages/${messageId}`, { data }),

  warnMessageSender: (messageId, data = {}) =>
    api.post(`/admin/messages/${messageId}/warn-sender`, data),

  getSubscriptionsCancelled: (params = {}) =>
    api.get("/admin/subscriptions/cancelled", { params }),

  manualDowngradeSubscription: (userId, options = {}) =>
    api.post(`/admin/subscriptions/${userId}/downgrade`, options),

  // Payment Management APIs
  getPayments: (params = {}) => api.get("/admin/payments", { params }),

  getPayment: (paymentId) => api.get(`/admin/payments/${paymentId}`),

  verifyPayment: (paymentId) => api.post(`/admin/payments/${paymentId}/verify`),

  refundPayment: (paymentId, reason) =>
    api.post(`/admin/payments/${paymentId}/refund`, { reason }),

  disputePayment: (paymentId, reason, evidence) =>
    api.post(`/admin/payments/${paymentId}/dispute`, { reason, evidence }),

  getPaymentStats: () => api.get("/admin/stats/overview"),

  getPaymentDailyStats: (days = 30) =>
    api.get("/admin/stats/daily", { params: { days } }),

  getPendingPayments: (params = {}) =>
    api.get("/admin/payments/pending", { params }),

  // Agent management
  getAgentApplications: (params = {}) =>
    api.get("/admin/agents/applications", { params }),

  reviewAgentApplication: (id, decision, note = "") =>
    api.post(`/admin/agents/applications/${id}/review`, { decision, note }),

  createAgentPromoCode: (agentId, data) =>
    api.post(`/admin/agents/${agentId}/promo-codes`, data),

  getAgentPromoCodes: (agentId) =>
    api.get(`/admin/agents/${agentId}/promo-codes`),

  getAgentWithdrawals: (params = {}) =>
    api.get("/admin/agents/withdrawals", { params }),

  reviewAgentWithdrawal: (id, decision, note = "") =>
    api.post(`/admin/agents/withdrawals/${id}/review`, { decision, note }),

  // User password reset
  resetUserPassword: (userId, newPassword) =>
    api.post(`/admin/users/${userId}/reset-password`, { newPassword }),
};
