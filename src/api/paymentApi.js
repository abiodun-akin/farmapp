import api from "../config/api";

export const paymentAPI = {
  initializePayment: (plan, amount, email) =>
    api.post("/api/payment/initialize", { plan, amount, email }),

  verifyPayment: (reference) =>
    api.post("/api/payment/verify", { reference }),

  handlePaymentSuccess: (reference, plan) =>
    api.post("/api/payment/success", { reference, plan }),

  handlePaymentClose: () =>
    api.post("/api/payment/close"),
};