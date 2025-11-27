import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loading: false,
  error: null,
  paymentData: null,
  subscription: null,
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
  clearPaymentError,
} = paymentSlice.actions;

export default paymentSlice.reducer;