import api from "../config/api";

// User API endpoints
export const userAPI = {
  signup: (name, email, password) =>
    api.post("/api/auth/signup", { name, email, password }),

  login: (email, password) => api.post("/api/auth/login", { email, password }),

  logout: () => api.post("/api/auth/logout"),
};

// Profile API endpoints
export const userApi = {
  // Auth
  signup: (name, email, password) =>
    api.post("/api/auth/signup", { name, email, password }),

  login: (email, password) => api.post("/api/auth/login", { email, password }),

  logout: () => api.post("/api/auth/logout"),

  // Profile management
  initializeProfile: (profileType) =>
    api.post("/api/profile/initialize", { profileType }),

  completeFarmerProfile: (profileData) =>
    api.post("/api/profile/farmer", profileData),

  completeVendorProfile: (profileData) =>
    api.post("/api/profile/vendor", profileData),

  getProfile: () => api.get("/api/profile"),

  getPublicProfile: (userId) => api.get(`/api/profile/${userId}`),

  updateProfile: (profileData) => api.put("/api/profile", profileData),

  // Matching
  getMatches: (params = {}) =>
    api.get("/api/matches", { params }),

  getMatchDetails: (matchId) => api.get(`/api/matches/${matchId}`),

  expressInterest: (matchId) =>
    api.post(`/api/matches/${matchId}/express-interest`),

  updateMatchScore: (matchId, scores) =>
    api.put(`/api/matches/${matchId}/update-score`, scores),

  archiveMatch: (matchId) => api.delete(`/api/matches/${matchId}`),

  createMatch: (farmerId, vendorId, reason) =>
    api.post("/api/matches/create-from-interest", { farmerId, vendorId, reason }),

  // Messaging
  sendMessage: (matchId, content) =>
    api.post("/api/messages/send", { match_id: matchId, content }),

  getConversations: (pagination = {}) =>
    api.get("/api/messages/conversations", { params: pagination }),

  getMessages: (matchId, pagination = {}) =>
    api.get(`/api/messages/${matchId}`, { params: pagination }),

  flagMessage: (messageId, reason) =>
    api.put(`/api/messages/${messageId}/flag`, { reason }),

  getUnreadCount: () => api.get("/api/messages/stats/unread"),

  // Admin endpoints
  getFlaggedMessages: (pagination = {}) =>
    api.get("/api/messages/admin/flagged", { params: pagination }),

  approveMessage: (messageId, action) =>
    api.put(`/api/messages/${messageId}/admin/approve`, { action }),

  getMessageAnalysisStats: () =>
    api.get("/api/messages/admin/ai-analysis"),
};
