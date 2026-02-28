import api from "../config/api";

export const paymentAPI = {
  initializePayment: (plan, amount, email) =>
    api.post("/api/payment/initialize", { plan, amount, email }),

  verifyPayment: (reference, plan) =>
    api.post("/api/payment/verify", { reference, plan }),

  handlePaymentSuccess: (reference, plan) =>
    api.post("/api/payment/success", { reference, plan }),

  handlePaymentClose: () =>
    api.post("/api/payment/close"),

  getSubscriptionStatus: () =>
    api.get("/api/payment/subscription"),
};