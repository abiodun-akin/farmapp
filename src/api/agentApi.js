import api from "../config/api";

export const agentApi = {
  // Apply as agent
  applyAsAgent: (data) => api.post("/agents/apply", data),

  // Get agent status
  getAgentStatus: () => api.get("/agents/me"),

  // Get promo codes
  getPromoCodes: () => api.get("/agents/promo-codes"),

  // Request withdrawal
  requestWithdrawal: (data) => api.post("/agents/withdrawals", data),

  // Get withdrawals
  getWithdrawals: () => api.get("/agents/withdrawals"),

  // Cancel withdrawal
  cancelWithdrawal: (withdrawalId) =>
    api.delete(`/agents/withdrawals/${withdrawalId}`),
};

export default agentApi;
