import api from "../config/api";

export const paymentAPI = {
  initializePayment: (plan, amount, email) =>
    api.post("/payment/initialize", { plan, amount, email }),

  verifyPayment: (reference, plan) =>
    api.post("/payment/verify", { reference, plan }),

  handlePaymentSuccess: (reference, plan) =>
    api.post("/payment/success", { reference, plan }),

  handlePaymentClose: () =>
    api.post("/payment/close"),

  getSubscriptionStatus: () =>
    api.get("/payment/subscription"),
};