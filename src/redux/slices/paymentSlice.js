import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loading: false,
  error: null,
  paymentData: null,
  verifyResult: null,
  successResult: null,
  closeResult: null,
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
      state.paymentData = null;
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
      state.verifyResult = null;
    },
    verifyPaymentSuccess: (state, action) => {
      state.loading = false;
      state.verifyResult = action.payload;
    },
    verifyPaymentFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.verifyResult = null;
    },

    successPaymentRequest: (state) => {
      state.loading = true;
      state.error = null;
      state.successResult = null;
    },
    successPaymentSuccess: (state, action) => {
      state.loading = false;
      state.successResult = action.payload;
      state.subscription = action.payload?.subscription || state.subscription;
    },
    successPaymentFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.successResult = null;
    },

    closePaymentRequest: (state) => {
      state.loading = true;
      state.error = null;
      state.closeResult = null;
    },
    closePaymentSuccess: (state, action) => {
      state.loading = false;
      state.closeResult = action.payload;
      state.subscription = null;
      state.hasActiveSubscription = false;
    },
    closePaymentFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.closeResult = null;
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
    clearPaymentFlowState: (state) => {
      state.paymentData = null;
      state.verifyResult = null;
      state.successResult = null;
      state.closeResult = null;
      state.loading = false;
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
  successPaymentRequest,
  successPaymentSuccess,
  successPaymentFailure,
  closePaymentRequest,
  closePaymentSuccess,
  closePaymentFailure,
  fetchSubscriptionStatusRequest,
  fetchSubscriptionStatusSuccess,
  fetchSubscriptionStatusFailure,
  clearSubscriptionState,
  clearPaymentError,
  clearPaymentFlowState,
} = paymentSlice.actions;

export default paymentSlice.reducer;