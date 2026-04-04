import api, { API_REST_BASE_URL } from "../config/api";

// User API endpoints
export const userAPI = {
  signup: (name, email, password, promoCode = null) =>
    api.post("/auth/signup", { name, email, password, promoCode }),

  login: (email, password) => api.post("/auth/login", { email, password }),

  verifyTwoFactor: (challengeToken, code) =>
    api.post("/auth/2fa/verify", { challengeToken, code }),

  enableTwoFactor: () => api.post("/auth/2fa/enable"),

  disableTwoFactor: () => api.post("/auth/2fa/disable"),

  getRecoveryCodes: () => api.get("/auth/2fa/recovery-codes"),

  regenerateRecoveryCodes: () =>
    api.post("/auth/2fa/recovery-codes/regenerate"),

  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),

  resetPassword: (token, password) =>
    api.post("/auth/reset-password", { token, password }),

  sendVerificationEmail: () => api.post("/auth/send-verification"),

  verifyEmail: (token) => api.post("/auth/verify-email", { token }),

  logout: () => api.post("/auth/logout"),

  getSession: () => api.get("/auth/session"),

  refreshSession: () => api.post("/auth/refresh"),

  getSocialAuthUrl: (provider, mode = "login") =>
    `${API_REST_BASE_URL}/auth/social/${provider}/start?mode=${mode}`,
};

// Profile API endpoints
export const userApi = {
  // Auth
  signup: (name, email, password, promoCode = null) =>
    api.post("/auth/signup", { name, email, password, promoCode }),

  login: (email, password) => api.post("/auth/login", { email, password }),

  verifyTwoFactor: (challengeToken, code) =>
    api.post("/auth/2fa/verify", { challengeToken, code }),

  enableTwoFactor: () => api.post("/auth/2fa/enable"),

  disableTwoFactor: () => api.post("/auth/2fa/disable"),

  getRecoveryCodes: () => api.get("/auth/2fa/recovery-codes"),

  regenerateRecoveryCodes: () =>
    api.post("/auth/2fa/recovery-codes/regenerate"),

  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),

  resetPassword: (token, password) =>
    api.post("/auth/reset-password", { token, password }),

  sendVerificationEmail: () => api.post("/auth/send-verification"),

  verifyEmail: (token) => api.post("/auth/verify-email", { token }),

  logout: () => api.post("/auth/logout"),

  getSession: () => api.get("/auth/session"),

  refreshSession: () => api.post("/auth/refresh"),

  getSocialAuthUrl: (provider, mode = "login") =>
    `${API_REST_BASE_URL}/auth/social/${provider}/start?mode=${mode}`,

  // Profile management
  initializeProfile: (profileType) =>
    api.post("/profile/initialize", { profileType }),

  completeFarmerProfile: (profileData) =>
    api.post("/profile/farmer", profileData),

  completeVendorProfile: (profileData) =>
    api.post("/profile/vendor", profileData),

  getProfile: () => api.get("/profile"),

  getPublicProfile: (userId) => api.get(`/profile/${userId}`),

  updateProfile: (profileData) => api.put("/profile", profileData),

  requestDataExport: () => api.post("/user/request-data"),

  requestAccountDelete: (reason) =>
    api.post("/user/request-delete-account", { reason }),

  // Matching
  getMatches: (params = {}) => api.get("/matches", { params }),

  getMatchDetails: (matchId) => api.get(`/matches/${matchId}`),

  expressInterest: (matchId) =>
    api.post(`/matches/${matchId}/express-interest`),

  updateMatchScore: (matchId, scores) =>
    api.put(`/matches/${matchId}/update-score`, scores),

  archiveMatch: (matchId) => api.delete(`/matches/${matchId}`),

  createMatch: (farmerId, vendorId, reason) =>
    api.post("/matches/create-from-interest", { farmerId, vendorId, reason }),

  // Messaging
  sendMessage: (matchId, content, attachment = null) =>
    api.post("/messages/send", { match_id: matchId, content, attachment }),

  getConversations: (pagination = {}) =>
    api.get("/messages/conversations", { params: pagination }),

  getMessages: (matchId, pagination = {}) =>
    api.get(`/messages/${matchId}`, { params: pagination }),

  searchMessages: (matchId, query, pagination = {}) =>
    api.get(`/messages/${matchId}/search`, {
      params: {
        q: query,
        ...pagination,
      },
    }),

  flagMessage: (messageId, reason) =>
    api.put(`/messages/${messageId}/flag`, { reason }),

  getUnreadCount: () => api.get("/messages/stats/unread"),

  // Subscription lifecycle
  scheduleDowngrade: () => api.post("/payment/downgrade"),

  getInvoices: () => api.get("/payment/invoices"),

  // Admin endpoints
  getFlaggedMessages: (pagination = {}) =>
    api.get("/messages/admin/flagged", { params: pagination }),

  approveMessage: (messageId, action) =>
    api.put(`/messages/${messageId}/admin/approve`, { action }),

  getMessageAnalysisStats: () => api.get("/messages/admin/ai-analysis"),

  // Agent endpoints
  applyAsAgent: (data) => api.post("/agents/apply", data),

  getAgentStatus: () => api.get("/agents/me"),

  getPromoCodes: () => api.get("/agents/promo-codes"),

  requestWithdrawal: (data) => api.post("/agents/withdrawals", data),

  getWithdrawals: () => api.get("/agents/withdrawals"),

  cancelWithdrawal: (withdrawalId) =>
    api.delete(`/agents/withdrawals/${withdrawalId}`),
};
