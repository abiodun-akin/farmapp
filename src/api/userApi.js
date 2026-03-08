import api from "../config/api";

// User API endpoints
export const userAPI = {
  signup: (name, email, password, promoCode = null) =>
    api.post("/auth/signup", { name, email, password, promoCode }),

  login: (email, password) => api.post("/auth/login", { email, password }),

  logout: () => api.post("/auth/logout"),
};

// Profile API endpoints
export const userApi = {
  // Auth
  signup: (name, email, password, promoCode = null) =>
    api.post("/auth/signup", { name, email, password, promoCode }),

  login: (email, password) => api.post("/auth/login", { email, password }),

  logout: () => api.post("/auth/logout"),

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

  // Matching
  getMatches: (params = {}) =>
    api.get("/matches", { params }),

  getMatchDetails: (matchId) => api.get(`/matches/${matchId}`),

  expressInterest: (matchId) =>
    api.post(`/matches/${matchId}/express-interest`),

  updateMatchScore: (matchId, scores) =>
    api.put(`/matches/${matchId}/update-score`, scores),

  archiveMatch: (matchId) => api.delete(`/matches/${matchId}`),

  createMatch: (farmerId, vendorId, reason) =>
    api.post("/matches/create-from-interest", { farmerId, vendorId, reason }),

  // Messaging
  sendMessage: (matchId, content) =>
    api.post("/messages/send", { match_id: matchId, content }),

  getConversations: (pagination = {}) =>
    api.get("/messages/conversations", { params: pagination }),

  getMessages: (matchId, pagination = {}) =>
    api.get(`/messages/${matchId}`, { params: pagination }),

  flagMessage: (messageId, reason) =>
    api.put(`/messages/${messageId}/flag`, { reason }),

  getUnreadCount: () => api.get("/messages/stats/unread"),

  // Admin endpoints
  getFlaggedMessages: (pagination = {}) =>
    api.get("/messages/admin/flagged", { params: pagination }),

  approveMessage: (messageId, action) =>
    api.put(`/messages/${messageId}/admin/approve`, { action }),

  getMessageAnalysisStats: () =>
    api.get("/messages/admin/ai-analysis"),

  // Agent endpoints
  applyAsAgent: (data) => api.post("/agents/apply", data),

  getAgentStatus: () => api.get("/agents/me"),

  getPromoCodes: () => api.get("/agents/promo-codes"),

  requestWithdrawal: (data) => api.post("/agents/withdrawals", data),

  getWithdrawals: () => api.get("/agents/withdrawals"),

  cancelWithdrawal: (withdrawalId) =>
    api.delete(`/agents/withdrawals/${withdrawalId}`),
};
