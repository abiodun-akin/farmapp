import api from "../config/api";

export const paymentAPI = {
  initializePayment: (plan, amount, email) =>
    api.post("/payment/initialize", { plan, amount, email }),

  verifyPayment: (reference, plan) =>
    api.post("/payment/verify", { reference, plan }),

  handlePaymentSuccess: (reference, plan) =>
    api.post("/payment/success", { reference, plan }),

  handlePaymentClose: (reference = null) =>
    api.post("/payment/close", { reference }),

  cancelSubscription: (reason = null) =>
    api.post("/payment/cancel-subscription", { reason }),

  getSubscriptionStatus: () => api.get("/payment/subscription"),
};
