import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loading: false,
  error: null,
  paymentData: null,
  subscription: null,
  hasActiveSubscription: false,
  hasEverSubscribed: false,
  subscriptionLoading: false,
  subscriptionError: null,
  subscriptionLastFetchedAt: null,
  subscriptionUserId: null,
};

const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    initializePaymentRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    initializePaymentSuccess: (state, action) => {
      state.loading = false;
      state.paymentData = action.payload;
    },
    initializePaymentFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    verifyPaymentRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    verifyPaymentSuccess: (state, action) => {
      state.loading = false;
      state.subscription = action.payload;
    },
    verifyPaymentFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    fetchSubscriptionStatusRequest: (state) => {
      state.subscriptionLoading = true;
      state.subscriptionError = null;
    },
    fetchSubscriptionStatusSuccess: (state, action) => {
      state.subscriptionLoading = false;
      state.subscriptionError = null;
      state.subscription = action.payload?.subscription || null;
      state.hasActiveSubscription = action.payload?.hasActiveSubscription || false;
      state.hasEverSubscribed = action.payload?.hasEverSubscribed || false;
      state.subscriptionLastFetchedAt = Date.now();
      state.subscriptionUserId = action.payload?.userId || null;
    },
    fetchSubscriptionStatusFailure: (state, action) => {
      state.subscriptionLoading = false;
      state.subscriptionError = action.payload;
      state.subscription = null;
      state.hasActiveSubscription = false;
      state.hasEverSubscribed = false;
      state.subscriptionLastFetchedAt = Date.now();
    },

    clearSubscriptionState: (state) => {
      state.subscription = null;
      state.hasActiveSubscription = false;
      state.hasEverSubscribed = false;
      state.subscriptionLoading = false;
      state.subscriptionError = null;
      state.subscriptionLastFetchedAt = null;
      state.subscriptionUserId = null;
    },

    clearPaymentError: (state) => {
      state.error = null;
    },
  },
});

export const {
  initializePaymentRequest,
  initializePaymentSuccess,
  initializePaymentFailure,
  verifyPaymentRequest,
  verifyPaymentSuccess,
  verifyPaymentFailure,
  fetchSubscriptionStatusRequest,
  fetchSubscriptionStatusSuccess,
  fetchSubscriptionStatusFailure,
  clearSubscriptionState,
  clearPaymentError,
} = paymentSlice.actions;

export default paymentSlice.reducer;